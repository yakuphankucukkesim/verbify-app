import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Slot, useSegments } from "expo-router";
import { useEffect } from "react";

const Layout = () => {
  const segment = useSegments();
  const inAuthGroup = segment[1] === "(authenticated)";
  const inPublicGroup = segment[1] === "(public)";
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    console.log("Auth Status:", { isSignedIn, segment, inAuthGroup, inPublicGroup });

    if (!isSignedIn && inAuthGroup) {
      // User is not signed in but trying to access authenticated routes
      console.log("❌ User not signed in, redirecting to login...");
    }

    if (isSignedIn && inPublicGroup) {
      // User is signed in but on login/public pages
      console.log("✅ User signed in, redirecting to projects...");
    }
  }, [isSignedIn, isLoaded, inAuthGroup, inPublicGroup, segment]);

  // Wait for auth to load
  if (!isLoaded) {
    return null;
  }

  // Redirect logic
  if (!isSignedIn && inAuthGroup) {
    return <Redirect href="/(app)/(public)/login" />;
  }

  // If user is signed in and on public pages (like login), redirect to projects
  if (isSignedIn && inPublicGroup) {
    return <Redirect href="/(app)/(authenticated)/(tabs)/projects" />;
  }

  return <Slot />;
};

export default Layout;
