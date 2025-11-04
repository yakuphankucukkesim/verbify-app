import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const TopCreateOption = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className="flex-1 p-4 items-center bg-neutral-800 rounded-2xl"
    onPress={onPress}
  >
    <View className="mb-3">{icon}</View>
    <Text className="text-white text-lg font-Poppins_600SemiBold">{title}</Text>
    <Text className="text-white text-sm font-Poppins_400Regular">
      {subtitle}
    </Text>
  </TouchableOpacity>
);

const Page = () => {
  const router = useRouter();

  const onImportVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(app)/(authenticated)/(modal)/filelist");
  };

  const onRecordVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(app)/(authenticated)/(modal)/filelist");
  };
  return (
    <View className="flex-1 bg-dark px-4 pt-4">
      <View className="flex-row gap-3 mb-3">
        <TopCreateOption
          icon={<Ionicons name="download-outline" size={24} color="#fff" />}
          title="Caption Video"
          subtitle="Import footage"
          onPress={onImportVideo}
        />
        <TopCreateOption
          icon={<Ionicons name="videocam-outline" size={24} color="#fff" />}
          title="Record Video"
          subtitle="Use your camera"
          onPress={onRecordVideo}
        />
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
        className="w-full mb-8 bg-zinc-800 rounded-2xl py-4"
      >
        <Text className="text-center text-lg text-gray-400 font-Poppins_600SemiBold">
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Page;
