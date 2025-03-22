import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useAuthStore from "../store/useAuthStore.js";
import SafeScreen from "../components/SafeScreen.jsx";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {useFonts} from "expo-font";


SplashScreen.preventAutoHideAsync();
export default function RootLayout() {

  const router = useRouter();
  const segments = useSegments();

  const { user, token, checkAuth } = useAuthStore();
   const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf")
  })

  useEffect(()=>{
    if(fontsLoaded) SplashScreen.hideAsync();
  },[fontsLoaded])

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;
    if(!isSignedIn && !inAuthScreen) router.replace("/(auth)");
    else if(isSignedIn && inAuthScreen) router.replace("/(tabs)");
  }, [user, token, segments] );




  return (
    <SafeAreaProvider>
      <SafeScreen> 
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
