
import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { useFocusEffect } from "@react-navigation/native";

const CORRECT_PIN = "1234";

const VoicePinPage = ({ navigation, route }: any) => {

const [pin, setPin] = useState("");

const recordingRef = useRef<Audio.Recording | null>(null);
const timeoutRef = useRef<any>(null);
const activeRef = useRef(true);

/* CONTACT DETAILS FROM CONTACT LIST */

const contactName = route?.params?.contactName;
const mobile = route?.params?.mobile;
const phone = route?.params?.phone;

/* SCREEN OPEN */

useFocusEffect(
React.useCallback(() => {

  activeRef.current = true;

  const timer = setTimeout(() => {

    Speech.speak(
      "Please say or enter your four digit pin",
      { onDone: startListening }
    );

  }, 300);

  return () => {
    clearTimeout(timer);
    stopAll();
  };

}, [])
);

/* START RECORDING */

const startListening = async () => {

if (!activeRef.current) return;

const permission = await Audio.requestPermissionsAsync();
if (!permission.granted) return;

await Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true
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

  const res = await fetch(
    "http://10.230.164.188:5000/stt",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  if (data.status === "success") {

    const spokenPin = data.text.replace(/\D/g, "");

    /* 🔐 MFCC VOICE VERIFICATION */

    if (!data.voice_verified) {

      Speech.speak(
        "Voice not recognized. Please try again",
        { onDone: startListening }
      );

      return;
    }

    /* PIN CHECK */

    if (spokenPin.length === 4) {

      verifyPin(spokenPin);

    } else {

      retry();

    }

  }

} catch {

  retry();

}

};

/* VERIFY PIN */

const verifyPin = (enteredPin: string) => {

if (enteredPin === CORRECT_PIN) {

  Speech.speak("Pin verified", {

    onDone: () =>
      navigation.replace("PaymentPage", {
        contactName: contactName,
        mobile: mobile,
        phone: phone
      })

  });

}

else {

  setPin("");

  Speech.speak(
    "Wrong pin. Please try again",
    { onDone: startListening }
  );

}

};

/* RETRY VOICE */

const retry = () => {

Speech.speak(
  "Please say your four digit pin again",
  { onDone: startListening }
);

};

/* KEYPAD INPUT */

const pressNumber = (num: string) => {

if (pin.length >= 4) return;

const newPin = pin + num;

setPin(newPin);

if (newPin.length === 4) {

  verifyPin(newPin);

}

};

const deleteNumber = () => {

setPin(pin.slice(0, -1));

};

/* STOP EVERYTHING */

const stopAll = async () => {

activeRef.current = false;

if (recordingRef.current) {

  await recordingRef.current.stopAndUnloadAsync();
  recordingRef.current = null;

}

clearTimeout(timeoutRef.current);
Speech.stop();

};

const renderKey = (num: string) => (

<TouchableOpacity
  style={styles.key}
  onPress={() => pressNumber(num)}
>
  <Text style={styles.keyText}>{num}</Text>
</TouchableOpacity>

);

return (

<View style={styles.container}>

  <Text style={styles.title}>Enter your PIN</Text>

  <View style={styles.pinRow}>
    {[0,1,2,3].map((i)=>(
      <View
        key={i}
        style={[
          styles.dot,
          pin.length > i && styles.dotFilled
        ]}
      />
    ))}
  </View>

  <View style={styles.keypad}>

    {renderKey("1")}
    {renderKey("2")}
    {renderKey("3")}
    {renderKey("4")}
    {renderKey("5")}
    {renderKey("6")}
    {renderKey("7")}
    {renderKey("8")}
    {renderKey("9")}

    <View style={styles.key}/>
    {renderKey("0")}

    <TouchableOpacity
      style={styles.key}
      onPress={deleteNumber}
    >
      <Text style={styles.keyText}>⌫</Text>
    </TouchableOpacity>

  </View>

  <Text style={styles.voiceText}>Or speak your PIN</Text>

</View>

);

};

export default VoicePinPage;

const styles = StyleSheet.create({

container:{
flex:1,
justifyContent:"center",
alignItems:"center",
backgroundColor:"#fff"
},

title:{
fontSize:22,
fontWeight:"600",
marginBottom:40
},

pinRow:{
flexDirection:"row",
marginBottom:50
},

dot:{
width:16,
height:16,
borderRadius:8,
backgroundColor:"#ccc",
marginHorizontal:10
},

dotFilled:{
backgroundColor:"#0B5ED7"
},

keypad:{
width:260,
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"center"
},

key:{
width:80,
height:70,
justifyContent:"center",
alignItems:"center"
},

keyText:{
fontSize:30,
fontWeight:"500"
},

voiceText:{
marginTop:20,
color:"gray"
}

});