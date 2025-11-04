import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface VideoControlsProps {
  isGenerating: boolean;
  projectStatus: string;
  hasCaptions: boolean;
  onGenerateCaptions: () => void;
  onShowCaptionControls: () => void;
  onShowScriptModal: () => void;
  onShowStyleModal?: () => void;
  onShowScaleModal?: () => void;
  onShowZoomModal?: () => void;
  onShowAIDubModal?: () => void;
}

export const VideoControls = ({
  isGenerating,
  projectStatus,
  hasCaptions,
  onGenerateCaptions,
  onShowCaptionControls,
  onShowScriptModal,
  onShowStyleModal,
  onShowScaleModal,
  onShowZoomModal,
  onShowAIDubModal,
}: VideoControlsProps) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 p-6 bg-[#1A1A1A]">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        <TouchableOpacity
          onPress={onGenerateCaptions}
          disabled={isGenerating || projectStatus === "processing"}
          className="items-center mr-8"
        >
          <MaterialIcons
            name="auto-awesome"
            size={28}
            color={
              isGenerating || projectStatus === "processing"
                ? "#9CA3AF"
                : "white"
            }
          />
          <Text
            className={`text-sm mt-1 ${isGenerating || projectStatus === "processing" ? "text-gray-400" : "text-white"}`}
          >
            Generate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onShowCaptionControls}
          disabled={isGenerating || projectStatus === "processing" || !hasCaptions}
          className="items-center mr-8"
        >
          <MaterialIcons
            name="closed-caption"
            size={28}
            color={
              isGenerating || projectStatus === "processing" || !hasCaptions
                ? "#9CA3AF"
                : "white"
            }
          />
          <Text
            className={`text-sm mt-1 ${isGenerating || projectStatus === "processing" || !hasCaptions ? "text-gray-400" : "text-white"}`}
          >
            Captions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onShowScriptModal}
          className="items-center mr-8"
        >
          <MaterialIcons name="description" size={28} color="white" />
          <Text className="text-white text-sm mt-1">Script</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShowStyleModal} className="items-center mr-8">
          <MaterialIcons name="style" size={28} color="white" />
          <Text className="text-white text-sm mt-1">Style</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShowScaleModal} className="items-center mr-8">
          <MaterialIcons name="aspect-ratio" size={28} color="white" />
          <Text className="text-white text-sm mt-1">Scale</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShowZoomModal} className="items-center mr-8">
          <MaterialIcons name="zoom-in" size={28} color="white" />
          <Text className="text-white text-sm mt-1">Zoom</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShowAIDubModal} className="items-center">
          <FontAwesome name="microphone" size={28} color="white" />
          <Text className="text-white text-sm mt-1">AI Dub</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
