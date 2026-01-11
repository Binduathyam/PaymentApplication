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
const [formData, setFormData] = useState<Partial<SignUpFormData>>({
    username: '',
    phone: '',
    email: '',
    
});

const [selectedBank, setSelectedBank] = useState<{ id: number; bankname: string; icon: any } | null>(null);
const [showBankPopup, setShowBankPopup] = useState(false);

const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({
        ...prev,
        [field]: value,
    }));
};

const handleSignUp = () => {
    if (!formData.username || !formData.phone || !formData.email) {
        Alert.alert('Error', 'Please fill all fields');
        return;
    }

    console.log('Sign Up Data:', formData);
    Alert.alert('Success', 'Sign up submitted successfully');
};

const openSlot = () => {
    setShowBankPopup(true);
};

const handleBankSelect = (bank: { id: number; bankname: string; icon: any }) => {
    setSelectedBank(bank);
    // also map into formData.bankAccount so it matches the interface
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

        <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone || ''}
            onChangeText={(text) => handleInputChange('phone', text)}
            keyboardType="phone-pad"
        />

        <View style={styles.banksContainer}>
            <Text style={{ marginBottom: 8 }}>Select bank</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                <TouchableOpacity style={styles.slotBox} onPress={openSlot}>
                    {selectedBank ? (
                        <Image source={selectedBank.icon} style={styles.bankIcon} />
                    ) : (
                        <Text style={styles.plusText}>+</Text>
                    )}
                </TouchableOpacity>
                {selectedBank && (
                    <View style={{ marginLeft: 12, justifyContent: 'center' }}>
                        <Text>{selectedBank.bankname}</Text>
                    </View>
                )}
            </View>
        </View>

        {showBankPopup && (
            <BankPopup
                onSelect={(bank) => handleBankSelect(bank)}
                onClose={() => setShowBankPopup(false)}
            />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
    </View>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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

export default SignUp;