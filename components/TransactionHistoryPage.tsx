import React, { useMemo, useState, useRef } from 'react';

import {
 View,
 Text,
 TextInput,
 FlatList,
 TouchableOpacity,
 StyleSheet,
} from 'react-native';

import transactions from '../data/transactions.json';

import { Audio } from 'expo-av';

import * as Speech from 'expo-speech';

import {
 useNavigation,
 useFocusEffect
} from '@react-navigation/native';


type FilterType =
 'all'
 | 'last3'
 | 'credited'
 | 'debited';



export default function TransactionHistoryPage() {


 const navigation = useNavigation<any>();


 const [query, setQuery] = useState('');

 const [filter, setFilter] =
 useState<FilterType>('all');


 const [showFilters,
 setShowFilters] =
 useState(false);



 const recordingRef =
 useRef<Audio.Recording | null>(null);


 const timeoutRef =
 useRef<any>(null);


 const activeRef =
 useRef(false);



/* ✅ ADD THIS FUNCTION ONLY */

const speakTopTransactions = (data:any[]) => {

 if(!data.length){

  Speech.speak(
   "No transactions found",
   { onDone:startListening }
  );

  return;
 }

 const top = data.slice(0,3);

 let message = "";

 top.forEach((t,index)=>{

  const type =
   t.type==="received"
   ?"credited"
   :"debited";

  message +=
   `Transaction ${index+1}, ${type} to ${t.sendto}, rupees ${t.amount}. `;
 });

 Speech.speak(
  message,
  { onDone:startListening }
 );

};



 useFocusEffect(

 React.useCallback(() => {

 activeRef.current = true;

 const timer =
 setTimeout(() => {

 speakIntro();

 }, 400);


 return () => {

 activeRef.current = false;

 clearTimeout(timer);

 stopAll();

 };

 }, [])

 );



 const speakIntro = () => {

 Speech.stop();


 Speech.speak(

 "Welcome. You can search transactions and also apply filter. Say filter to continue or say back.",

 {

 onDone: startListening

 }

 );

 };



 const startListening =
 async () => {

 try {


 if (!activeRef.current)
 return;


 const permission =
 await Audio.requestPermissionsAsync();


 if (!permission.granted)
 return;



 await Audio.setAudioModeAsync({

 allowsRecordingIOS: true,

 playsInSilentModeIOS: true,

 });



 const rec =
 new Audio.Recording();


 await rec.prepareToRecordAsync(

 Audio.RecordingOptionsPresets.HIGH_QUALITY

 );


 await rec.startAsync();


 recordingRef.current = rec;



 timeoutRef.current =
 setTimeout(
 stopRecording,
 5000
 );


 }

 catch {}

 };



 const stopRecording =
 async () => {

 try {

 if (!recordingRef.current)
 return;


 await recordingRef.current.stopAndUnloadAsync();


 const uri =
 recordingRef.current.getURI();


 recordingRef.current = null;


 if (uri)
 sendToBackend(uri);


 }

 catch {}

 };



 const sendToBackend =
 async (uri: string) => {

 try {


 const formData =
 new FormData();


 formData.append(

 "audio",

 {

 uri,

 name: "speech.m4a",

 type: "audio/m4a",

 } as any

 );



 const res =
 await fetch(

 "http://10.230.164.188:5000/stt",

 {

 method: "POST",

 body: formData,

 }

 );


 const data =
 await res.json();


 if (data.status === "success") {

 handleVoice(

 data.text.toLowerCase()

 );

 }

 else {

 repeat();

 }


 }

 catch {

 repeat();

 }

 };



 // ----------------------
 // VOICE HANDLE
 // ----------------------


 const handleVoice =
 (text: string) => {

  // REMOVE / CLEAR / CLOSE FILTER

if (
 text.includes("remove filter") ||
 text.includes("clear filter") ||
 text.includes("close filter") ||
 text.includes("stop filter")
) {

 setFilter("all");

 Speech.speak(
  "Filter removed",
  {
   onDone: startListening
  }
 );

 return;

}


 if (text.includes("back")) {

 Speech.speak(
 "Going back",
 { onDone:()=>navigation.goBack() }
 );

 return;

 }



 if (text.includes("filter")) {

 Speech.speak(
 "You can say credited, debited, or last three transactions",
 { onDone:startListening }
 );

 return;

 }



 if (text.includes("credit")) {


 setFilter("credited");


 const data =
 transactions
 .filter((t:any)=>t.type==="received")
 .sort(
 (a:any,b:any)=>
 new Date(b.createdAt).getTime()
 -
 new Date(a.createdAt).getTime()
 );


 Speech.speak(
 "Showing credited transactions",
 {
 onDone:()=> speakTopTransactions(data)
 }
 );

 return;

 }



 if (text.includes("debit")) {


 setFilter("debited");


 const data =
 transactions
 .filter((t:any)=>t.type==="sent")
 .sort(
 (a:any,b:any)=>
 new Date(b.createdAt).getTime()
 -
 new Date(a.createdAt).getTime()
 );


 Speech.speak(
 "Showing debited transactions",
 {
 onDone:()=> speakTopTransactions(data)
 }
 );

 return;

 }



 if (text.includes("last")) {


 setFilter("last3");


 const data =
 [...transactions]
 .sort(
 (a:any,b:any)=>
 new Date(b.createdAt).getTime()
 -
 new Date(a.createdAt).getTime()
 )
 .slice(0,3);


 Speech.speak(
 "Showing last three transactions",
 {
 onDone:()=> speakTopTransactions(data)
 }
 );

 return;

 }



 setQuery(text);

 Speech.speak(
 "Searching for "+text,
 { onDone:startListening }
 );

 };



 const repeat = () => {

 Speech.speak(
 "Please say again",
 { onDone:startListening }
 );

 };



 const stopAll =
 async () => {

 try {

 if (recordingRef.current) {

 await recordingRef.current.stopAndUnloadAsync();

 recordingRef.current = null;

 }

 clearTimeout(timeoutRef.current);

 Speech.stop();

 }

 catch {}

 };



 // ----------------------
 // FILTER LOGIC
 // ----------------------

 const filtered =
 useMemo(() => {

 let data =
 [...transactions];


 const q =
 query.trim().toLowerCase();


 if (q) {

 data =
 data.filter(

 (t: any) =>

 t.username.toLowerCase().includes(q)

 ||

 t.sendto.toLowerCase().includes(q)

 );

 }


 if (filter === 'credited') {

 data =
 data.filter((t:any)=>t.type==="received");

 }


 if (filter === 'debited') {

 data =
 data.filter((t:any)=>t.type==="sent");

 }


 if (filter === 'last3') {

 data =
 data.sort(
 (a:any,b:any)=>
 new Date(b.createdAt).getTime()
 -
 new Date(a.createdAt).getTime()
 ).slice(0,3);

 }


 return data;

 },[query,filter]);



 // ----------------------
 // UI ITEM
 // ----------------------

 const renderItem =
 ({ item }: any) => {

 const date =
 new Date(item.createdAt);

 const amountColor =
 item.type === 'received'
 ? '#2e7d32'
 : '#c62828';

 const initials =
 item.sendto
 .split(' ')
 .map((s:string)=>s[0])
 .slice(0,2)
 .join('');

 return (

 <View style={styles.card}>

 <View style={styles.cardTop}>

 <View style={styles.profileCircle}>

 <Text style={styles.initials}>
 {initials}
 </Text>

 </View>

 <View style={{ width: 12 }} />

 <Text style={styles.username}>
 {item.sendto}
 </Text>

 <Text style={[
 styles.amount,
 { color: amountColor }
 ]}>
 ₹{item.amount}
 </Text>

 </View>

 <View style={styles.cardBottom}>

 <Text style={styles.typeText}>
 {item.type==='sent'?'Sent':'Received'}
 </Text>

 <Text style={styles.statusText}>
 Successful
 </Text>

 <Text style={styles.dateText}>
 {date.toLocaleString()}
 </Text>

 </View>

 </View>

 );

 };



 // ----------------------
 // UI
 // ----------------------

 return (

 <View style={styles.container}>

 <View style={styles.searchRow}>

 <TextInput
 placeholder="Search by name"
 value={query}
 onChangeText={setQuery}
 style={styles.searchInput}
 />

 <TouchableOpacity
 style={styles.filterBtnTop}
 onPress={()=>setShowFilters(!showFilters)}
 >

 <Text style={styles.filterBtnText}>
 Filter
 </Text>

 </TouchableOpacity>

 </View>



 {filter !== 'all' && (

 <View style={{
 flexDirection:'row',
 alignItems:'center',
 marginHorizontal:12,
 marginBottom:6
 }}>

 <Text style={{fontWeight:'600'}}>
 Selected filter:
 {filter==='credited'
 ?'Credited'
 :filter==='debited'
 ?'Debited'
 :'Last 3 Transactions'}
 </Text>

 <TouchableOpacity onPress={()=>setFilter('all')}>
 <Text style={{marginLeft:10,fontSize:18}}>
 ✕
 </Text>
 </TouchableOpacity>

 </View>

 )}



 {showFilters && (

 <View style={styles.filterBox}>

 <TouchableOpacity
 style={styles.filterItem}
 onPress={()=>{setFilter('last3');setShowFilters(false);}}
 >
 <Text>Last 3 Transactions</Text>
 </TouchableOpacity>

 <TouchableOpacity
 style={styles.filterItem}
 onPress={()=>{setFilter('credited');setShowFilters(false);}}
 >
 <Text>Credited</Text>
 </TouchableOpacity>

 <TouchableOpacity
 style={styles.filterItem}
 onPress={()=>{setFilter('debited');setShowFilters(false);}}
 >
 <Text>Debited</Text>
 </TouchableOpacity>

 </View>

 )}



 <FlatList
 data={filtered}
 keyExtractor={(item)=>item.id.toString()}
 renderItem={renderItem}
 contentContainerStyle={{
 padding:12,
 paddingBottom:40
 }}
 />

 </View>

 );

}



