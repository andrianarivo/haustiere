import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Alert, Image } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { View, Text, TouchableOpacity } from '../../components/Themed';
import { useAuth } from '../../contexts/AuthContext';

interface Cat {
  id: number;
  name: string;
  breed: string;
  age: number;
}

export default function CatsScreen() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    fetchCats();
  }, []);

  async function fetchCats() {
    try {
      console.log('Fetching cats with token:', token);
      const response = await fetch('http://192.168.88.2:3000/cats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        console.log('Response not OK:', await response.text());
        throw new Error('Failed to fetch cats');
      }
      
      const responseData = await response.json();
      setCats(responseData.data);
      
    } catch (error) {
      console.error('Error fetching cats:', error);
      Alert.alert('Error', 'Failed to load cats');
    }
  }

  async function handleBuy(catId: number) {
    try {
      setIsLoading(true);
      
      // Get the payment intent
      const response = await fetch('http://192.168.88.2:3000/payments/create-intent/' + catId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to create payment intent');
      
      const { clientSecret } = await response.json();

      // Initialize the Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Haustiere',
      });

      if (initError) {
        console.error('Error initializing payment sheet:', initError);
        Alert.alert('Error', 'Could not initialize payment');
        return;
      }

      // Present the Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error('Error presenting payment sheet:', paymentError);
        Alert.alert('Error', paymentError.message);
        return;
      }

      // Payment successful
      Alert.alert('Success', 'Payment successful! The cat is yours!');
      // Refresh the cats list
      fetchCats();
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  }

  const renderCatItem = ({ item }: { item: Cat }) => (
    <View style={styles.catCard}>
      <View style={styles.catInfo}>
        <Text style={styles.catName}>{item.name}</Text>
        <Text style={styles.catDetails}>
          {item.breed} • {item.age} years old
        </Text>
        <TouchableOpacity
          style={[styles.buyButton, isLoading && styles.buttonDisabled]}
          onPress={() => handleBuy(item.id)}
          disabled={isLoading}
        >
          <Text style={styles.buyButtonText}>
            {isLoading ? 'Processing...' : 'Adopt Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cats}
        renderItem={renderCatItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.catName}>No cats available</Text>}
        onViewableItemsChanged={info => {
          console.log('Viewable items:', info.viewableItems.length);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  catCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  catImage: {
    width: '100%',
    height: 200,
  },
  catInfo: {
    padding: 16,
  },
  catName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  catDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 