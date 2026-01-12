import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CreditCard, History, Wallet, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const HomePage: React.FC = () => {
    const navigation = useNavigation<any>();
    const menuItems = [
        { icon: CreditCard, label: 'Pay', color: '#FF6B6B', navigation: 'listOfContacts' },
        { icon: History, label: 'History', color: '#4ECDC4', navigation: 'TransactionHistory' },
        { icon: Wallet, label: 'Balance', color: '#45B7D1', navigation: 'Balance' },
        { icon: User, label: 'Profile', color: '#FFA07A', navigation: 'profilePage' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome</Text>
            <View style={styles.gridContainer}>
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.box, { borderTopColor: item.color }]}
                            onPress={() => {
                               navigation.navigate(item.navigation);
                            }}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                                <Icon size={40} color="#fff" strokeWidth={1.5} />
                            </View>
                            <Text style={styles.label}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
        paddingTop: 40,
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center', 
            },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    box: {
        width: '48%',
        aspectRatio: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderTopWidth: 4,
        marginBottom: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize',
    },
});

export default HomePage;