import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

cssInterop(LinearGradient, {
  className: {
    target: "style",
  },
});

const CreateButton = () => {
  const router = useRouter();

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(app)/(authenticated)/(modal)/create");
  };

  return (
    <TouchableOpacity
      className="flex-1 rounded-xl items-center justify-center"
      onPress={handleCreate}
    >
      <LinearGradient
        colors={["#F3B01C", "#4ECDC4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-xl items-center justify-center px-6 py-1"
      >
        <Text className="text-white text-lg font-Poppins_600SemiBold p-2">
          Create
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CreateButton;
