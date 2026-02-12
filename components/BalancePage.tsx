import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const BalancePage: React.FC = () => {
  const navigation = useNavigation<any>();

  // SAME DATA (logic untouched)
  const balance = 10000;
  const bankname = 'State Bank of India';
  const accountNumber = 'xxxx xxxx 1234';

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timeoutRef = useRef<any>(null);
  const activeRef = useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      activeRef.current = true;

      const delay = setTimeout(() => {
        speakBalance();
      }, 300);

      return () => {
        clearTimeout(delay);
        stopAll();
      };
    }, [])
  );

  // 🔥 IMPROVED NATURAL SPEECH
  const speakBalance = () => {
    Speech.speak(
      `Here is your account summary. 
       Your available balance is rupees ${balance}. 
       You are banking with ${bankname}. 
       If you would like to return, please say back.`,
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Account Balance</Text>

      <View style={styles.card}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₹ {balance}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.leftText}>Bank</Text>
          <Text style={styles.rightText}>{bankname}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.leftText}>Account No</Text>
          <Text style={styles.rightText}>{accountNumber}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BalancePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
    padding: 20,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  balanceLabel: {
    color: '#5c6ac4',
    fontSize: 14,
  },

  balanceAmount: {
    color: '#1f2937',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  divider: {
    height: 1,
    backgroundColor: '#d6daf0',
    marginVertical: 15,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  leftText: {
    color: '#6b7280',
    fontSize: 14,
  },

  rightText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
});
