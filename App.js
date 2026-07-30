import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import notifee, { AndroidColor } from '@notifee/react-native';

// ১. জিরো-ওভারহেড ফোরগ্রাউন্ড সার্ভিস (সিস্টেম লেভেল)
notifee.registerForegroundService((notification) => {
  return new Promise(() => {}); // এটি অনন্তকাল চলবে, প্রসেসরের ওপর ০% চাপ ফেলবে
});

export default function App() {

  useEffect(() => {
    const startPersistentSystem = async () => {
      // অ্যান্ড্রয়েড ১৩+ পারমিশন
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
      
      const channelId = await notifee.createChannel({
        id: 'system_persistent_channel',
        name: 'System Background Process',
      });
      
      // অ্যাপ চালুর সাথে সাথেই সিস্টেম নোটিফিকেশন একটিভ হবে
      await notifee.displayNotification({
        title: 'ব্রাউজার সচল',
        body: 'ন্যূনতম প্রসেসর ব্যবহার করে কাজ করছে...',
        android: {
          channelId,
          asForegroundService: true,
          color: AndroidColor.BLACK,
          ongoing: true,
        },
      });
    };
    
    startPersistentSystem();
    
    return () => notifee.stopForegroundService();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131314" />
      
      {/* ২. সমস্ত লিসেনার এবং অতিরিক্ত কমান্ড মুক্ত সাধারণ ওয়েবভিউ */}
      <WebView
        source={{ uri: 'https://gemini.google.com' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        userAgent="Mozilla/5.0 (Linux; Android 13; Symphony G26) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
        style={styles.webview}
        containerStyle={{ flex: 1, marginTop: 0 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131314' },
  webview: { flex: 1, backgroundColor: '#131314' },
});