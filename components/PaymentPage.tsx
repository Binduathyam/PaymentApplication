import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Animated,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';

interface Transaction {
  id: number;
  amount: number;
  type: 'sent';
  createdAt: string;
}

const PaymentPage = ({ route, navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const contactName = route?.params?.contactName ?? 'Contact';
  const receiverPhone = route?.params?.mobile;
  const senderPhone = route?.params?.phone;

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timeoutRef = useRef<any>(null);
  const activeRef = useRef(true);

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({
      title: contactName,
    });
  }, [navigation, contactName]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height + 20,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      activeRef.current = true;

      const delay = setTimeout(() => {
        Speech.speak(
          `Payment screen. Say amount to send to ${contactName}. Or say back.`,
          { onDone: startListening }
        );
      }, 300);

      return () => stopAll();
    }, [])
  );

  const startListening = async () => {
    if (!activeRef.current) return;

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recordingRef.current = recording;

    timeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 5000);
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

    } catch {
      retry();
    }
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleVoice = (rawVoice: string) => {
    const voice = normalizeText(rawVoice);

    if (voice.includes("back")) {
      Speech.speak("Going back");
      Alert.alert("Navigation", "Going back to previous screen", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      return;
    }

    const digits = voice.replace(/\D/g, '');

    if (digits) {
      const number = parseFloat(digits);
      setAmount(digits);

      Speech.speak(`Sending ${digits} rupees`, {
        onDone: () => handleSendAmount(number),
      });

      return;
    }

    retry();
  };

  const handleSendAmount = async (num: number) => {
    if (isNaN(num) || num <= 0) {
      Speech.speak("Invalid amount");
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    try {
      const response = await fetch("http://172.23.4.188:5000/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_phone: senderPhone,
          receiver_phone: receiverPhone,
          amount: num,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        Speech.speak("Payment successful");
        Alert.alert("Success", "Payment completed successfully!");

        setTransactions(prev => [
          ...prev,
          {
            id: prev.length + 1,
            amount: num,
            type: 'sent',
            createdAt: new Date().toISOString(),
          },
        ]);

        setAmount('');
        Keyboard.dismiss();

      } else {
        Speech.speak("Server error");
        Alert.alert("Payment Failed", "Server error. Please try again.");
      }

    } catch {
      Speech.speak("Server error");
      Alert.alert("Network Error", "Unable to connect to server.");
    }
  };

  const retry = () => {
    if (!activeRef.current) return;

    Speech.speak("Please say amount or say back.", {
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
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text style={styles.amount}>₹{item.amount}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      />

      <Animated.View
        style={[
          styles.inputBar,
          { transform: [{ translateY: Animated.multiply(keyboardOffset, -1) }] },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => handleSendAmount(parseFloat(amount))}
        >
          <Text style={styles.payText}>Pay</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default PaymentPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  transaction: {
    alignSelf: 'flex-end',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '70%',
  },

  amount: { fontSize: 16, fontWeight: '700' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },

  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },

  payBtn: {
    backgroundColor: '#0B5ED7',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },

  payText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
