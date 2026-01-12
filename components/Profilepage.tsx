import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ProfilePage = () => {
  const user = {
    username: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul.sharma92@gmail.com',
    bankAccount: {
      bankname: 'State Bank of India',
      accountNumber: 'xxxxxxxx1234',
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.profileHeader}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{user.username}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{user.phone}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Bank Name</Text>
        <Text style={styles.value}>{user.bankAccount.bankname}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Account Number</Text>
        <Text style={styles.value}>{user.bankAccount.accountNumber}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },

  /* 👇 FIX IS HERE */
  profileHeader: {
    marginBottom: 24,
    paddingVertical: 16,
    alignItems: 'center',   // 👈 centers the heading
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',    // 👈 extra safety
  },

  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  label: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '600',
  },

  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default ProfilePage;
