import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import transactions from '../data/transactions.json';

type FilterType = 'all' | 'last3' | 'credited' | 'debited';

export default function TransactionHistoryPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 🔹 SEARCH + FILTER LOGIC
  const filtered = useMemo(() => {
    let data = [...transactions];

    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (t) =>
          t.username.toLowerCase().includes(q) ||
          t.sendto.toLowerCase().includes(q)
      );
    }

    if (filter === 'credited') {
      data = data.filter((t) => t.type === 'received');
    }

    if (filter === 'debited') {
      data = data.filter((t) => t.type === 'sent');
    }

    if (filter === 'last3') {
      data = data
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 3);
    }

    return data;
  }, [query, filter]);

  // 🔹 FILTER LABEL
  const filterLabel = () => {
    if (filter === 'last3') return 'Last 3 transactions';
    if (filter === 'credited') return 'Credited';
    if (filter === 'debited') return 'Debited';
    return '';
  };

  // 🔹 TRANSACTION CARD
  const renderItem = ({ item }: any) => {
    const date = new Date(item.createdAt);
    const amountColor = item.type === 'received' ? '#2e7d32' : '#c62828';

    const initials = item.sendto
      .split(' ')
      .map((s: string) => s[0])
      .slice(0, 2)
      .join('');

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.profileCircle}>
            <Text style={styles.initials}>{initials}</Text>
          </View>

          <View style={{ width: 16 }} />

          <Text style={styles.username}>{item.sendto}</Text>

          <Text style={[styles.amount, { color: amountColor }]}>
            ₹{item.amount}
          </Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.typeText}>
            {item.type === 'sent' ? 'Sent' : 'Received'}
          </Text>
          <Text style={styles.statusText}>Transaction Successful</Text>
          <Text style={styles.dateText}>{date.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* SEARCH + FILTER */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search by name or recipient"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />

        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtnTop}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ SELECTED FILTER DISPLAY */}
      {filter !== 'all' && (
        <View style={styles.selectedFilterRow}>
          <Text style={styles.selectedFilterText}>
            Selected filter: {filterLabel()}
          </Text>

          <TouchableOpacity onPress={() => setFilter('all')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FILTER OPTIONS */}
      {showFilters && (
        <View style={styles.filterBox}>
          <TouchableOpacity
            style={styles.filterItem}
            onPress={() => {
              setFilter('last3');
              setShowFilters(false);
            }}
          >
            <Text style={styles.filterText}>Last 3 transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterItem}
            onPress={() => {
              setFilter('credited');
              setShowFilters(false);
            }}
          >
            <Text style={styles.filterText}>Credited</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterItem}
            onPress={() => {
              setFilter('debited');
              setShowFilters(false);
            }}
          >
            <Text style={styles.filterText}>Debited</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LIST */}
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
  container: { flex: 1, backgroundColor: '#fff' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  iconBtn: { marginLeft: 6, padding: 6 },
  iconText: { fontSize: 18 },

  filterBtnTop: {
    marginLeft: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filterBtnText: { fontWeight: '600' },

  selectedFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f3f6',
    marginHorizontal: 12,
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  selectedFilterText: {
    fontSize: 13,
    color: '#333',
  },
  clearText: {
    fontSize: 16,
    color: '#555',
  },

  filterBox: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  filterItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { fontWeight: '700', color: '#333' },
  username: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  amount: { fontSize: 16, fontWeight: '700' },

  cardBottom: { flexDirection: 'row', alignItems: 'center' },
  typeText: { flex: 1, color: '#666' },
  statusText: { flex: 1, textAlign: 'center', color: '#2e7d32' },
  dateText: { flex: 1, textAlign: 'right', color: '#888' },
});
