    import React, { useMemo, useState } from 'react';
    import {
        View,
        Text,
        TextInput,
        FlatList,
        TouchableOpacity,
        StyleSheet,
        Alert,
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
        const contacts = contactsData as unknown as ContactDetails[];
        const [query, setQuery] = useState('');
        const navigation = useNavigation<any>();

        const filtered = useMemo(() => {
            const q = query.trim().toLowerCase();
            if (!q) return contacts;
            return contacts.filter((c) =>
                c.name.toLowerCase().includes(q) || c.mobilenumber.toLowerCase().includes(q)
            );
        }, [query, contacts]);

        const onPay = (contact: ContactDetails) => {
            // For now show an alert with contact details; replace with navigation or payment flow as needed
            Alert.alert('Pay', `Send payment to ${contact.name} (${contact.mobilenumber})`);
        };

        const renderItem = ({ item }: { item: ContactDetails }) => {
            const initials = item.name
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('');

            return (
                <View style={styles.card}>
                    <View style={styles.cardLeft}>
                                <TouchableOpacity onPress={() => navigation.navigate('PaymentPage', { mobile: item.mobilenumber })}>
                                    <View style={styles.profileCircle}>
                                        <Text style={styles.initials}>{initials}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                    <View style={styles.cardMiddle}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.mobile}>{item.mobilenumber}</Text>
                    </View>

                    <View style={styles.cardRight}>
                        <TouchableOpacity style={styles.payBtn} onPress={() => onPay(item)}>
                            <Text style={styles.payText}>Pay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        };

        return (
            <View style={styles.container}>
                <View style={styles.searchRow}>
                    <TextInput
                        placeholder="Search contacts by name or number"
                        value={query}
                        onChangeText={setQuery}
                        style={styles.searchInput}
                    />
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
        cardLeft: { width: 56, alignItems: 'center', justifyContent: 'center' },
        profileCircle: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#e0e0e0',
            justifyContent: 'center',
            alignItems: 'center',
        },
        initials: { fontWeight: '700', color: '#333' },
        cardMiddle: { flex: 1, paddingHorizontal: 12 },
        name: { fontSize: 16, fontWeight: '600' },
        mobile: { color: '#666', marginTop: 4 },
        cardRight: { width: 80, alignItems: 'flex-end' },
        payBtn: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
        payText: { color: '#fff', fontWeight: '600' },
    });