import { Body, Controller, Post, Headers, Req, UseGuards, Param, ParseIntPipe, RawBodyRequest, BadRequestException, Get, Query, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-session/:catId')
  async createCheckoutSession(
    @Param('catId', ParseIntPipe) catId: number,
  ) {
    return this.stripeService.createCheckoutSession(catId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-intent/:catId')
  async createPaymentIntent(
    @Param('catId', ParseIntPipe) catId: number,
  ) {
    return this.stripeService.createPaymentIntent(catId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!request.rawBody) {
      throw new BadRequestException('No raw body found in request');
    }
    return this.stripeService.handleWebhookEvent(signature, request.rawBody);
  }
}

@Controller()
export class PaymentResultController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('success')
  async handleSuccess(@Query('session_id') sessionId: string, @Res() res: Response) {
    const session = await this.stripeService.retrieveSession(sessionId);
    const catId = session.metadata?.catId;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f0f2f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              max-width: 500px;
              width: 90%;
              overflow: clip;
            }
            h1 { color: #32a852; margin-bottom: 1rem; }
            p { color: #666; line-height: 1.5; }
            .icon {
              font-size: 48px;
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>Payment Successful!</h1>
            <p>Thank you for your purchase. Your cat (ID: ${catId}) adoption payment has been processed successfully.</p>
            <p>Session ID: ${sessionId}</p>
            <p>We'll be in touch shortly with next steps for your cat adoption process.</p>
          </div>
        </body>
      </html>
    `;

    res.send(html);
  }

  @Get('cancel')
  async handleCancel(@Res() res: Response) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Cancelled</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f0f2f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              max-width: 500px;
              width: 90%;
              overflow: clip;
            }
            h1 { color: #dc3545; margin-bottom: 1rem; }
            p { color: #666; line-height: 1.5; }
            .icon {
              font-size: 48px;
              margin-bottom: 1rem;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 1rem;
            }
            .button:hover {
              background-color: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Payment Cancelled</h1>
            <p>Your payment was cancelled. No charges were made.</p>
            <p>If you'd like to try again or have any questions, please don't hesitate to contact us.</p>
            <a href="/" class="button">Return to Home</a>
          </div>
        </body>
      </html>
    `;

    res.send(html);
  }
} 
