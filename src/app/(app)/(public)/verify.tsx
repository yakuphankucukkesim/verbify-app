import { emailAtom } from "@/store/login";
import {
  isClerkAPIResponseError,
  useSignIn,
  useSignUp,
} from "@clerk/clerk-expo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Verify = () => {
  const { isLogin } = useLocalSearchParams<{ isLogin?: string }>();
  const router = useRouter();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [countdown, setCountdown] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const email = useAtomValue(emailAtom);
  const { signUp, setActive } = useSignUp();
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const isCodeComplete = code.every((code) => code !== "");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (isCodeComplete) {
      Keyboard.dismiss();
    }
  }, [isCodeComplete]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [countdown, isTimerRunning]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    setIsTimerRunning(true);

    try {
      await signUp!.prepareVerification({ strategy: "email_code" });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const result = await signUp!.attemptEmailAddressVerification({
        code: code.join(""),
      });
      await setActive!({ session: result.createdSessionId });
      // router.replace("/projects");
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        Alert.alert("Error", error.errors[0].message);
      }
    }
  };

  const handleSignIn = async () => {
    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "email_code",
        code: code.join(""),
      });
      await setActive!({ session: result.createdSessionId });
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        Alert.alert("Error", error.errors[0].message);
      }
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-black px-6 pt-safe">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 justify-center bg-gray-800 rounded-xl"
        >
          <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-xl font-Poppins_600SemiBold mt-20">
          Enter code
        </Text>
        <Text className="text-gray-400 mt-2 font-Poppins_400Regular">
          Check your email and enter the code sent to {"\n"}
          <Text className="text-white">{email}</Text>
        </Text>

        {/* Code input */}
        <View className="flex-row justify-between mt-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className={`w-[52px] h-[52px] bg-gray-800 rounded-lg text-white text-center text-xl
                ${!code[index] && index === code.findIndex((c) => !c) ? "border-2 border-primary" : ""}`}
              maxLength={1}
              keyboardType="number-pad"
              value={code[index]}
              caretHidden={true}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace") {
                  const newCode = [...code];
                  newCode[index] = "";
                  setCode(newCode);
                  if (index > 0) {
                    inputRefs.current[index - 1]?.focus();
                  }
                }
              }}
            />
          ))}
        </View>

        {/* Resend code */}

        <TouchableOpacity onPress={handleResendCode} className="mt-8">
          <Text
            className={`font-Poppins_500Medium transition-colors duration-300 ${countdown > 0 ? "text-gray-400" : "text-primary"}`}
          >
            Resend code {countdown > 0 && `(${countdown}s)`}
          </Text>
        </TouchableOpacity>

        {/* Submit button */}

        <TouchableOpacity
          disabled={!isCodeComplete}
          onPress={isLogin ? handleSignIn : handleCreateAccount}
          className={`rounded-lg py-4 mt-auto mb-8 transition-colors duration-300 ${isCodeComplete ? "bg-primary" : "bg-gray-900"}`}
        >
          <Text
            className={`text-center text-lg font-Poppins_600SemiBold transition-colors duration-300 ${isCodeComplete ? "text-white" : "text-gray-400"}`}
          >
            {isLogin ? "Login" : "Create account"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Verify;
