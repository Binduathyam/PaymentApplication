import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import BankPopup from './BankPopup';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleLogin = () => {
    if (phone.length === 10) {
      setShowPopup(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter your 10-digit number:</Text>

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter number"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {showPopup && (
        <BankPopup onClose={() => setShowPopup(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#0b5ed7',
    padding: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
