import { Image, StyleSheet, Platform, Text } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
      alignItems: "center",
      top: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 20,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Welcome</ThemedText>
        <ThemedText style={styles.subtitle}>
          Find your perfect ground nearby
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}
