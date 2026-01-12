import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BankPopup from './BankPopup';

interface BankAccount {
  Id: number;
  bankname: string;
  accountNumber: string;
}

interface SignUpFormData {
  id: number;
  username: string;
  phone: string;
  email: string;
  bankAccount: BankAccount;
}

const SignUp: React.FC = () => {
  const navigation = useNavigation<any>();

  const [formData, setFormData] = useState<Partial<SignUpFormData>>({
    username: '',
    phone: '',
    email: '',
  });

  const [selectedBank, setSelectedBank] = useState<{
    id: number;
    bankname: string;
    icon: any;
  } | null>(null);

  const [showBankPopup, setShowBankPopup] = useState(false);

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🔥 ONLY NUMBERS + MAX 10 DIGITS
  const handlePhoneChange = (text: string) => {
    const onlyNumbers = text.replace(/[^0-9]/g, '');
    if (onlyNumbers.length <= 10) {
      handleInputChange('phone', onlyNumbers);
    }
  };

  const handleSignUp = () => {
    if (!formData.username || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (formData.phone.length !== 10) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits');
      return;
    }

    if (!selectedBank) {
      Alert.alert('Error', 'Please select a bank');
      return;
    }

    console.log('Sign Up Data:', formData);

    Alert.alert(
      'Success',
      'Sign up submitted successfully',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ],
      { cancelable: false }
    );
  };

  const handleBankSelect = (bank: { id: number; bankname: string; icon: any }) => {
    setSelectedBank(bank);
    setFormData((prev) => ({
      ...prev,
      bankAccount: {
        Id: bank.id,
        bankname: bank.bankname,
        accountNumber: '',
      },
    }));
    setShowBankPopup(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.username || ''}
        onChangeText={(text) => handleInputChange('username', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email || ''}
        onChangeText={(text) => handleInputChange('email', text)}
        keyboardType="email-address"
      />

      {/* 🔥 PHONE NUMBER FIXED */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phone || ''}
        onChangeText={handlePhoneChange}
        keyboardType="number-pad"
        maxLength={10}
      />

      {/* BANK SELECTION */}
      <View style={styles.banksContainer}>
        <Text style={{ marginBottom: 8 }}>Select bank</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.slotBox}
            onPress={() => setShowBankPopup(true)}
          >
            {selectedBank ? (
              <Image source={selectedBank.icon} style={styles.bankIcon} />
            ) : (
              <Text style={styles.plusText}>+</Text>
            )}
          </TouchableOpacity>

          {selectedBank && (
            <View style={{ marginLeft: 12 }}>
              <Text>{selectedBank.bankname}</Text>
            </View>
          )}
        </View>
      </View>

      {showBankPopup && (
        <BankPopup
          onSelect={handleBankSelect}
          onClose={() => setShowBankPopup(false)}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  banksContainer: {
    marginBottom: 15,
  },
  slotBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  plusText: {
    fontSize: 28,
    color: '#007AFF',
  },
  bankIcon: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
});
