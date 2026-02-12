import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export default function Login() {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();

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
    Speech.stop();

    Speech.speak(
      "Welcome. Say your ten digit mobile number or say sign up.",
      {
        onDone: () => startListening(),
      }
    );
  };

  const startListening = async () => {
    if (!activeRef.current) return;

    try {
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

    } catch (err) {
      console.log("Recording error:", err);
    }
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
        handleVoice(data.text);
      } else {
        retry();
      }
    } catch (error) {
      retry();
    }
  };

  const handleVoice = (voiceRaw: string) => {
    console.log("Recognized:", voiceRaw);

    let cleaned = voiceRaw
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

    cleaned = cleaned
      .replace("sign app", "signup")
      .replace("sign up", "signup")
      .replace("sinup", "signup")
      .replace("signap", "signup");

    if (cleaned.includes("signup")) {
      Speech.speak("Opening sign up page", {
        onDone: () => navigation.navigate("SignUp"),
      });
      return;
    }

    const digits = cleaned.replace(/\D/g, '');

    if (digits.length >= 10) {
      const phoneNumber = digits.slice(0, 10);
      setPhone(phoneNumber);

      Speech.speak("Login successful", {
        onDone: () =>
          navigation.replace("HomePage", { phone: phoneNumber }),
      });

      return;
    }

    if (digits.length > 0) {
      setPhone(digits);
      retry();
      return;
    }

    retry();
  };

  const retry = () => {
    if (!activeRef.current) return;

    Speech.speak("Please repeat clearly.", {
      onDone: () => startListening(),
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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter mobile number"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.signupRow}>
        <Text>Don't have an account? </Text>
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('SignUp')}
        >
          Sign Up
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  link: {
    color: '#007bff',
    fontWeight: '600',
  },
});
