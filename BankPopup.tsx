import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import banks from './data/banks.json';

type Props = {
  onSelect: () => void;
  onClose: () => void;
};

export default function BankPopup({ onSelect, onClose }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <Text style={styles.title}>Select Bank</Text>

        <FlatList
          data={banks}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.box} onPress={onSelect}>
              <Image
                style={styles.icon}
              />
              <Text style={styles.name}>{item.bankname}</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={{ color: '#fff' }}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: { width: '90%', backgroundColor: '#fff', padding: 15 },
  title: { textAlign: 'center', fontSize: 18, marginBottom: 10 },
  box: {
    flex: 1, margin: 5, padding: 10,
    alignItems: 'center', backgroundColor: '#eee',
  },
  icon: { width: 40, height: 40, resizeMode: 'contain' },
  name: { fontSize: 11, marginTop: 5, textAlign: 'center' },
  closeBtn: {
    marginTop: 10, backgroundColor: '#007bff',
    padding: 10, alignItems: 'center',
  },
});
