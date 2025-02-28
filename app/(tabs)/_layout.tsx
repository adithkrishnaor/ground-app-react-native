import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StyleSheet, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const tintColor = Colors[colorScheme ?? "light"].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: "#888",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                borderTopWidth: 1,
                borderTopColor: isDark ? "#333" : "#f0f0f0",
              },
            ]}
          />
        ),
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Entypo
              name="home"
              size={24}
              color={focused ? tintColor : "#888"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Book",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="check-to-slot"
              size={22}
              color={focused ? tintColor : "#888"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="lock-person"
              size={24}
              color={focused ? tintColor : "#888"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
