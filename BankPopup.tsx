import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';

import banks from './data/banks.json';

type BankPopupProps = {
  onClose: () => void;
};

export default function BankPopup({ onClose }: BankPopupProps) {
  const bankIcons: { [key: string]: any } = {
    'HDFC Bank': require('./assets/banks/hdfc.png'),
    'ICICI Bank': require('./assets/banks/icici.png'),
    'State Bank of India': require('./assets/banks/sbi.png'),
    'Axis Bank': require('./assets/banks/axis.png'),
    'Kotak Bank': require('./assets/banks/kotak.png'),
    'Punjab National Bank': require('./assets/banks/pnb.png'),
    'Bank of Baroda': require('./assets/banks/bob.png'),
    'Union Bank': require('./assets/banks/union.png'),
    'Yes Bank': require('./assets/banks/yes.png'),
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>Select Bank</Text>

          <FlatList
            data={banks}
            numColumns={3}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                style={styles.box}
                onPress={onClose}
              >
                <Image
                  source={bankIcons[item.bankname]}
                  style={styles.icon}
                />
                <Text style={styles.name}>{item.bankname}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  box: {
    flex: 1,
    margin: 5,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },
});
