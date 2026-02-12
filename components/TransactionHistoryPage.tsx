import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import transactions from '../data/transactions.json';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

type FilterType = 'all' | 'last3' | 'credited' | 'debited';

export default function TransactionHistoryPage() {
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timeoutRef = useRef<any>(null);
  const activeRef = useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      activeRef.current = true;

      const delay = setTimeout(() => {
        speakIntro();
      }, 300);

      return () => {
        clearTimeout(delay);
        stopAll();
      };
    }, [])
  );

  const speakIntro = () => {
    Speech.speak(
      "Transaction history page opened. Say last three, credited, debited, search name or say back.",
      { onDone: startListening }
    );
  };

  const startListening = async () => {
    if (!activeRef.current) return;

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recordingRef.current = recording;

    timeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 10000);
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    clearTimeout(timeoutRef.current);

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;

    if (uri) sendToBackend(uri);
  };

  const sendToBackend = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append("audio", {
        uri,
        name: "speech.m4a",
        type: "audio/m4a",
      } as any);

      const res = await fetch("http://172.23.4.188:5000/stt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        handleVoice(data.text.toLowerCase());
      } else {
        retry();
      }
    } catch {
      retry();
    }
  };

  const handleVoice = (text: string) => {
    if (text.includes("back")) {
      Speech.speak("Going back", {
        onDone: () => navigation.goBack(),
      });
      return;
    }

    if (text.includes("last three")) {
      setFilter('last3');
      Speech.speak("Showing last three transactions", { onDone: startListening });
      return;
    }

    if (text.includes("credited")) {
      setFilter('credited');
      Speech.speak("Showing credited transactions", { onDone: startListening });
      return;
    }

    if (text.includes("debited")) {
      setFilter('debited');
      Speech.speak("Showing debited transactions", { onDone: startListening });
      return;
    }

    if (text.includes("clear")) {
      setFilter('all');
      Speech.speak("Filter cleared", { onDone: startListening });
      return;
    }

    setQuery(text);
    Speech.speak(`Searching for ${text}`, { onDone: startListening });
  };

  const retry = () => {
    Speech.speak("I did not understand. Please say again.", {
      onDone: startListening,
    });
  };

  const stopAll = async () => {
    activeRef.current = false;
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }
    clearTimeout(timeoutRef.current);
    Speech.stop();
  };

  const filtered = useMemo(() => {
    let data = [...transactions];

    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (t: any) =>
          t.username.toLowerCase().includes(q) ||
          t.sendto.toLowerCase().includes(q)
      );
    }

    if (filter === 'credited') {
      data = data.filter((t: any) => t.type === 'received');
    }

    if (filter === 'debited') {
      data = data.filter((t: any) => t.type === 'sent');
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

          <View style={{ width: 12 }} />

          <Text style={styles.username}>{item.sendto}</Text>

          <Text style={[styles.amount, { color: amountColor }]}>
            ₹{item.amount}
          </Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.typeText}>
            {item.type === 'sent' ? 'Sent' : 'Received'}
          </Text>
          <Text style={styles.statusText}>Successful</Text>
          <Text style={styles.dateText}>{date.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search by name"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />

        <TouchableOpacity
          style={styles.filterBtnTop}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterBox}>
          <TouchableOpacity
            style={styles.filterItem}
            onPress={() => { setFilter('last3'); setShowFilters(false); }}
          >
            <Text>Last 3 Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterItem}
            onPress={() => { setFilter('credited'); setShowFilters(false); }}
          >
            <Text>Credited</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterItem}
            onPress={() => { setFilter('debited'); setShowFilters(false); }}
          >
            <Text>Debited</Text>
          </TouchableOpacity>
        </View>
      )}

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
  container: { flex: 1, backgroundColor: '#f8f9fa' },

  searchRow: {
    flexDirection: 'row',
    padding: 12,
  },

  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },

  filterBtnTop: {
    marginLeft: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#eee',
  },

  filterBtnText: { fontWeight: '600' },

  filterBox: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },

  filterItem: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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

  initials: { fontWeight: '700' },

  username: { flex: 1, fontWeight: '600' },

  amount: { fontWeight: '700' },

  cardBottom: { flexDirection: 'row' },

  typeText: { flex: 1, color: '#666' },

  statusText: { flex: 1, textAlign: 'center', color: '#2e7d32' },

  dateText: { flex: 1, textAlign: 'right', color: '#888' },
}); 
