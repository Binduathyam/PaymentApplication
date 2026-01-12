import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const BalancePage: React.FC = () => {
  const userData = {
    bankname: 'State Bank of India',
    accountNumber: 'xxxx xxxx 1234',
    balance: 22,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>Account Balance</Text>

      {/* BALANCE CARD */}
      <View style={styles.card}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₹ {userData.balance}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.leftText}>Bank</Text>
          <Text style={styles.rightText}>{userData.bankname}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.leftText}>Account No</Text>
          <Text style={styles.rightText}>{userData.accountNumber}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BalancePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',   // light background
    padding: 20,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#eef2ff',   // soft light blue
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  balanceLabel: {
    color: '#5c6ac4',            // muted indigo
    fontSize: 14,
  },

  balanceAmount: {
    color: '#1f2937',            // dark grey
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  divider: {
    height: 1,
    backgroundColor: '#d6daf0',
    marginVertical: 15,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  leftText: {
    color: '#6b7280',
    fontSize: 14,
  },

  rightText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
});
