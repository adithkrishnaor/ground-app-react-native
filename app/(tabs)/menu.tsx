import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function MenuPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Cricket Card */}
      <View style={styles.card}>
        <Image
          source={require("../../assets/images/cricket.png")}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.title}>Cricket</Text>
        <Text style={styles.description}>
          Book cricket grounds and organize matches with other teams.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/screens/cricketBooking")}
        >
          <Text style={styles.buttonText}>Book Slot for Cricket</Text>
        </TouchableOpacity>
      </View>

      {/* Football Card */}
      <View style={styles.card}>
        <Image
          source={require("../../assets/images/football.png")}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.title}>Football</Text>
        <Text style={styles.description}>
          Reserve football grounds and set up matches with other teams.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/screens/footballBooking")}
        >
          <Text style={styles.buttonText}>Book Slot for Football</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
