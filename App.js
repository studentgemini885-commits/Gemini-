import React, { useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform, PermissionsAndroid, ToastAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import notifee, { AndroidColor } from '@notifee/react-native';

// ১. জিরো-ওভারহেড ফোরগ্রাউন্ড সার্ভিস
notifee.registerForegroundService((notification) => {
  return new Promise(() => {});
});

export default function App() {
  // ওয়েবভিউকে নিয়ন্ত্রণ করার জন্য রেফারেন্স তৈরি
  const webViewRef = useRef(null);

  useEffect(() => {
    const startService = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
      const channelId = await notifee.createChannel({
        id: 'persistent_browser',
        name: 'Gemini Background Process',
      });
      await notifee.displayNotification({
        title: 'Gemini ব্রাউজার সচল',
        body: 'ব্যাকগ্রাউন্ডে নিরবচ্ছিন্নভাবে কাজ করছে...',
        android: {
          channelId,
          asForegroundService: true,
          color: AndroidColor.BLACK,
          ongoing: true,
        },
      });
    };
    startService();
    return () => notifee.stopForegroundService();
  }, []);

  /**
   * মেমরি ম্যানেজমেন্ট এবং গার্বেজ কালেকশন (Garbage Collection) লজিক
   * পেজ পরিবর্তন হওয়ার সাথে সাথে র‍্যাম থেকে পূর্বের পেজের হিস্ট্রি ডিলিট করা হবে।
   */
  const handleNavigation = (navState) => {
    if (webViewRef.current && !navState.loading) {
      // এটি ব্রাউজারের হিস্ট্রি স্ট্যাক মুছে ফেলে র‍্যাম ফ্রি করবে
      webViewRef.current.clearHistory();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131314" />
      
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://gemini.google.com' }}
        
        // --- 1GB RAM অপ্টিমাইজেশন ---
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        mediaPlaybackRequiresUserAction={true} 
        allowsInlineMediaPlayback={false}
        textZoom={100} 
        setBuiltInZoomControls={false}
        overScrollMode="never"
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        androidLayerType="hardware" 
        
        // --- মেমরি কিলিং আর্কিটেকচার ---
        onNavigationStateChange={handleNavigation}
        
        // যখন র‍্যাম ফুল হয়ে যায় এবং ওএস (OS) ব্রাউজারকে কিল করে দেয়,
        // তখন অ্যাপটি ক্র্যাশ বা হ্যাং না করে মেমরি ফ্লাশ করে রিলোড হবে।
        onRenderProcessGone={(e) => {
          if (Platform.OS === 'android') {
            ToastAndroid.show('র‍্যাম অপ্টিমাইজ করা হচ্ছে...', ToastAndroid.SHORT);
          }
          webViewRef.current?.reload();
        }}
        onContentProcessDidTerminate={() => webViewRef.current?.reload()} // iOS ফলব্যাক

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