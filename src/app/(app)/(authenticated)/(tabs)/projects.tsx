import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "expo-router";
import LottieView from "lottie-react-native";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
const Page = () => {
  const projects = useQuery(api.projects.list);
  const deleteProject = useMutation(api.projects.remove);

  const handleDeleteProject = (project: Doc<"projects">) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProject({ id: project._id });
            } catch (error) {
              Alert.alert("Error", "Failed to delete project. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (projects === undefined) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <Text className="text-white text-lg font-Poppins_500Medium">
          Loading projects...
        </Text>
      </View>
    );
  }

  if (!projects.length) {
    return (
      <View className="flex-1 bg-dark items-center justify-center p-4">
        <View className="items-center">
          <LottieView
            source={require("@/assets/lotties/loadingfile.json")}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
          <Text className="text-white text-xl font-Poppins_600SemiBold mt-4 text-center">
            No project yet
          </Text>
          <Text className="text-gray-400 text-base font-Poppins_400Regular mt-2 text-center">
            Hit the button below to add your first projects and see some magic!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <FlatList
        data={projects}
        className="px-4"
        contentContainerStyle={{ paddingVertical: 20 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item: project }: { item: Doc<"projects"> }) => (
          <View className="bg-[#1c1c1e] rounded-2xl p-4 flex-row items-center">
            <Link href={`/project/${project._id}`} asChild>
              <TouchableOpacity className="flex-1 flex-row items-center">
                <View className="flex-1">
                  <Text className="text-white text-lg font-Poppins_600SemiBold">
                    {project.name}
                  </Text>
                  <Text className="text-gray-400 text-sm font-Poppins_400Regular mt-1">
                    Last update {formatDistanceToNow(project.lastUpdate)} ago •{" "}
                    {(project.videoSize / 1024 / 1024).toFixed(1)} MB
                  </Text>
                </View>
                <View className="bg-[#2c2c2e] w-10 h-10 rounded-xl items-center justify-center">
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              onPress={() => handleDeleteProject(project)}
              className="bg-red-500/20 w-10 h-10 rounded-xl items-center justify-center ml-2"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default Page;
