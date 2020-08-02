import { StatusBar } from 'expo-status-bar';
import React,{useEffect,useState} from 'react';
import { StyleSheet, Text, View,Button } from 'react-native';
import * as Notivication from 'expo-notifications'
import * as Permission from 'expo-permissions'

//run notivication not background proses
Notivication.setNotificationHandler({
  handleNotification: async ()=>{
    return {
        shouldShowAlert:true
    }
  }
})

export default function App() {
  const [pushToken,setPushToken] = useState()
  //for ios
  useEffect(()=>{
    Permission.getAsync(Permission.NOTIFICATIONS).then(
      statusObj=>{
        if(statusObj.status !== 'granted'){
           return Permission.askAsync(Permission.NOTIFICATIONS)
        }
        return statusObj
      }
    ).then(statusObj =>{
        console.log(statusObj) 
        if(statusObj.status !== 'granted'){
          throw new Error('Permisson not granted!')
        }
    }).then(()=>{
        console.log('getting token')
        return Notivication.getExpoPushTokenAsync()
    })
    .then(response =>{
      const token = response.data
      setPushToken(token)
    })
    .catch(err =>{
      console.log(err)
      return null
    })
  },[])
  //end

  useEffect(()=>{
    const backgroundSubscription= Notivication.addNotificationResponseReceivedListener(response=>{
      console.log('background',response)
    })

    const foregroundsubscription =  Notivication.addNotificationReceivedListener(notification=>{
        console.log('foreground',notification)
      })
      return () =>{
        foregroundsubscription.remove();
        backgroundSubscription.remove();
      }
  },[])

  const trigerNotivication = () =>{
    //  Notivication.scheduleNotificationAsync({
    //      content:{
    //        title: "My First Notivication",
    //        body:"this is the first local notivication we are sending",
    //        data:{myspesialdata: 'some text'}
    //      },
    //      trigger:{
    //        seconds:10
    //      }
    //  })
   const response = fetch('https://exp.host/--/api/v2/push/send',{
      method:'POST',
      headers:{
        Accept:'application/json',
        'Accept-Encoding': 'gzip,deflate',
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        to:pushToken,
        data:{extraData: 'some data'},
        title:'send via the app',
        body:'this push notivication was sent via the app',
        sound: "default"
      })
    }).then(res=>{
      console.log(res.json())
    }).catch(err=>{
      console.log(err)
    })
  }
  
  return (
    <View style={styles.container}>
     <Button title="Triger Notification" onPress={trigerNotivication} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
