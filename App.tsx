import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './components/login';
import SignUp from './components/SignUp';

const Stack = createNativeStackNavigator();

export default function App() {
  return (


    
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="SignUp" component={SignUp} />
      
      </Stack.Navigator>
    </NavigationContainer>
  );
}