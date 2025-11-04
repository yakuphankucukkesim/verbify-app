import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
// import { PaywallModal } from "@/components/PaywallModal"; // Temporarily disabled

const Page = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  
  // Get user's projects count
  const projects = useQuery(api.projects.list) || [];
  const projectCount = projects.length;
  
  // Mock subscription data (will be replaced with real data from RevenueCat)
  const subscriptionTier: "free" | "pro" | "business" = "free"; // Temporarily hardcoded
  // const [subscriptionTier, setSubscriptionTier] = useState<"free" | "pro" | "business">("free");
  // const [showPaywall, setShowPaywall] = useState(false); // Temporarily disabled

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone. All your projects, videos, and data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await user?.delete();
              router.replace("/");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.errors?.[0]?.message || "Failed to delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:yakuphann@icloud.com?subject=Support Request");
  };

  const handleRateApp = () => {
    // iOS App Store rating
    Linking.openURL("https://apps.apple.com/app/");
  };

  const handleNotifications = () => {
    Alert.alert(
      "Notifications",
      "Choose your notification preferences",
      [
        {
          text: "All Notifications",
          onPress: () => Alert.alert("Success", "All notifications enabled")
        },
        {
          text: "Important Only",
          onPress: () => Alert.alert("Success", "Only important notifications enabled")
        },
        {
          text: "Disable All",
          style: "destructive",
          onPress: () => Alert.alert("Success", "All notifications disabled")
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      "Coming Soon",
      "Multi-language support will be available in a future update! 🌍"
    );
  };

  const handleFAQ = () => {
    Alert.alert(
      "Coming Soon",
      "FAQ section will be available in a future update! 💡"
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      "Share Verbify",
      "Help others discover Verbify!",
      [
        {
          text: "Copy Link",
          onPress: () => {
            // In a real app, you'd use Clipboard API
            Alert.alert("Copied!", "App link copied to clipboard");
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      "Edit Profile",
      "Choose what to update",
      [
        {
          text: "Change Name",
          onPress: () => Alert.alert("Coming Soon", "Name editing will be available in a future update")
        },
        {
          text: "Change Email",
          onPress: () => Alert.alert("Coming Soon", "Email editing will be available in a future update")
        },
        {
          text: "Change Photo",
          onPress: () => Alert.alert("Coming Soon", "Photo upload will be available in a future update")
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleTheme = () => {
    Alert.alert(
      "App Theme",
      "Verbify currently uses dark mode for optimal video editing experience",
      [
        {
          text: "Got it",
          style: "default"
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-dark">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-16 pb-8">
          <Text className="text-white text-3xl font-Poppins_700Bold mb-2">
            Profile
          </Text>
          <Text className="text-gray-400 text-base font-Poppins_400Regular">
            Manage your account and preferences
          </Text>
        </View>

        {/* User Info Card */}
        <View className="mx-6 mb-6 bg-[#1A1A1A] rounded-2xl p-6">
          <View className="flex-row items-center mb-4">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-3xl font-Poppins_600SemiBold">
                  {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-Poppins_600SemiBold">
                {user?.firstName || "User"} {user?.lastName || ""}
              </Text>
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                {user?.emailAddresses[0]?.emailAddress}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleEditProfile}
            className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex-row items-center justify-center"
          >
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
            <Text className="text-primary text-base font-Poppins_600SemiBold ml-2">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
            Account
          </Text>
          
          {/* Email */}
          <View className="bg-[#1A1A1A] rounded-xl p-4 mb-3 flex-row items-center">
            <Ionicons name="mail-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                Email
              </Text>
              <Text className="text-white text-base font-Poppins_500Medium">
                {user?.emailAddresses[0]?.emailAddress}
              </Text>
            </View>
            <View className="bg-green-500/20 px-3 py-1 rounded-full">
              <Text className="text-green-500 text-xs font-Poppins_500Medium">
                Verified
              </Text>
            </View>
          </View>

          {/* Member Since */}
          <View className="bg-[#1A1A1A] rounded-xl p-4 flex-row items-center">
            <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                Member Since
              </Text>
              <Text className="text-white text-base font-Poppins_500Medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
            Subscription
          </Text>
          
          <View className="bg-[#1A1A1A] rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-white text-xl font-Poppins_600SemiBold capitalize">
                  {subscriptionTier} Plan
                </Text>
                <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                  {subscriptionTier === "free" 
                    ? "3 videos per month" 
                    : subscriptionTier === "pro"
                    ? "Unlimited videos"
                    : "Unlimited videos + Team features"}
                </Text>
              </View>
              {subscriptionTier === "free" ? (
                <View className="bg-gray-700 px-3 py-1 rounded-full">
                  <Text className="text-gray-300 text-xs font-Poppins_600SemiBold">
                    FREE
                  </Text>
                </View>
              ) : (
                <View className="bg-primary/20 px-3 py-1 rounded-full">
                  <Text className="text-primary text-xs font-Poppins_600SemiBold">
                    ACTIVE
                  </Text>
                </View>
              )}
            </View>

            {subscriptionTier === "free" ? (
              <>
                <View className="border-t border-gray-700 pt-4 mb-4">
                  <Text className="text-gray-400 text-sm font-Poppins_400Regular mb-3">
                    Upgrade to unlock:
                  </Text>
                  <FeatureBullet text="Unlimited videos" />
                  <FeatureBullet text="AI voice generation" />
                  <FeatureBullet text="No watermarks" />
                  <FeatureBullet text="Advanced features" />
                </View>
                <TouchableOpacity
                  onPress={() => Alert.alert("Coming Soon", "Pro subscription will be available soon! 🚀")}
                  className="bg-primary rounded-xl p-3 flex-row items-center justify-center"
                >
                  <Ionicons name="rocket" size={20} color="#fff" />
                  <Text className="text-white text-base font-Poppins_600SemiBold ml-2">
                    Upgrade to Pro
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => Alert.alert("Manage Subscription", "You can manage your subscription in the App Store app.")}
                className="border-t border-gray-700 pt-4 flex-row items-center"
              >
                <Ionicons name="settings-outline" size={20} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm font-Poppins_500Medium ml-2">
                  Manage in App Store
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" className="ml-auto" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Support & Help Section */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
            Support & Help
          </Text>
          
          <TouchableOpacity 
            onPress={handleContactSupport}
            className="bg-[#1A1A1A] rounded-xl p-4 mb-3 flex-row items-center"
          >
            <Ionicons name="mail-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                Contact Support
              </Text>
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                Get help from our team
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleFAQ}
            className="bg-[#1A1A1A] rounded-xl p-4 mb-3 flex-row items-center"
          >
            <Ionicons name="help-circle-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                FAQ
              </Text>
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                Frequently asked questions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleRateApp}
            className="bg-[#1A1A1A] rounded-xl p-4 flex-row items-center"
          >
            <Ionicons name="star-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                Rate Verbify
              </Text>
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                Share your feedback
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
            Preferences
          </Text>
          
          <TouchableOpacity 
            onPress={handleNotifications}
            className="bg-[#1A1A1A] rounded-xl p-4 mb-3 flex-row items-center"
          >
            <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                Notifications
              </Text>
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                Manage notification preferences
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleLanguage}
            className="bg-[#1A1A1A] rounded-xl p-4 mb-3 flex-row items-center"
          >
            <Ionicons name="language-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                Language
              </Text>
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                English (US)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleTheme}
            className="bg-[#1A1A1A] rounded-xl p-4 mb-3 flex-row items-center"
          >
            <Ionicons name="moon-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                Appearance
              </Text>
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                Dark Mode
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleShareApp}
            className="bg-[#1A1A1A] rounded-xl p-4 flex-row items-center"
          >
            <Ionicons name="share-social-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                Share Verbify
              </Text>
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                Invite friends to try the app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
            About
          </Text>
          
          <TouchableOpacity 
            onPress={() => router.push('/(app)/(public)/terms')}
            className="bg-[#1A1A1A] rounded-xl p-4 mb-3 flex-row items-center"
          >
            <Ionicons name="document-text-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                Terms of Service
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(app)/(public)/privacy')}
            className="bg-[#1A1A1A] rounded-xl p-4 mb-3 flex-row items-center"
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                Privacy Policy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View className="bg-[#1A1A1A] rounded-xl p-4 flex-row items-center">
            <Ionicons name="information-circle-outline" size={24} color="#9CA3AF" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-base font-Poppins_500Medium">
                App Version
              </Text>
              <Text className="text-gray-400 text-sm font-Poppins_400Regular">
                1.0.0
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mx-6 mb-8">
          <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
            Danger Zone
          </Text>
          
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Sign Out', 
                    style: 'destructive',
                    onPress: handleSignOut
                  }
                ]
              );
            }}
            className="bg-red-500/10 rounded-xl p-4 flex-row items-center justify-center border border-red-500/20 mb-3"
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text className="text-red-500 text-base font-Poppins_600SemiBold ml-2">
              Sign Out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="bg-red-600/10 rounded-xl p-4 flex-row items-center justify-center border border-red-600/30"
          >
            <Ionicons name="trash-outline" size={24} color="#DC2626" />
            <Text className="text-red-600 text-base font-Poppins_600SemiBold ml-2">
              Delete Account
            </Text>
          </TouchableOpacity>
          <Text className="text-gray-500 text-xs text-center mt-2 font-Poppins_400Regular">
            This action is permanent and cannot be undone
          </Text>
        </View>
      </ScrollView>

      {/* Paywall Modal - Temporarily disabled
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseSuccess={() => {
          // Refresh subscription status
          setSubscriptionTier("pro"); // This will be updated from RevenueCat
          Alert.alert("Success!", "Welcome to Verbify Pro! 🎉");
        }}
        message="Upgrade to unlock unlimited videos and premium features"
      />
      */}
    </View>
  );
};

const FeatureBullet = ({ text }: { text: string }) => (
  <View className="flex-row items-center mb-2">
    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
    <Text className="text-gray-300 text-sm font-Poppins_400Regular ml-2">
      {text}
    </Text>
  </View>
);

export default Page;
