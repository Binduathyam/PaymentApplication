import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import contactsData from '../data/contacts.json';

// Contact details interface
interface ContactDetails {
  id: number;
  name: string;
  mobilenumber: string;
}

export default function ListOfContacts() {
  const contacts = contactsData as ContactDetails[];
  const [query, setQuery] = useState('');
  const navigation = useNavigation<any>();

  // 🔍 SEARCH FILTER
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobilenumber.toLowerCase().includes(q)
    );
  }, [query, contacts]);

  const renderItem = ({ item }: { item: ContactDetails }) => {
    const initials = item.name
      .split(' ')
      .map((s) => s[0])
      .slice(0, 2)
      .join('');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('PaymentPage', {
            contactName: item.name,        // 👈 IMPORTANT
            mobile: item.mobilenumber,
          })
        }
      >
        {/* LEFT - PROFILE ICON */}
        <View style={styles.cardLeft}>
          <View style={styles.profileCircle}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        </View>

        {/* MIDDLE - NAME & NUMBER */}
        <View style={styles.cardMiddle}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.mobile}>{item.mobilenumber}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* SEARCH BAR */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search contacts by name or number"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {/* CONTACT LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  searchRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },

  cardLeft: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  initials: {
    fontWeight: '700',
    color: '#333',
  },

  cardMiddle: {
    flex: 1,
    paddingHorizontal: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
  },

  mobile: {
    color: '#666',
    marginTop: 4,
  },
});
