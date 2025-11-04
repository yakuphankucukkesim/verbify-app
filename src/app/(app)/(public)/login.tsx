import { emailAtom } from "@/store/login";
import { twFullConfig } from "@/utils/twconfig";
import {
  isClerkAPIResponseError,
  useSignIn,
  useSignUp,
  useSSO,
} from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Page = () => {
  const [loading, setLoading] = useState<"google" | "apple" | "email" | false>(
    false
  );
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const setEmailAtom = useSetAtom(emailAtom);

  const { startSSOFlow } = useSSO();
  const { signUp } = useSignUp();
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const handleSignInWithSSO = async (
    strategy: "oauth_google" | "oauth_apple"
  ) => {
    if (strategy === "oauth_google" || strategy === "oauth_apple") {
      setLoading(strategy.replace("oauth_", "") as "google" | "apple");
    } else {
      setLoading(false);
    }

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOTP = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading("email");
      setEmailAtom(email);
      await signUp?.create({
        emailAddress: email,
      });
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      router.push("/verify");
    } catch (err) {
      console.error("Email OTP Error:", err);
      if (isClerkAPIResponseError(err)) {
        if (err.status === 422) {
          // User already exists, try to sign in
          signInWithEmail();
        } else {
          const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to send verification code.";
          Alert.alert("Error", errorMessage);
        }
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async () => {
    try {
      setLoading("email");
      const signInAttempt = await signIn?.create({
        strategy: "email_code",
        identifier: email,
      });

      router.push("/verify?isLogin=true");
    } catch (err) {
      console.error("Sign In Error:", err);
      if (isClerkAPIResponseError(err)) {
        const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to send verification code.";
        Alert.alert("Error", errorMessage);
      } else {
        Alert.alert("Error", "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPress = (linkType: "terms" | "privacy") => {
    router.push(`/(app)/(public)/${linkType}` as any);
  };

  const signInWithPasskey = async () => {
    // Check if passkeys are supported
    const passkeyModule = await import("@clerk/expo-passkeys");
    if (!passkeyModule.passkeys.isSupported()) {
      Alert.alert(
        "Not Supported",
        "Passkey sign-in is not supported on iOS Simulator. Please use a physical device with iOS 16+."
      );
      return;
    }

    try {
      const signInAttempt = await signIn?.authenticateWithPasskey({
        flow: "discoverable",
      });

      if (signInAttempt?.status === "complete") {
        await setActive?.({ session: signInAttempt.createdSessionId });
      } else {
        console.log("Sign in attempt:", signInAttempt);
      }
    } catch (error: any) {
      console.error("Passkey sign-in error:", error);
      Alert.alert(
        "Passkey Error",
        error?.errors?.[0]?.longMessage ||
          "Failed to sign in with passkey. Please try again."
      );
    }
  };

  return (
    <View className="flex-1 bg-black pt-safe">
      <View className="flex-1 p-6">
        {/*<View className="flex-row justify-end">
          <Link href="/faq" asChild>
            <TouchableOpacity className="bg-gray-700 rounded-xl">
              <Feather name="help-circle" size={28} color="white" />
            </TouchableOpacity>
          </Link>
        </View>*/}

        <View className="items-center">
          <Image
            source={require("@/assets/images/convex.gif")}
            className="w-80 h-80"
            resizeMode="contain"
          />
        </View>

        <Text className="text-gray-400 text-lg text-center font-Poppins_400Regular">
          AI-Powered Captions Editor
        </Text>

        <TextInput
          className="bg-gray-800 text-gray-300 rounded-xl p-4 my-8"
          placeholder="Email"
          placeholderTextColor="gray"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View className="flex-row items-center">
          <Checkbox
            value={isTermsChecked}
            onValueChange={setIsTermsChecked}
            className="mr-4"
            color={
              isTermsChecked
                ? (twFullConfig.theme.colors as any).primary
                : undefined
            }
          />
          <Text className="text-gray-400 text-md font-Poppins_500Medium flex-1 flex-wrap">
            I agree to the{" "}
            <Text
              className="text-white underline"
              onPress={() => handleLinkPress("terms")}
            >
              Terms of Service
            </Text>{" "}
            and acknowledge Verbify's{" "}
            <Text
              className="text-white underline"
              onPress={() => handleLinkPress("privacy")}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleEmailOTP}
          disabled={!email || !isTermsChecked || loading === "email"}
          className={`w-full py-4 rounded-lg mt-10 mb-12 transition-colors duration-300 ${!email || !isTermsChecked || loading === "email" ? "bg-gray-800" : "bg-primary"}`}
        >
          {loading === "email" ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-lg font-Poppins_600SemiBold">
              Continue
            </Text>
          )}
        </TouchableOpacity>
        <View>
          <TouchableOpacity
            onPress={() => handleSignInWithSSO("oauth_apple")}
            disabled={!!loading}
            className={`w-full py-4 rounded-lg flex-row justify-center items-center bg-gray-800`}
          >
            {loading === "apple" ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="logo-apple" size={24} color="white" />
                <Text className="text-white ml-3 text-center text-base font-Poppins_600SemiBold">
                  Continue with Apple
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSignInWithSSO("oauth_google")}
            disabled={!!loading}
            className={`w-full py-4 mt-4 rounded-lg flex-row justify-center items-center bg-gray-800`}
          >
            {loading === "google" ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Image
                  source={require("@/assets/images/google.webp")}
                  className="w-6 h-6"
                />
                <Text className="text-white ml-3 text-center text-base font-Poppins_600SemiBold">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
          <View className="items-center pt-6">
            <TouchableOpacity onPress={signInWithPasskey}>
              <Text className="text-gray-400 text-md font-Poppins_500Medium">
                Continue with Passkey
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Page;
