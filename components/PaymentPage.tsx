import React, { useState, useCallback } from 'react';
import {

View,
Text,
FlatList,
TextInput,
TouchableOpacity,
StyleSheet,
SafeAreaView,
Alert,
} from 'react-native';

interface Transaction {
id: number;
userId: string;
username: string;
sendto: string;
sendtoemail: string;
amount: number;
status: string;
type: 'sent' | 'received';
createdAt: string;
}

interface PaymentPageProps {
route?: {
    params?: {
        contactName: string;
        transactions: Transaction[];
    };
};
}

const PaymentPage: React.FC<PaymentPageProps> = ({ route }) => {
const [amount, setAmount] = useState('');
const [transactions, setTransactions] = useState<Transaction[]>(
    route?.params?.transactions || []
);
const contactName = route?.params?.contactName || 'Contact';

const handleSendAmount = useCallback(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter an amount greater than 0');
        return;
    }

    const newTransaction: Transaction = {
        id: transactions.length + 1,
        userId: 'current_user',
        username: 'You',
        sendto: contactName,
        sendtoemail: '',
        amount: numAmount,
        status: 'success',
        type: 'sent',
        createdAt: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
    setAmount('');
    Alert.alert('Success', `Amount ₹${numAmount} sent to ${contactName}`);
}, [amount, transactions, contactName]);

const renderTransaction = ({ item }: { item: Transaction }) => (
    <View
        style={[
            styles.transactionBox,
            item.type === 'sent' ? styles.sentBox : styles.receivedBox,
        ]}
    >
        <View>
            <Text style={styles.amountText}>₹{item.amount.toFixed(2)}</Text>
            <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString()}
            </Text>
        </View>
    </View>
);

return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerText}>{contactName}</Text>
        </View>

        <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
        />

        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
            />
            <TouchableOpacity
                style={[
                    styles.sendButton,
                    !amount || parseFloat(amount) <= 0 ? styles.disabledButton : {},
                ]}
                onPress={handleSendAmount}
                disabled={!amount || parseFloat(amount) <= 0}
            >
                <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
},
header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
},
headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
},
listContainer: {
    padding: 16,
},
transactionBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: '60%',
},
sentBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
},
receivedBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#e3f2fd',
},
amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
},
dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
},
inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
},
input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 14,
},
sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
},
disabledButton: {
    opacity: 0.5,
},
sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
},
});

export default PaymentPage;