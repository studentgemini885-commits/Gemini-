import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import notifee, { AndroidColor } from '@notifee/react-native';

// অডিও প্লেয়ারের মতো ব্যাকগ্রাউন্ড প্রসেস টিকিয়ে রাখার জন্য ফোরগ্রাউন্ড সার্ভিস রেজিস্টার
notifee.registerForegroundService((notification) => {
  return new Promise(() => {});
});

export default function App() {

  useEffect(() => {
    const startBackgroundNotification = async () => {
      // অ্যান্ড্রয়েড ১৩+ এর জন্য নোটিফিকেশন পারমিশন নেওয়া
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      // নোটিফিকেশন চ্যানেল তৈরি
      const channelId = await notifee.createChannel({
        id: 'gemini_persistent_channel',
        name: 'Gemini Background Service',
      });

      // স্থায়ী নোটিফিকেশন প্রদর্শন যা ব্যাকগ্রাউন্ডে অ্যাপকে কিল হওয়া থেকে বাঁচাবে
      await notifee.displayNotification({
        title: 'Gemini ব্রাউজার সচল আছে',
        body: 'ব্যাকগ্রাউন্ডে নিরবচ্ছিন্নভাবে কাজ করছে...',
        android: {
          channelId,
          asForegroundService: true,
          color: AndroidColor.BLACK,
          ongoing: true,
        },
      });
    };

    startBackgroundNotification();

    return () => {
      notifee.stopForegroundService();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131314" />
      
      {/* সাধারণ এবং হালকা ওয়েবভিউ ব্রাউজার */}
      <WebView
        source={{ uri: 'https://gemini.google.com' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        
        // ১ জিবি র‍্যাম ডিভাইসের জন্য হার্ডওয়্যার লেভেল অপ্টিমাইজেশন
        androidLayerType="hardware"
        overScrollMode="never"
        bounces={false}
        
        userAgent="Mozilla/5.0 (Linux; Android 13; Symphony G26) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
        style={styles.webview}
        containerStyle={{ flex: 1, marginTop: 0 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131314',
  },
  webview: {
    flex: 1,
    backgroundColor: '#131314',
  },
});