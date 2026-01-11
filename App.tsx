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
        <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="SignUp" component={SignUp} />
                          <Stack.Screen name="HomePage" component={HomePage} />
                          <Stack.Screen name="TransactionHistory" component={TransactionHistoryPage} />
                          <Stack.Screen name="profilePage" component={ProfilePage} />
                          <Stack.Screen name="Balance" component={BalancePage} />
                          <Stack.Screen name="listOfContacts" component={ListOfContacts} />
                          <Stack.Screen name="PaymentPage" component={PaymentPage} />


      
      </Stack.Navigator>
    </NavigationContainer>
  );
}
