import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './components/login';
import SignUp from './components/SignUp';
import HomePage from './components/HomePage';
import TransactionHistoryPage from './components/TransactionHistoryPage';
import ProfilePage from './components/Profilepage';
import BalancePage from './components/BalancePage';
import ListOfContacts from './components/ListOfContacts';
import PaymentPage from './components/PaymentPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="SignUp" component={SignUp} options={{ title: '' }} />
        <Stack.Screen name="HomePage" component={HomePage} options={{ title: '' }} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryPage} options={{ title: '' }} />
        <Stack.Screen name="profilePage" component={ProfilePage} options={{ title: '' }} />
        <Stack.Screen name="Balance" component={BalancePage} options={{ title: '' }} />
        <Stack.Screen name="listOfContacts" component={ListOfContacts} options={{ title: '' }} />

        {/* ✅ PAYMENT PAGE HEADER FIX */}
        <Stack.Screen
          name="PaymentPage"
          component={PaymentPage}
          options={{
            headerTitleAlign: 'left',
            headerBackTitleVisible: false,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
