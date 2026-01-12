import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Keyboard,
  Animated,
} from 'react-native';

interface Transaction {
  id: number;
  amount: number;
  type: 'sent' | 'received';
  createdAt: string;
}

const PaymentPage = ({ route, navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const contactName = route?.params?.contactName ?? 'Contact';

  // ✅ SET HEADER TITLE (same font & arrow style)
  useEffect(() => {
    navigation.setOptions({
      title: contactName,
    });
  }, [navigation, contactName]);

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height + 20,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleSendAmount = useCallback(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount');
      return;
    }

    setTransactions(prev => [
      ...prev,
      {
        id: prev.length + 1,
        amount: num,
        type: 'sent',
        createdAt: new Date().toISOString(),
      },
    ]);

    setAmount('');
    Keyboard.dismiss();
  }, [amount]);

  return (
    <SafeAreaView style={styles.container}>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text style={styles.amount}>₹{item.amount}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      />

      {/* INPUT BAR */}
      <Animated.View
        style={[
          styles.inputBar,
          { transform: [{ translateY: Animated.multiply(keyboardOffset, -1) }] },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity style={styles.payBtn} onPress={handleSendAmount}>
          <Text style={styles.payText}>Pay</Text>
        </TouchableOpacity>
      </Animated.View>

    </SafeAreaView>
  );
};

export default PaymentPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  transaction: {
    alignSelf: 'flex-end',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '70%',
  },

  amount: {
    fontSize: 16,
    fontWeight: '700',
  },

  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },

  payBtn: {
    backgroundColor: '#0B5ED7',
    paddingHorizontal: 28,
    borderRadius: 8,
    justifyContent: 'center',
  },

  payText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
