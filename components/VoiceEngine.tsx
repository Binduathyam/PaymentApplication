import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

const VoiceEngine = () => {

  const speakText = (text: string) => {
    Speech.speak(text, {
      language: 'en-IN',
      pitch: 1,
      rate: 0.9,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => speakText("Welcome to voice based UPI assistant")}
      >
        <Text style={styles.text}>🔊 Speak</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VoiceEngine;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
