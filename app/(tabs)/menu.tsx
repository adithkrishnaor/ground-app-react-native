import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function MenuPage() {
  const router = useRouter();

  const sportOptions = [
    {
      id: "cricket",
      title: "Cricket",
      description:
        "Book cricket grounds and organize matches with other teams.",
      image: require("../../assets/images/cricket.png"),
      route: "/screens/cricketBooking" as const,
    },
    {
      id: "football",
      title: "Football",
      description:
        "Reserve football grounds and set up matches with other teams.",
      image: require("../../assets/images/football.png"),
      route: "/screens/footballBooking" as const,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sports Booking</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Choose your sport</Text>

        {sportOptions.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push(sport.route)}
          >
            <View style={styles.cardContent}>
              <Image
                source={sport.image}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.overlay} />
              <View style={styles.sportTitleContainer}>
                <Text style={styles.sportTitleText}>{sport.title}</Text>
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.description}>{sport.description}</Text>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Book Now</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="white"
                    style={styles.buttonIcon}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add extra space at bottom for tab bar */}
        <View style={{ height: 70 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333333",
    marginTop: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  cardContent: {
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 1,
  },
  sportTitleContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 30,
  },
  sportTitleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 160,
  },
  cardDetails: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333333",
  },
  description: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonIcon: {
    marginTop: 1,
  },
});
