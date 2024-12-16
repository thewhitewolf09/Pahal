import { useEffect, useRef, useState } from "react";
import { useFonts } from "expo-font";
import "react-native-url-polyfill/auto";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { Provider } from "react-redux"; // Redux provider
import { PersistGate } from "redux-persist/integration/react"; // Persist gate for redux-persist
import { persistor, store } from "../redux/store";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null; // Show nothing until fonts are loaded
  }

  

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="parent/add-parent" options={{ headerShown: false }} />
            <Stack.Screen name="parent/edit-parent" options={{ headerShown: false }} />
            <Stack.Screen name="parent/parent-list" options={{ headerShown: false }} />
            <Stack.Screen name="parent/parent-details" options={{ headerShown: false }} />
            <Stack.Screen name="student/add-student" options={{ headerShown: false }} />
            <Stack.Screen name="student/student-list" options={{ headerShown: false }} />
            <Stack.Screen name="student/student-fee-details" options={{ headerShown: false }} />
            <Stack.Screen name="student/student-details" options={{ headerShown: false }} />
            <Stack.Screen name="student/edit-student" options={{ headerShown: false }} />
          </Stack>
        </GestureHandlerRootView>
        <StatusBar backgroundColor="#2563eb" style="light" />
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
