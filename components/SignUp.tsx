import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BankPopup from './BankPopup';
import banks from '../data/banks.json';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

type Step = 'name' | 'email' | 'phone' | 'bank';

interface BankAccount {
  Id: number;
  bankname: string;
  accountNumber: string;
}

interface SignUpFormData {
  username: string;
  phone: string;
  email: string;
  bankAccount?: BankAccount;
}

const SignUp: React.FC = () => {
  const navigation = useNavigation<any>();

  const [formData, setFormData] = useState<SignUpFormData>({
    username: '',
    phone: '',
    email: '',
  });

  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [showBankPopup, setShowBankPopup] = useState(false);

  const stepRef = useRef<Step>('name');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timeoutRef = useRef<any>(null);
  const activeRef = useRef(true);

  // 🔥 Screen Focus
  useFocusEffect(
    useCallback(() => {
      activeRef.current = true;
      stepRef.current = 'name';

      const delay = setTimeout(() => {
        speak("Sign up page. Please say your full name.");
      }, 400);

      return () => {
        cleanupAll();
      };
    }, [])
  );

  const speak = (message: string, callback?: () => void) => {
    Speech.stop();
    Speech.speak(message, {
      onDone: () => {
        if (callback) callback();
        else startListening();
      },
    });
  };

  const startListening = async () => {
    if (!activeRef.current) return;

    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Microphone permission denied");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;

      timeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 6000);

    } catch (error) {
      console.log("Recording error:", error);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    clearTimeout(timeoutRef.current);

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;

    if (uri && activeRef.current) {
      sendToBackend(uri);
    }
  };

  const sendToBackend = async (uri: string) => {
    try {
      const form = new FormData();
      form.append("audio", {
        uri,
        name: "speech.m4a",
        type: "audio/m4a",
      } as any);

      const res = await fetch("http://172.23.4.188:5000/stt", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.status === "success" && activeRef.current) {
        handleVoice(data.text.toLowerCase().trim());
      } else {
        speak("I did not understand. Please repeat.");
      }

    } catch (e) {
      speak("Network error. Please try again.");
    }
  };

  const handleVoice = (voice: string) => {

    if (stepRef.current === 'name') {
      setFormData(prev => ({ ...prev, username: voice }));
      stepRef.current = 'email';
      speak("Please say your email address.");
      return;
    }

    if (stepRef.current === 'email') {

      let cleanEmail = voice
        .replace(/ at /g, '@')
        .replace(/ dot /g, '.')
        .replace(/\s+/g, '');

      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(cleanEmail)) {
        speak("Invalid email. Please repeat.");
        return;
      }

      setFormData(prev => ({ ...prev, email: cleanEmail }));
      stepRef.current = 'phone';
      speak("Please say your 10 digit phone number.");
      return;
    }

    if (stepRef.current === 'phone') {

      const digits = voice.replace(/\D/g, '');

      if (digits.length !== 10) {
        speak("Phone number must be 10 digits. Please repeat.");
        return;
      }

      setFormData(prev => ({ ...prev, phone: digits }));
      stepRef.current = 'bank';

      setShowBankPopup(true);
      speak("Please say or select your bank.");
      return;
    }

    if (stepRef.current === 'bank') {

      const matched = banks.find((bank: any) =>
        voice.includes(bank.bankname.toLowerCase())
      );

      if (matched) {
        completeSignup(matched);
      } else {
        speak("Bank not recognized. Please repeat.");
      }
    }
  };

  const completeSignup = (bank: any) => {

    const bankWithIcon = {
      ...bank,
      icon: getBankIcon(bank.id),
    };

    setSelectedBank(bankWithIcon);
    setShowBankPopup(false);

    setFormData(prev => ({
      ...prev,
      bankAccount: {
        Id: bank.id,
        bankname: bank.bankname,
        accountNumber: '',
      },
    }));

    speak("Sign up successful.", () => {
      navigation.navigate("Login");
    });
  };

  const getBankIcon = (id: number) => {
    switch (id) {
      case 1: return require('../assets/banks/hdfc.png');
      case 2: return require('../assets/banks/icici.png');
      case 3: return require('../assets/banks/sbi.png');
      case 4: return require('../assets/banks/axis.png');
      case 5: return require('../assets/banks/kotak.png');
      case 6: return require('../assets/banks/pnb.png');
      case 7: return require('../assets/banks/bob.png');
      case 8: return require('../assets/banks/union.png');
      case 9: return require('../assets/banks/yes.png');
      default: return null;
    }
  };

  const cleanupAll = async () => {
    activeRef.current = false;

    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }

    clearTimeout(timeoutRef.current);
    Speech.stop();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput style={styles.input} placeholder="Full Name" value={formData.username} />
      <TextInput style={styles.input} placeholder="Email" value={formData.email} />
      <TextInput style={styles.input} placeholder="Phone Number" value={formData.phone} />

      <View style={styles.banksContainer}>
        <Text style={{ marginBottom: 8 }}>Select bank</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.slotBox} onPress={() => setShowBankPopup(true)}>
            {selectedBank ? (
              <Image source={selectedBank.icon} style={styles.bankIcon} />
            ) : (
              <Text style={styles.plusText}>+</Text>
            )}
          </TouchableOpacity>

          {selectedBank && (
            <View style={{ marginLeft: 12 }}>
              <Text>{selectedBank.bankname}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {showBankPopup && (
        <BankPopup
          onSelect={completeSignup}
          onClose={() => setShowBankPopup(false)}
        />
      )}
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  banksContainer: { marginBottom: 15 },
  slotBox: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' },
  plusText: { fontSize: 28, color: '#007AFF' },
  bankIcon: { width: 56, height: 56, resizeMode: 'contain' },
});
