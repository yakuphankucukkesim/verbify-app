import CreateButton from "@/components/CreateButton";
import { HapticTab } from "@/components/HapticTab";
import { twFullConfig } from "@/utils/twconfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

const Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: (twFullConfig.theme.colors as any).dark,
          height: 100,
          elevation: 0,
          borderTopColor: "#494949",
        },
        headerStyle: {
          backgroundColor: (twFullConfig.theme.colors as any).dark,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontFamily: "Poppins_600SemiBold",
          fontSize: 22,
        },
        headerTintColor: "#fff",
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Poppins_500Medium",
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#6c6c6c",
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarButton: (props) => <CreateButton {...props} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};
export default Layout;
