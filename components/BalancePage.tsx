import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BalancePage: React.FC = () => {
    const userData = {
        bankname: "State Bank of India",
        accountNumber: "xxxxxxxx1234",
        balance: 22
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Balance</Text>
            <Text style={styles.label}>Bank Name: {userData.bankname}</Text>
            <Text style={styles.label}>Account Number: {userData.accountNumber}</Text>
            <Text style={styles.label}>Balance: ${userData.balance}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginVertical: 5,
    },
});

export default BalancePage;