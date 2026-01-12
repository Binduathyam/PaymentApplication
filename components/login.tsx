import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();

  // 🔥 AUTO LOGIN WHEN 10 DIGITS ENTERED
  useEffect(() => {
    if (phone.length === 10) {
      navigation.replace('HomePage'); // 👈 direct home
    }
  }, [phone]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter mobile number"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.signupRow}>
        <Text style={styles.smallText}>Don't have an account? </Text>
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('SignUp')}
        >
          Sign up
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  smallText: {
    color: '#444',
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
