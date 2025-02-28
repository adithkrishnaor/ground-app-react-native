import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { router, Stack } from "expo-router";

interface BookingSlot {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  groundType: string;
  status: "pending" | "approved" | "rejected";
}

export default function adminDashboard() {
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");

  useEffect(() => {
    fetchBookings();
  }, [activeFilter]);

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, "bookings");
      let q;

      if (activeFilter === "all") {
        q = query(bookingsRef);
      } else {
        q = query(bookingsRef, where("status", "==", activeFilter));
      }

      const querySnapshot = await getDocs(q);

      const bookings: BookingSlot[] = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as BookingSlot);
      });

      setBookings(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to fetch bookings");
    }
  };

  const handleBookingAction = async (
    bookingId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: action === "approve" ? "approved" : "rejected",
      });

      // Show success message
      Alert.alert(
        "Success",
        `Booking ${action === "approve" ? "approved" : "rejected"} successfully`
      );

      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      Alert.alert("Error", "Failed to update booking status");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return styles.statusApproved;
      case "rejected":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  const handleLogout = () => {
    // Add your logout logic here (e.g., clearing auth state)
    router.push("/login");
  };

  const navigateToReports = () => {
    router.push("/screens/AdminReports");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Admin Dashboard",
          headerBackTitle: "Back",
          headerTransparent: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {/* Reports Navigation Button */}
        <TouchableOpacity
          style={styles.reportsButton}
          onPress={navigateToReports}
        >
          <Text style={styles.reportsButtonText}>View Reports</Text>
        </TouchableOpacity>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "all" && styles.activeFilter,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "pending" && styles.activeFilter,
            ]}
            onPress={() => setActiveFilter("pending")}
          >
            <Text style={styles.filterText}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "approved" && styles.activeFilter,
            ]}
            onPress={() => setActiveFilter("approved")}
          >
            <Text style={styles.filterText}>Approved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "rejected" && styles.activeFilter,
            ]}
            onPress={() => setActiveFilter("rejected")}
          >
            <Text style={styles.filterText}>Rejected</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>
          {activeFilter === "all"
            ? "All Bookings"
            : activeFilter === "pending"
            ? "Pending Bookings"
            : activeFilter === "approved"
            ? "Approved Bookings"
            : "Rejected Bookings"}
        </Text>

        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No {activeFilter} bookings found
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.bookingItem, getStatusStyle(item.status)]}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingName}>{item.name}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bookingText}>Email: {item.email}</Text>
                <Text style={styles.bookingText}>Phone: {item.phone}</Text>
                <Text style={styles.bookingText}>
                  Date: {formatDate(item.date)}
                </Text>
                <Text style={styles.bookingText}>Time: {item.timeSlot}</Text>
                <Text style={styles.bookingText}>
                  Ground: {item.groundType}
                </Text>

                {item.status === "pending" && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleBookingAction(item.id, "approve")}
                    >
                      <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleBookingAction(item.id, "reject")}
                    >
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeFilter: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontWeight: "500",
    color: "#333",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  bookingItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bookingName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#333",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  statusPending: {
    backgroundColor: "#fffdeb",
    borderLeftColor: "#ffc107",
  },
  statusApproved: {
    backgroundColor: "#f0fff0",
    borderLeftColor: "#4caf50",
  },
  statusRejected: {
    backgroundColor: "#fff0f0",
    borderLeftColor: "#f44336",
  },
  bookingText: {
    fontSize: 16,
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    width: 120,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#4caf50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    marginRight: 16,
    padding: 8,
  },
  logoutText: {
    color: "#f44336",
    fontWeight: "bold",
  },
  reportsButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  reportsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
