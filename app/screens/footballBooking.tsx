import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";

// Custom format
const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Returns "31-01-2024"
};

export default function footballBooking() {
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(Date.now() + 86400000)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const timeSlots = [
    "07:00 AM - 10:00 AM",
    "10:00 AM - 01:00 PM",
    "02:00 PM - 05:00 PM",
  ];

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleContinue = () => {
    if (selectedDate && selectedSlot) {
      // Navigate to user details page with selected date and time
      router.push({
        pathname: "/screens/userDetails",
        params: {
          date: selectedDate.toISOString(),
          timeSlot: selectedSlot,
        },
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "", // This removes the title/path
          headerBackTitle: "Back", // Optional: Changes "Back" text
          headerTransparent: true, // Makes header background transparent
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Book Your Football Slot</Text>

        <View style={styles.dateContainer}>
          <Text style={styles.subtitle}>Select Date:</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              minimumDate={new Date(Date.now() + 86400000)}
              onChange={handleDateChange}
            />
          )}
        </View>

        <Text style={styles.subtitle}>Select Time Slot:</Text>
        <ScrollView style={styles.slotsContainer}>
          <View style={styles.slotsGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slot,
                  selectedSlot === slot && styles.selectedSlot,
                ]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text
                  style={[
                    styles.slotText,
                    selectedSlot === slot && styles.selectedSlotText,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedDate || !selectedSlot) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedDate || !selectedSlot}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

// Update container style to account for header
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: 60, // Add padding to account for header
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
  dateContainer: {
    marginBottom: 20,
  },
  slotsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  slot: {
    width: "30%",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  selectedSlot: {
    backgroundColor: "#007AFF",
  },
  slotText: {
    fontSize: 14,
    color: "#333",
  },
  selectedSlotText: {
    color: "#fff",
  },
  continueButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 50,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginTop: 5,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
});
