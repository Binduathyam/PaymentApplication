import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const ProfilePage = () => {
  const navigation = useNavigation<any>();

  const user = {
    username: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul.sharma92@gmail.com',
    bankAccount: {
      bankname: 'State Bank of India',
      accountNumber: 'xxxxxxxx1234',
    },
  };

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timeoutRef = useRef<any>(null);
  const activeRef = useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      activeRef.current = true;

      const delay = setTimeout(() => {
        speakProfile();
      }, 300);

      return () => {
        clearTimeout(delay);
        stopAll();
      };
    }, [])
  );

  // 🔥 ONLY VOICE SENTENCE UPDATED
  const speakProfile = () => {
    const spokenAccount = user.bankAccount.accountNumber
      .split('')
      .join(' ');

    Speech.speak(
      `Here are your profile details. 
       Your name is ${user.username}. 
       Your registered phone number is ${user.phone}. 
       Your email address is ${user.email}. 
       You are banking with ${user.bankAccount.bankname}. 
       Your account number is ${spokenAccount}. 
       To return to the previous screen, please say back.`,
      {
        onDone: () => {
          startListening();
        },
      }
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
      const voice = data.text.toLowerCase();

      if (
        voice.includes("back") ||
        voice.includes("go back") ||
        voice.includes("goback")
      ) {
        Speech.speak("Returning to previous screen.", {
          onDone: () => navigation.goBack(),
        });
        return;
      }
    }

    retry();
  };

  const retry = () => {
    Speech.speak("Please say back if you would like to return.", {
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

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.profileHeader}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* CARD STYLE SECTIONS */}
      <View style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{user.username}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{user.phone}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Bank Name</Text>
        <Text style={styles.value}>{user.bankAccount.bankname}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Account Number</Text>
        <Text style={styles.value}>{user.bankAccount.accountNumber}</Text>
      </View>

    </ScrollView>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },

  profileHeader: {
    marginBottom: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    marginBottom: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  label: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: '600',
  },

  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
});
