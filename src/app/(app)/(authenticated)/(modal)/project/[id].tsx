import { CaptionControls } from "@/components/CaptionControls";
import {
  CaptionSettings,
  CaptionsOverlay,
  DEFAULT_CAPTION_SETTINGS,
} from "@/components/CaptionsOverlay";
import { VideoControls } from "@/components/VideoControls";
import { VoiceSelectionModal } from "@/components/VoiceSelectionModal";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatTime } from "@/utils/formatDuration";
import { Ionicons } from "@expo/vector-icons";
import { useAction, useMutation, useQuery } from "convex/react";
import { useEvent } from "expo";
import { useAudioPlayer } from "expo-audio";
import { downloadAsync, cacheDirectory, deleteAsync } from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { Stack, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCaptionControls, setShowCaptionControls] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [script, setScript] = useState("");
  const [isSavingScript, setIsSavingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>(
    DEFAULT_CAPTION_SETTINGS
  );
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [scriptModalTab, setScriptModalTab] = useState<"script" | "captions">("script");
  const [editingCaptionIndex, setEditingCaptionIndex] = useState<number | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState("");

  const project = useQuery(api.projects.get, {
    projectId: id as Id<"projects">,
  });
  const updateProject = useMutation(api.projects.update);
  const updateCaptionSettings = useMutation(api.projects.updateCaptionSettings);
  const updateProjectScript = useMutation(api.projects.updateScript);
  const processVideo = useAction(api.elevenlabs.processVideo);
  const generateSpeech = useAction(api.elevenlabs.generateSpeech);
  const exportVideo = useAction(api.exportvideo.generateCaptionedVideo);

  // Get the file URL from Convex storage
  const fileUrl = useQuery(
    api.projects.getFileUrl,
    project?.videoFileId
      ? { id: project.videoFileId as Id<"_storage"> }
      : "skip"
  );

  // Get the audio file URL from Convex storage
  const audioFileUrl = useQuery(
    api.projects.getFileUrl,
    project?.audioFileId
      ? { id: project.audioFileId as Id<"_storage"> }
      : "skip"
  );

  const player = useVideoPlayer(fileUrl || null, (player) => {
    player.loop = true;
    player.timeUpdateEventInterval = 1;
  });

  const audioPlayer = useAudioPlayer(audioFileUrl || null);
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Update currentTime state when player's currentTime changes
  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        setCurrentTime(player.currentTime);
      }, 10); // Update every 100ms for better accuracy
      return () => clearInterval(interval);
    }
  }, [player]);

  // Sync audio with video playback
  useEffect(() => {
    if (audioPlayer && player) {
      if (isPlaying) {
        player.muted = true;
        audioPlayer.play();
        player.currentTime = audioPlayer.currentTime;
      } else {
        audioPlayer.pause();
      }
    }
  }, [isPlaying, audioPlayer, player]);

  // Load caption settings from project
  useEffect(() => {
    if (project?.captionSettings) {
      setCaptionSettings(project.captionSettings);
    }
  }, [project?.captionSettings]);

  // Load script from project when it changes
  useEffect(() => {
    if (project?.script) {
      setScript(project.script);
    }
  }, [project?.script]);

  // Update caption settings in Convex
  const handleCaptionSettingsChange = async (
    newSettings: typeof captionSettings
  ) => {
    if (isUpdatingSettings) return; // Prevent multiple simultaneous updates

    try {
      setIsUpdatingSettings(true);

      // Update local state immediately for better UX
      setCaptionSettings(newSettings);

      // Call the mutation and wait for the result
      const result = await updateCaptionSettings({
        id: id as Id<"projects">,
        settings: newSettings,
      });
    } catch (error) {
      console.error("Failed to update caption settings:", error);
      // Revert the local state if the update fails
      if (project?.captionSettings) {
        setCaptionSettings(project.captionSettings);
      }
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleGenerateCaptions = async () => {
    if (!project) return;

    try {
      setIsGenerating(true);

      // Update project status to processing
      await updateProject({
        id: project._id,
        status: "processing",
      });

      // Get the video URL from storage
      const videoId = await project.videoFileId;

      // Call ElevenLabs API
      const result = await processVideo({
        videoId,
      });

      await updateProject({
        id: project._id,
        language: result.language_code,
        captions: result.words,
        status: "ready",
      });
    } catch (error) {
      console.error("Caption generation failed:", error);
      
      // Update project status to failed
      await updateProject({
        id: project._id,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      
      // Show user-friendly error alert
      let errorMessage = "Failed to generate captions. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("ElevenLabs API authentication failed")) {
          errorMessage = "ElevenLabs API authentication failed. Please check your API key or upgrade your plan.";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "API rate limit exceeded. Please wait a few minutes and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert("Caption Generation Failed", errorMessage, [{ text: "OK" }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const onExportVideo = async () => {
    if (!project) return;

    // Validate that captions exist before attempting export
    if (!project.captions || project.captions.length === 0) {
      Alert.alert(
        "Captions Required",
        "Please generate captions first by tapping the 'Generate Captions' button.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!project.captionSettings) {
      Alert.alert(
        "Caption Settings Required",
        "Please configure caption settings before exporting.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setIsExporting(true);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Media library permission not granted");
      }

      const result = await exportVideo({ id: project._id });

      if (result) {
        // Download the video to cache directory first
        const fileName = `exported_video_${new Date().getTime()}.mp4`;
        const fileUri = `${cacheDirectory}${fileName}`;
        
        const downloadResult = await downloadAsync(result, fileUri);
        
        if (downloadResult.status !== 200) {
          throw new Error("Failed to download video file");
        }

        // Save to media library from local file
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        
        // Clean up the cache file
        try {
          await deleteAsync(fileUri, { idempotent: true });
        } catch (cleanupError) {
          console.log("Cache cleanup warning:", cleanupError);
        }

        Alert.alert("Video Saved!", "Would you like to view it?", [
          {
            text: "View in Library",
            onPress: async () => {
              try {
                // Create an album if it doesn't exist
                const album =
                  await MediaLibrary.getAlbumAsync("Captions App");
                if (!album) {
                  await MediaLibrary.createAlbumAsync(
                    "Captions App",
                    asset,
                    false
                  );
                } else {
                  await MediaLibrary.addAssetsToAlbumAsync(
                    [asset],
                    album,
                    false
                  );
                }
                // Open the Photos app
                await Linking.openURL("photos-redirect://");
              } catch (error) {
                console.error("Error opening video:", error);
              }
            },
          },
          {
            text: "Close",
            style: "cancel",
          },
        ]);
      }
    } catch (error) {
      console.error("Export failed:", error);
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to export video. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("captions")) {
          errorMessage = "Cannot export video without captions. Please generate captions first.";
        } else if (error.message.includes("permission")) {
          errorMessage = "Permission denied. Please allow access to your media library.";
        } else if (error.message.includes("service is not available") || error.message.includes("404")) {
          errorMessage = "Video processing service is currently unavailable. Please contact support or try again later.";
        } else if (error.message.includes("temporarily unavailable")) {
          errorMessage = "Video processing service is temporarily busy. Please try again in a few minutes.";
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert("Export Failed", errorMessage, [{ text: "OK" }]);
    } finally {
      setIsExporting(false);
    }
  };

  const onGenerateSpeech = async (voiceId?: string) => {
    try {
      setIsGeneratingAudio(true);

      const audioUrl = await generateSpeech({
        projectId: id as Id<"projects">,
        voiceId: voiceId || selectedVoiceId || undefined,
      });
      if (audioUrl) {
        // Reset video and audio to beginning and start playback
        if (player) {
          player.currentTime = 0;
          player.play();
        }
      }
    } catch (error) {
      console.error("Failed to generate speech:", error);
      Alert.alert("Error", "Failed to generate speech. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
      setShowScriptModal(false);
    }
  };

  const handleCopyCaption = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied!", "Caption copied to clipboard");
  };

  const handleCopyAllCaptions = () => {
    if (!project?.captions) return;
    
    const allCaptionsText = project.captions
      .map((caption, index) => `${index + 1}. [${formatTime(caption.start)} → ${formatTime(caption.end)}]\n${caption.text}`)
      .join("\n\n");
    
    Clipboard.setString(allCaptionsText);
    Alert.alert("Copied!", `${project.captions.length} captions copied to clipboard`);
  };

  const handleEditCaption = (index: number, text: string) => {
    setEditingCaptionIndex(index);
    setEditingCaptionText(text);
  };

  const handleSaveCaption = async () => {
    if (editingCaptionIndex === null || !project?.captions) return;

    try {
      const updatedCaptions = [...project.captions];
      updatedCaptions[editingCaptionIndex] = {
        ...updatedCaptions[editingCaptionIndex],
        text: editingCaptionText,
      } as any; // Type assertion to handle schema differences

      await updateProject({
        id: project._id,
        captions: updatedCaptions as any,
      });

      setEditingCaptionIndex(null);
      setEditingCaptionText("");
      Alert.alert("Saved!", "Caption updated successfully");
    } catch (error) {
      console.error("Failed to update caption:", error);
      Alert.alert("Error", "Failed to update caption. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingCaptionIndex(null);
    setEditingCaptionText("");
  };

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-dark">
      <Stack.Screen
        options={{
          title: project.name,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                // Navigate back
                require("expo-router").router.back();
              }}
              className="w-10 h-10 items-center justify-center -ml-2"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={onExportVideo}
              className={`bg-primary rounded-xl px-4 py-2 ${isExporting ? "opacity-50" : ""}`}
              disabled={isExporting}
            >
              <Text className="text-white font-Poppins_600SemiBold text-base">
                {isExporting ? "Exporting..." : "Export"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Video Player */}
      <View className="mt-28 items-center">
        <VideoView
          player={player}
          style={{ width: "75%", height: "75%", borderRadius: 10 }}
        />
        {project.captions && (
          <CaptionsOverlay
            captions={project.captions}
            currentTime={currentTime}
            fontSize={captionSettings.fontSize}
            position={captionSettings.position}
            color={captionSettings.color}
          />
        )}
        <View className="w-3/4 flex-row items-center justify-between mt-4 bg-[#1A1A1A] p-3 rounded-full">
          <TouchableOpacity
            onPress={() => {
              if (isPlaying) {
                player.pause();
              } else {
                player.play();
              }
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <Text className="text-white font-medium">
            {formatTime(currentTime)} / {formatTime(player?.duration || 0)}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Bottom Bar */}
      <VideoControls
        isGenerating={isGenerating}
        projectStatus={project.status}
        hasCaptions={!!project.captions && project.captions.length > 0}
        onGenerateCaptions={handleGenerateCaptions}
        onShowCaptionControls={() =>
          setShowCaptionControls(!showCaptionControls)
        }
        onShowScriptModal={() => setShowScriptModal(true)}
        onShowStyleModal={() =>
          Alert.alert("Style", "Style customization coming soon!")
        }
        onShowScaleModal={() =>
          Alert.alert("Scale", "Video scaling options coming soon!")
        }
        onShowZoomModal={() =>
          Alert.alert("Zoom", "Zoom effects coming soon!")
        }
        onShowAIDubModal={() =>
          Alert.alert("AI Dub", "AI dubbing feature coming soon!")
        }
      />

      {/* Caption Controls */}
      {showCaptionControls && (
        <CaptionControls
          captionSettings={captionSettings}
          isUpdatingSettings={isUpdatingSettings}
          onCaptionSettingsChange={handleCaptionSettingsChange}
        />
      )}

      {/* Script Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showScriptModal}
        onRequestClose={() => setShowScriptModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-end">
            <View className="bg-[#1A1A1A] rounded-t-3xl p-6 h-2/3">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-Poppins_600SemiBold">
                  {scriptModalTab === "script" ? "Add Script" : "Generated Captions"}
                </Text>
                <TouchableOpacity onPress={() => setShowScriptModal(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Tab Switcher */}
              <View className="flex-row mb-4 bg-[#2A2A2A] rounded-xl p-1">
                <TouchableOpacity
                  onPress={() => setScriptModalTab("script")}
                  className={`flex-1 py-2 rounded-lg ${scriptModalTab === "script" ? "bg-primary" : ""}`}
                >
                  <Text className={`text-center font-Poppins_600SemiBold ${scriptModalTab === "script" ? "text-white" : "text-gray-400"}`}>
                    Script
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setScriptModalTab("captions")}
                  className={`flex-1 py-2 rounded-lg ${scriptModalTab === "captions" ? "bg-primary" : ""}`}
                >
                  <Text className={`text-center font-Poppins_600SemiBold ${scriptModalTab === "captions" ? "text-white" : "text-gray-400"}`}>
                    Captions {project?.captions && `(${project.captions.length})`}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              {scriptModalTab === "script" ? (
                <>
                  <TextInput
                    className="bg-[#2A2A2A] text-white p-4 rounded-xl h-[60%] mb-4 font-Poppins_400Regular"
                    multiline
                    placeholder="Paste or write your script here..."
                    placeholderTextColor="#666"
                    value={script}
                    onChangeText={setScript}
                    textAlignVertical="top"
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          setIsSavingScript(true);
                          await updateProjectScript({
                            id: id as Id<"projects">,
                            script,
                          });
                          setShowScriptModal(false);
                        } catch (error) {
                          console.error("Failed to save script:", error);
                          Alert.alert(
                            "Error",
                            "Failed to save script. Please try again."
                          );
                        } finally {
                          setIsSavingScript(false);
                        }
                      }}
                      disabled={isSavingScript}
                      className={`flex-1 bg-primary p-4 rounded-xl ${isSavingScript ? "opacity-50" : ""}`}
                    >
                      <Text className="text-white text-center font-Poppins_600SemiBold">
                        {isSavingScript ? "Saving..." : "Save Script"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowScriptModal(false);
                        setTimeout(() => setShowVoiceModal(true), 100);
                      }}
                      disabled={isGeneratingAudio || !script}
                      className={`flex-1 bg-[#2A2A2A] p-4 rounded-xl ${isGeneratingAudio || !script ? "opacity-50" : ""}`}
                    >
                      <Text className="text-white text-center font-Poppins_600SemiBold">
                        {isGeneratingAudio ? "Generating..." : "Select Voice"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {project?.captions && project.captions.length > 0 ? (
                    <>
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-400 text-sm font-Poppins_500Medium">
                          {project.captions.length} captions
                        </Text>
                        <TouchableOpacity
                          onPress={handleCopyAllCaptions}
                          className="bg-[#2A2A2A] px-3 py-2 rounded-lg flex-row items-center"
                        >
                          <Ionicons name="copy-outline" size={16} color="#3B82F6" />
                          <Text className="text-primary text-sm font-Poppins_600SemiBold ml-1">
                            Copy All
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView className="flex-1 bg-[#2A2A2A] rounded-xl p-4 mb-4">
                        {project.captions.map((caption, index) => (
                          <View key={index} className="mb-3 pb-3 border-b border-gray-700">
                            <View className="flex-row justify-between items-center mb-2">
                              <Text className="text-gray-400 text-xs font-Poppins_500Medium">
                                #{index + 1}
                              </Text>
                              <View className="flex-row gap-2">
                                <TouchableOpacity
                                  onPress={() => handleCopyCaption(caption.text)}
                                  className="p-1"
                                >
                                  <Ionicons name="copy-outline" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => handleEditCaption(index, caption.text)}
                                  className="p-1"
                                >
                                  <Ionicons name="create-outline" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                              </View>
                            </View>
                            <Text className="text-gray-400 text-xs font-Poppins_400Regular mb-2">
                              {formatTime(caption.start)} → {formatTime(caption.end)}
                            </Text>
                            {editingCaptionIndex === index ? (
                              <View>
                                <TextInput
                                  className="bg-[#1A1A1A] text-white p-2 rounded-lg mb-2 font-Poppins_400Regular"
                                  multiline
                                  value={editingCaptionText}
                                  onChangeText={setEditingCaptionText}
                                  autoFocus
                                />
                                <View className="flex-row gap-2">
                                  <TouchableOpacity
                                    onPress={handleSaveCaption}
                                    className="flex-1 bg-primary p-2 rounded-lg"
                                  >
                                    <Text className="text-white text-center text-sm font-Poppins_600SemiBold">
                                      Save
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={handleCancelEdit}
                                    className="flex-1 bg-gray-700 p-2 rounded-lg"
                                  >
                                    <Text className="text-white text-center text-sm font-Poppins_600SemiBold">
                                      Cancel
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ) : (
                              <Text className="text-white font-Poppins_400Regular text-base">
                                {caption.text}
                              </Text>
                            )}
                          </View>
                        ))}
                      </ScrollView>
                    </>
                  ) : (
                    <View className="flex-1 items-center justify-center bg-[#2A2A2A] rounded-xl mb-4">
                      <Ionicons name="document-text-outline" size={48} color="#666" />
                      <Text className="text-gray-400 text-center mt-3 font-Poppins_500Medium">
                        No captions generated yet
                      </Text>
                      <Text className="text-gray-500 text-center mt-1 font-Poppins_400Regular text-sm">
                        Generate captions to see them here
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => setShowScriptModal(false)}
                    className="bg-primary p-4 rounded-xl"
                  >
                    <Text className="text-white text-center font-Poppins_600SemiBold">
                      Close
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Loading Overlay */}
      {isExporting && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-4 font-Poppins_600SemiBold">
            Exporting video...
          </Text>
        </View>
      )}

      {isGeneratingAudio && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-4 font-Poppins_600SemiBold">
            Generating audio...
          </Text>
        </View>
      )}

      {isGenerating && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-4 font-Poppins_600SemiBold">
            Generating captions...
          </Text>
        </View>
      )}

      {/* Voice Selection Modal - Rendered last to be on top */}
      {showVoiceModal && (
        <View className="absolute inset-0 z-[100]">
          <VoiceSelectionModal
            visible={showVoiceModal}
            onClose={() => setShowVoiceModal(false)}
            onSelectVoice={(voiceId) => {
              setSelectedVoiceId(voiceId);
              setShowVoiceModal(false);
              onGenerateSpeech(voiceId);
            }}
          />
        </View>
      )}
    </View>
  );
};

export default Page;