// STYLES SAME AS YOUR ORIGINAL
const styles = StyleSheet.create({
container:{flex:1,backgroundColor:'#f8f9fa'},
searchRow:{flexDirection:'row',padding:12},
searchInput:{flex:1,borderWidth:1,borderColor:'#ddd',borderRadius:8,paddingHorizontal:12,backgroundColor:'#fff'},
filterBtnTop:{marginLeft:8,paddingHorizontal:12,justifyContent:'center',borderRadius:8,backgroundColor:'#eee'},
filterBtnText:{fontWeight:'600'},
filterBox:{paddingHorizontal:12,paddingBottom:10},
filterItem:{padding:12,backgroundColor:'#fff',borderRadius:8,marginBottom:8},
card:{backgroundColor:'#fff',borderRadius:12,padding:12,marginBottom:12},
cardTop:{flexDirection:'row',alignItems:'center',marginBottom:8},
profileCircle:{width:44,height:44,borderRadius:22,backgroundColor:'#e0e0e0',justifyContent:'center',alignItems:'center'},
initials:{fontWeight:'700'},
username:{flex:1,fontWeight:'600'},
amount:{fontWeight:'700'},
cardBottom:{flexDirection:'row'},
typeText:{flex:1,color:'#666'},
statusText:{flex:1,textAlign:'center',color:'#2e7d32'},
dateText:{flex:1,textAlign:'right',color:'#888'},
});