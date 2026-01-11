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

export default function TransactionHistoryPage() {
	const [query, setQuery] = useState('');

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return transactions;
		return transactions.filter((t) =>
			t.username.toLowerCase().includes(q) || t.sendto.toLowerCase().includes(q)
		);
	}, [query]);

	const renderItem = ({ item }: { item: any }) => {
		const date = new Date(item.createdAt);
		const amountColor = item.type === 'received' ? '#2e7d32' : '#c62828';
		const initials = (item.sendto || '')
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

					<Text style={styles.username}>{item.sendto}</Text>

					<Text style={[styles.amount, { color: amountColor }]}>₹{item.amount}</Text>
				</View>

				<View style={styles.cardBottom}>
					<Text style={styles.typeText}>{item.type === 'sent' ? 'Sent' : 'Received'}</Text>
					<Text style={styles.statusText}>Transaction Successful</Text>
					<Text style={styles.dateText}>{date.toLocaleString()}</Text>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.searchRow}>
				<TextInput
					placeholder="Search by name or recipient"
					value={query}
					onChangeText={setQuery}
					style={styles.searchInput}
				/>
				<TouchableOpacity style={styles.searchIconWrap} onPress={() => {}}>
					<Text style={styles.searchIcon}>🔍</Text>
				</TouchableOpacity>
			</View>

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
		padding: 12,
		alignItems: 'center',
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
	searchIconWrap: { marginLeft: 8, padding: 8 },
	searchIcon: { fontSize: 18 },
	card: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#eee',
	},
	cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
	profileCircle: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: '#e0e0e0',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	initials: { fontWeight: '700', color: '#333' },
	username: { flex: 1, fontSize: 16, fontWeight: '600' },
	amount: { fontSize: 16, fontWeight: '700' },
	cardBottom: { flexDirection: 'row', alignItems: 'center' },
	typeText: { flex: 1, color: '#666' },
	statusText: { flex: 1, textAlign: 'center', color: '#2e7d32' },
	dateText: { flex: 1, textAlign: 'right', color: '#888' },
});
