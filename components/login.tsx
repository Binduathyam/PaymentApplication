import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BankPopup from './BankPopup';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    if (phone.length !== 10) {
      Alert.alert('Error', 'Enter valid 10-digit number');
      return;
    }
    setShowPopup(true);
  };

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      {/* Bank Popup */}
      {showPopup && (
        <BankPopup
          onSelect={() => {
            setShowPopup(false);
            navigation.navigate('SignUp');
          }}
          onClose={() => setShowPopup(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 15 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});