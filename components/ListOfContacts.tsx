import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import contactsData from '../data/contacts.json';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';

interface ContactDetails {
  id: number;
  name: string;
  mobilenumber: string;
}

export default function ListOfContacts({ route, navigation }: any) {
  const contacts = contactsData as ContactDetails[];
  const [query, setQuery] = useState('');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timeoutRef = useRef<any>(null);
  const activeRef = useRef(true);

  const userPhone = route?.params?.phone;

  // 🔥 Runs every time page opens
  useFocusEffect(
    React.useCallback(() => {
      activeRef.current = true;

      const delay = setTimeout(() => {
        Speech.speak(
          "Contacts list screen. Say contact name or say back.",
          {
            onDone: startListening,
          }
        );
      }, 300);

      return () => {
        stopAll();
      };
    }, [])
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobilenumber.includes(q)
    );
  }, [query]);

  // 🎤 Start Listening
  const startListening = async () => {
    if (!activeRef.current) return;

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Microphone permission denied");
      return;
    }

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

  // 🛑 Stop Recording
  const stopRecording = async () => {
    if (!recordingRef.current) return;

    clearTimeout(timeoutRef.current);

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;

    if (uri) sendToBackend(uri);
  };

  // 🌐 Send to Backend
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
        processVoice(data.text);
      } else {
        retry();
      }

    } catch (error) {
      console.log("Network error:", error);
      retry();
    }
  };

  // 🧠 Clean Text
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // 🧠 Process Voice
  const processVoice = (rawVoice: string) => {
    const voice = normalizeText(rawVoice);

    console.log("Recognized:", voice);

    // 🔙 Back Commands
    const backWords = ["back", "go back", "exit", "cancel"];

    if (backWords.some(word => voice.includes(word))) {
      Speech.speak("Going back", {
        onDone: () => navigation.goBack(),
      });
      return;
    }

    const words = voice.split(" ");

    // 🔍 Match contact by any word
    const matchedContact = contacts.find((contact) => {
      const name = contact.name.toLowerCase();
      return words.some(word => name.includes(word));
    });

    if (matchedContact) {
      Speech.speak(`Opening ${matchedContact.name}`, {
        onDone: () =>
          navigation.navigate('PaymentPage', {
            contactName: matchedContact.name,
            mobile: matchedContact.mobilenumber,
            phone: userPhone,
          }),
      });
      return;
    }

    retry();
  };

  // 🔁 Retry Loop
  const retry = () => {
    if (!activeRef.current) return;

    Speech.speak(
      "I did not understand. Please say contact name or say back.",
      {
        onDone: startListening,
      }
    );
  };

  // 🛑 Cleanup
  const stopAll = async () => {
    activeRef.current = false;

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }

    clearTimeout(timeoutRef.current);
    Speech.stop();
  };

  const renderItem = ({ item }: { item: ContactDetails }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('PaymentPage', {
          contactName: item.name,
          mobile: item.mobilenumber,
          phone: userPhone,
        })
      }
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.mobile}>{item.mobilenumber}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search contact"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },

  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },

  name: { fontSize: 16, fontWeight: '600' },
  mobile: { color: '#666' },
});
