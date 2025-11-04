import { twFullConfig } from "@/utils/twconfig";
import { useAuth } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

const Layout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Wait for auth to load
  if (!isLoaded) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
          name="(modal)/create"
          options={{
            presentation: "formSheet",
            animation: "slide_from_bottom",
            sheetAllowedDetents: [0.3],
            sheetInitialDetentIndex: 0,
            sheetGrabberVisible: false,
            sheetCornerRadius: 20,
            headerShown: false,
            contentStyle: {
              backgroundColor: (twFullConfig.theme.colors as any).dark,
            },
          }}
        />
        <Stack.Screen
          name="(modal)/filelist"
          options={{
            presentation: "fullScreenModal",
            animation: "fade",
            headerLeft: () => (
              <Pressable onPress={() => router.dismissAll()}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            ),
            headerTitle: "File List",
            headerTitleStyle: {
              color: "#fff",
              fontSize: 20,
              fontFamily: "Poppins_600SemiBold",
            },
            headerStyle: {
              backgroundColor: (twFullConfig.theme.colors as any).dark,
            },
          }}
        />

        <Stack.Screen
          name="(modal)/project/[id]"
          options={{
            presentation: "fullScreenModal",
            animation: "fade",
            headerLeft: () => (
              <Pressable onPress={() => router.dismissAll()}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            ),
            // headerTransparent: true,
            headerTitleStyle: {
              color: "#fff",
              fontFamily: "Poppins_600SemiBold",
            },
            headerStyle: {
              backgroundColor: (twFullConfig.theme.colors as any).dark,
            },
          }}
        />
    </Stack>
  );
};

export default Layout;
