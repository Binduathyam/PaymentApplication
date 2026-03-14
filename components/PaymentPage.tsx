import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Keyboard
} from "react-native";

import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { useFocusEffect } from "@react-navigation/native";

interface Transaction {
  id: number;
  amount: number;
  type: "sent";
  createdAt: string;
}

const SERVER = "http://10.230.164.188:5000";

const PaymentPage = ({ route, navigation }: any) => {

  const contactName = route?.params?.contactName ?? "Contact";

  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timeoutRef = useRef<any>(null);
  const activeRef = useRef(true);


  /* HEADER */

  useEffect(() => {
    navigation.setOptions({
      title: contactName
    });
  }, [contactName]);


  /* PAGE OPEN */

  useFocusEffect(
    React.useCallback(() => {

      activeRef.current = true;

      const delay = setTimeout(() => {
        speakInstruction();
      }, 300);

      return () => {
        clearTimeout(delay);
        stopAll();
      };

    }, [])
  );


  /* SPEAK START MESSAGE */

  const speakInstruction = () => {

    Speech.stop();

    Speech.speak(
      `Payment screen. Say amount to send to ${contactName} or say go back.`,
      {
        onDone: startListening
      }
    );

  };


  /* AFTER PAYMENT ASK AGAIN */

  const askNextAction = () => {

    Speech.speak(
      `Transaction completed. Say another amount to send to ${contactName} or say go back.`,
      {
        onDone: startListening
      }
    );

  };


  /* START RECORDING */

  const startListening = async () => {

    if (!activeRef.current) return;

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recordingRef.current = recording;

    timeoutRef.current = setTimeout(stopRecording, 5000);

  };


  /* STOP RECORDING */

  const stopRecording = async () => {

    if (!recordingRef.current) return;

    clearTimeout(timeoutRef.current);

    await recordingRef.current.stopAndUnloadAsync();

    const uri = recordingRef.current.getURI();

    recordingRef.current = null;

    if (uri) sendToBackend(uri);

  };


  /* SEND AUDIO TO BACKEND */

  const sendToBackend = async (uri: string) => {

    try {

      const formData = new FormData();

      formData.append("audio", {
        uri,
        name: "speech.m4a",
        type: "audio/m4a"
      } as any);

      const res = await fetch(`${SERVER}/stt`, {
        method: "POST",
        body: formData
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


  /* HANDLE VOICE */

  const handleVoice = (text: string) => {

    const voice = text.toLowerCase();


    /* GO BACK */

    if (
      voice.includes("back") ||
      voice.includes("go back") ||
      voice.includes("goback")
    ) {

      Speech.speak("Returning to previous screen.", {
        onDone: () => navigation.goBack()
      });

      return;

    }


    /* EXTRACT NUMBER */

    const digits = voice.replace(/\D/g, "");

    if (digits) {

      const num = parseFloat(digits);

      setAmount(digits);

      processPayment(num);

      return;

    }

    retry();

  };


  /* PAYMENT LOGIC */

  const processPayment = (num: number) => {

    setTransactions(prev => [
      ...prev,
      {
        id: prev.length + 1,
        amount: num,
        type: "sent",
        createdAt: new Date().toISOString(),
      },
    ]);

    Speech.speak(
      `Payment of ${num} rupees sent to ${contactName}.`,
      {
        onDone: askNextAction
      }
    );

    setAmount("");
    Keyboard.dismiss();

  };


  /* RETRY */

  const retry = () => {

    Speech.speak(
      "Please say the amount again or say go back.",
      {
        onDone: startListening
      }
    );

  };


  /* STOP */

  const stopAll = async () => {

    activeRef.current = false;

    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }

    clearTimeout(timeoutRef.current);

    Speech.stop();

  };


  /* MANUAL PAYMENT */

  const handlePay = () => {

    const num = parseFloat(amount);

    if (!num || num <= 0) return;

    processPayment(num);

  };


  return (

    <SafeAreaView style={styles.container}>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={({ item }) => (

          <View style={styles.transaction}>

            <Text style={styles.amount}>
              ₹{item.amount}
            </Text>

            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>

          </View>

        )}
      />


      <View style={styles.inputBar}>

        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePay}
        >
          <Text style={styles.payText}>Pay</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>

  );

};

export default PaymentPage;


const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#f5f5f5"
  },

  transaction:{
    alignSelf:"flex-end",
    backgroundColor:"#e8f5e9",
    padding:12,
    borderRadius:10,
    marginBottom:10,
    maxWidth:"70%"
  },

  amount:{
    fontSize:16,
    fontWeight:"700"
  },

  date:{
    fontSize:12,
    color:"#666",
    marginTop:4
  },

  inputBar:{
    position:"absolute",
    bottom:0,
    left:0,
    right:0,
    flexDirection:"row",
    padding:12,
    backgroundColor:"#fff",
    borderTopWidth:1,
    borderColor:"#ddd"
  },

  input:{
    flex:1,
    borderWidth:1,
    borderColor:"#ccc",
    borderRadius:8,
    paddingHorizontal:12,
    marginRight:8
  },

  payBtn:{
    backgroundColor:"#0B5ED7",
    paddingHorizontal:20,
    borderRadius:8,
    justifyContent:"center"
  },

  payText:{
    color:"#fff",
    fontWeight:"600"
  }

});