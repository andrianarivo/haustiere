import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-01-27.acacia',
    });
  }

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      throw new BadRequestException(`Error retrieving session: ${error.message}`);
    }
  }

  async createPaymentIntent(catId: number): Promise<{ clientSecret: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 2000, // $20.00 in cents
        currency: 'usd',
        metadata: {
          catId: catId.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      if (!paymentIntent.client_secret) {
        throw new BadRequestException('Failed to create payment intent');
      }

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new BadRequestException(`Error creating payment intent: ${error.message}`);
    }
  }

  async createCheckoutSession(catId: number): Promise<{ url: string }> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not defined');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Cat #${catId}`,
              description: 'Adorable cat for adoption',
            },
            unit_amount: 2000, // $20.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cancel`,
      metadata: {
        catId: catId.toString(),
      },
    });

    if (!session.url) {
      throw new BadRequestException('Failed to create checkout session');
    }

    return { url: session.url };
  }

  async handleWebhookEvent(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }
    
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        let catId: number;
        
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;
          if (!session.metadata?.catId) {
            throw new BadRequestException('No catId found in session metadata');
          }
          catId = parseInt(session.metadata.catId);
        } else {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          if (!paymentIntent.metadata?.catId) {
            throw new BadRequestException('No catId found in payment intent metadata');
          }
          catId = parseInt(paymentIntent.metadata.catId);
        }
        
        // TODO: Update cat status in database
        // TODO: Send confirmation email
        
        return { received: true };
      }
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
} 