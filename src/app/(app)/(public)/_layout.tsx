import { Stack } from "expo-router";
import React from "react";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="faq" options={{ presentation: 'modal' }} />
      <Stack.Screen 
        name="terms" 
        options={{ 
          presentation: 'formSheet',
          animation: 'slide_from_bottom',
          sheetAllowedDetents: [0.9],
          sheetGrabberVisible: true,
          sheetCornerRadius: 20,
        }} 
      />
      <Stack.Screen 
        name="privacy" 
        options={{ 
          presentation: 'formSheet',
          animation: 'slide_from_bottom',
          sheetAllowedDetents: [0.9],
          sheetGrabberVisible: true,
          sheetCornerRadius: 20,
        }} 
      />
    </Stack>
  );
};

export default Layout;
