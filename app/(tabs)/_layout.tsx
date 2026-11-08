import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { Colors } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: Colors.paper },
        headerShadowVisible: false,
        headerTitleStyle: { color: Colors.ink, fontWeight: "900" },
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: { backgroundColor: Colors.panel, borderTopColor: Colors.line, height: 66, paddingTop: 7, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "AI Coach",
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
