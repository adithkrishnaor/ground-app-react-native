import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";

// Update the BookingSlot interface to match Firestore data
interface BookingSlot {
  id: string;
  timeSlot: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  groundType: string;
  name: string;
  email: string;
  phone: string;
}

// Custom format for display
const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Returns "31-01-2024"
};

// Format date for comparison (only date part without time)
const formatDateForComparison = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function cricketBooking() {
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(Date.now() + 86400000)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = ["09:00 AM - 05:00 PM"];
  const groundType = "cricket";

  // Clear selected slot when date changes
  useEffect(() => {
    setSelectedSlot(null);
    fetchBookingSlots();
  }, [selectedDate]);

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
          groundType: groundType,
        },
      });
    }
  };

  // Fixed fetchBookingSlots function with better date handling
  const fetchBookingSlots = async () => {
    try {
      setIsLoading(true);

      // Get all bookings for cricket grounds
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, where("groundType", "==", "cricket"));

      const querySnapshot = await getDocs(q);
      const slots: BookingSlot[] = [];

      // Format the selected date for comparison
      const selectedDateStr = formatDateForComparison(selectedDate);

      // Filter bookings for the selected date manually
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<BookingSlot, "id">;

        // Extract and compare only the date part
        const bookingDate = new Date(data.date);
        const bookingDateStr = formatDateForComparison(bookingDate);

        // Add only bookings that match the selected date
        if (bookingDateStr === selectedDateStr) {
          slots.push({
            id: doc.id,
            ...data,
          });
        }
      });

      setBookingSlots(slots);
      console.log("Fetched slots:", slots);
      console.log("Selected date for filtering:", selectedDateStr);
    } catch (error) {
      console.error("Error fetching slots:", error);
      // Handle error appropriately
      setBookingSlots([]);
      Alert.alert("Error", "Failed to load booking information.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed isSlotAvailable function that prioritizes approved and pending statuses
  const isSlotAvailable = (slot: string): boolean => {
    // Get all bookings for this specific slot
    const slotBookings = bookingSlots.filter((b) => b.timeSlot === slot);

    // If there are no bookings, the slot is available
    if (slotBookings.length === 0) {
      return true;
    }

    // If any booking is approved or pending, the slot is NOT available
    const hasApprovedOrPending = slotBookings.some(
      (booking) => booking.status === "approved" || booking.status === "pending"
    );

    return !hasApprovedOrPending;
  };

  // Improved getSlotStyle function with more distinct visual states
  const getSlotStyle = (slot: string) => {
    const slotBookings = bookingSlots.filter((b) => b.timeSlot === slot);

    // Default slot style (available)
    let slotStyle = [styles.slot];

    // If there are no bookings, return the default style (available)
    if (slotBookings.length === 0) {
      return slotStyle;
    }

    // Check for approved and pending bookings with priority on approved
    const hasApproved = slotBookings.some(
      (booking) => booking.status === "approved"
    );
    const hasPending = slotBookings.some(
      (booking) => booking.status === "pending"
    );

    if (hasApproved) {
      return [...slotStyle, styles.bookedSlot];
    }

    if (hasPending) {
      return [...slotStyle, styles.pendingSlot];
    }

    // If all bookings are rejected, the slot is available (default style)
    return slotStyle;
  };

  // Improved getSlotStatusText function with clear labeling
  const getSlotStatusText = (slot: string): string => {
    const slotBookings = bookingSlots.filter((b) => b.timeSlot === slot);

    // If there are no bookings, it's available
    if (slotBookings.length === 0) {
      return "Available";
    }

    // Check for approved bookings first (highest priority)
    if (slotBookings.some((booking) => booking.status === "approved")) {
      return "Booked";
    }

    // Then check for pending bookings
    if (slotBookings.some((booking) => booking.status === "pending")) {
      return "Pending Approval";
    }

    // If all bookings are rejected, the slot is available
    return "Available";
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackTitle: "Back",
          headerTransparent: true,
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Book Your Cricket Slot</Text>

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
        {isLoading ? (
          <Text style={styles.loadingText}>Loading available slots...</Text>
        ) : (
          <ScrollView style={styles.slotsContainer}>
            <View style={styles.slotsGrid}>
              {timeSlots.map((slot) => {
                const available = isSlotAvailable(slot);
                const slotStatus = getSlotStatusText(slot);

                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      getSlotStyle(slot),
                      selectedSlot === slot && available && styles.selectedSlot,
                    ]}
                    onPress={() => available && setSelectedSlot(slot)}
                    disabled={!available}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selectedSlot === slot &&
                          available &&
                          styles.selectedSlotText,
                        !available && styles.unavailableSlotText,
                      ]}
                    >
                      {slot}
                    </Text>
                    <Text
                      style={[
                        styles.statusText,
                        slotStatus === "Booked" && styles.bookedStatusText,
                        slotStatus === "Pending Approval" &&
                          styles.pendingStatusText,
                      ]}
                    >
                      {slotStatus}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

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

// Enhanced styles with more distinct colors for different slot states
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
    width: "98%", // Make slots full width for better visibility
    padding: 16,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#e8f5e9", // Light green for available slots
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },
  selectedSlot: {
    backgroundColor: "#4caf50", // Darker green for selected
    borderColor: "#2e7d32",
  },
  slotText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedSlotText: {
    color: "#fff",
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#4caf50", // Green to match the selected slot
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
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginTop: 5,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  bookedSlot: {
    backgroundColor: "#ffcdd2", // Light red for booked slots
    borderColor: "#e57373",
    opacity: 1,
  },
  pendingSlot: {
    backgroundColor: "#fff9c4", // Light yellow for pending slots
    borderColor: "#fff176",
    opacity: 1,
  },
  unavailableSlotText: {
    color: "#b71c1c", // Darker red for unavailable text
  },
  statusText: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  },
  bookedStatusText: {
    color: "#b71c1c", // Dark red
    fontWeight: "bold",
  },
  pendingStatusText: {
    color: "#f57f17", // Dark yellow/orange
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
  },
});
