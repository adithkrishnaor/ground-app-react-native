import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";

// Define type for Firestore booking data
interface BookingDetails {
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  groundType: string;
  timestamp: Date;
  status: "pending" | "approved" | "rejected";
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function userDetails() {
  const router = useRouter();
  const { date, timeSlot, groundType } = useLocalSearchParams<{
    date: string;
    timeSlot: string;
    groundType: string;
  }>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleConfirm = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (phone.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const newBooking: BookingDetails = {
        name,
        email,
        phone,
        date,
        timeSlot,
        groundType: groundType as string,
        timestamp: new Date(),
        status: "pending",
      };
      await addDoc(collection(db, "bookings"), newBooking);
      Alert.alert(
        "Booking Confirmed",
        `Date: ${formatDate(
          date as string
        )} \nTime: ${timeSlot} \nName: ${name} \nEmail: ${email} \nPhone: ${phone}`
      );
    } catch (error) {
      Alert.alert("Error", "An error occurred while processing your booking");
      console.log("Firestore Error", error);
    }
    // Handle the booking confirmation
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={[styles.container, { paddingTop: 50 }]}>
        <Text style={styles.title}>Confirm Booking</Text>

        <View style={styles.bookingDetails}>
          <Text style={styles.subtitle}>Booking Details:</Text>
          <Text style={styles.detailText}>
            Date: {formatDate(date as string)}
          </Text>
          {timeSlot && <Text style={styles.detailText}>Time: {timeSlot}</Text>}
          <Text style={styles.detailText}>
            Ground: {groundType === "cricket" ? "Cricket" : "Football"}
          </Text>
        </View>

        <View style={[styles.form, styles.bookingDetails]}>
          <Text style={styles.subtitle}>Your Details:</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
            maxLength={10}
          />
          <Pressable style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirm Booking</Text>
          </Pressable>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  bookingDetails: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
