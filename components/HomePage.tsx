import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CreditCard, History, Wallet, User } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';

const HomePage = ({ route, navigation }: any) => {
  const userPhone = route?.params?.phone;

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timeoutRef = useRef<any>(null);
  const activeRef = useRef(true);

  const [isListening, setIsListening] = useState(false);

  useFocusEffect(
    useCallback(() => {
      activeRef.current = true;
      speakWelcome();

      return () => {
        cleanupAll();
      };
    }, [])
  );

  const cleanupAll = async () => {
    activeRef.current = false;
    clearTimeout(timeoutRef.current);

    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }

    setIsListening(false);
    Speech.stop();
  };

  const speakWelcome = () => {
    Speech.stop();
    Speech.speak(
      "Welcome to your voice based banking assistant. You can say Pay, History, Balance or Profile to continue.",
      {
        onDone: () => {
          if (activeRef.current) startListening();
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
    setIsListening(true);

    timeoutRef.current = setTimeout(() => {
      stopListening();
    }, 10000);
  };

  const stopListening = async () => {
    if (!recordingRef.current) return;

    clearTimeout(timeoutRef.current);

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    setIsListening(false);

    if (uri && activeRef.current) {
      sendToBackend(uri);
    }
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

      if (!activeRef.current) return;

      if (data.status === "success") {
        processCommand(data.text.toLowerCase());
      } else {
        repeat();
      }
    } catch {
      repeat();
    }
  };

  const processCommand = (voice: string) => {
    if (voice.includes("balance")) {
      navigateTo("Balance");
      return;
    }

    if (voice.includes("pay")) {
      navigateTo("listOfContacts");
      return;
    }

    if (voice.includes("history")) {
      navigateTo("TransactionHistory");
      return;
    }

    if (voice.includes("profile")) {
      navigateTo("profilePage");
      return;
    }

    repeat();
  };

  // ✅ ONLY CHANGE HERE (Better Voice Message)
  const navigateTo = (screen: string) => {
    cleanupAll();

    let speakText = "";

    switch (screen) {
      case "listOfContacts":
        speakText = "Opening Pay section";
        break;
      case "TransactionHistory":
        speakText = "Opening Transaction History";
        break;
      case "Balance":
        speakText = "Opening Balance ";
        break;
      case "profilePage":
        speakText = "Opening Profile section";
        break;
      default:
        speakText = "Opening page";
    }

    Speech.speak(speakText, {
      onDone: () => {
        navigation.navigate(screen, { phone: userPhone });
      },
    });
  };

  const repeat = () => {
    Speech.speak(
      "I'm here to help. You can say Pay, History, Balance or Profile.",
      {
        onDone: () => {
          if (activeRef.current) startListening();
        },
      }
    );
  };

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
              onPress={() => navigateTo(item.navigation)}
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

export default HomePage;

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



