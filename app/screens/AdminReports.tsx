import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { router, Stack } from "expo-router";
import { BarChart, LineChart } from "react-native-chart-kit";

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

export default function AdminReports() {
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly" | "yearly">(
    "monthly"
  );
  const [groundFilter, setGroundFilter] = useState<
    "all" | "cricket" | "football"
  >("all");
  const [reportData, setReportData] = useState({
    labels: [] as string[],
    approved: [] as number[],
    rejected: [] as number[],
    pending: [] as number[],
    totalCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    cricketCount: 0,
    footballCount: 0,
  });

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      generateReportData();
    }
  }, [bookings, timeFrame, groundFilter]);

  const fetchAllBookings = async () => {
    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef);
      const querySnapshot = await getDocs(q);

      const fetchedBookings: BookingSlot[] = [];
      querySnapshot.forEach((doc) => {
        fetchedBookings.push({ id: doc.id, ...doc.data() } as BookingSlot);
      });

      setBookings(fetchedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const generateReportData = () => {
    const currentDate = new Date();
    let labels: string[] = [];
    let approvedData: { [key: string]: number } = {};
    let rejectedData: { [key: string]: number } = {};
    let pendingData: { [key: string]: number } = {};

    // Initialize data structure based on timeFrame
    if (timeFrame === "weekly") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(currentDate.getDate() - i);
        const label = date.toLocaleDateString("en-US", { weekday: "short" });
        labels.push(label);
        approvedData[label] = 0;
        rejectedData[label] = 0;
        pendingData[label] = 0;
      }
    } else if (timeFrame === "monthly") {
      // Last 30 days (grouped by week)
      for (let i = 0; i < 4; i++) {
        const label = `Week ${i + 1}`;
        labels.push(label);
        approvedData[label] = 0;
        rejectedData[label] = 0;
        pendingData[label] = 0;
      }
    } else if (timeFrame === "yearly") {
      // Last 12 months
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      for (let i = 0; i < 12; i++) {
        const monthIndex = (currentDate.getMonth() - i + 12) % 12;
        const label = monthNames[monthIndex];
        labels.push(label);
        approvedData[label] = 0;
        rejectedData[label] = 0;
        pendingData[label] = 0;
      }
      // Reverse the array to show chronological order
      labels = labels.reverse();
    }

    // Process booking data
    let approvedCount = 0;
    let rejectedCount = 0;
    let pendingCount = 0;
    let cricketCount = 0;
    let footballCount = 0;

    // Filter bookings by ground type first
    const filteredBookings = bookings.filter((booking) => {
      if (groundFilter === "all") {
        return true;
      }
      return booking.groundType.toLowerCase() === groundFilter;
    });

    // Now process the filtered bookings
    filteredBookings.forEach((booking) => {
      // Count by ground type
      if (booking.groundType.toLowerCase() === "cricket") {
        cricketCount++;
      } else if (booking.groundType.toLowerCase() === "football") {
        footballCount++;
      }

      const bookingDate = new Date(booking.date);
      let label = "";
      let include = false;

      if (timeFrame === "weekly") {
        label = bookingDate.toLocaleDateString("en-US", { weekday: "short" });
        // Only count bookings from the last 7 days
        const daysDiff =
          (currentDate.getTime() - bookingDate.getTime()) / (1000 * 3600 * 24);
        include = daysDiff <= 7;
      } else if (timeFrame === "monthly") {
        // Group into weeks (last 30 days)
        const daysDiff =
          (currentDate.getTime() - bookingDate.getTime()) / (1000 * 3600 * 24);
        if (daysDiff <= 30) {
          const weekNum = Math.floor(daysDiff / 7);
          if (weekNum < 4) {
            label = `Week ${4 - weekNum}`;
            include = true;
          }
        }
      } else if (timeFrame === "yearly") {
        // Only count bookings from the last 12 months
        const monthDiff =
          (currentDate.getMonth() - bookingDate.getMonth() + 12) % 12;
        const yearDiff = currentDate.getFullYear() - bookingDate.getFullYear();

        include = yearDiff === 0 || (yearDiff === 1 && monthDiff === 0);

        if (include) {
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          label = monthNames[bookingDate.getMonth()];
        }
      }

      if (include && labels.includes(label)) {
        if (booking.status === "approved") {
          approvedData[label]++;
          approvedCount++;
        } else if (booking.status === "rejected") {
          rejectedData[label]++;
          rejectedCount++;
        } else {
          pendingData[label]++;
          pendingCount++;
        }
      }
    });

    // Convert data objects to arrays that match the order of labels
    const approvedArray = labels.map((label) => approvedData[label] || 0);
    const rejectedArray = labels.map((label) => rejectedData[label] || 0);
    const pendingArray = labels.map((label) => pendingData[label] || 0);

    setReportData({
      labels,
      approved: approvedArray,
      rejected: rejectedArray,
      pending: pendingArray,
      totalCount: approvedCount + rejectedCount + pendingCount,
      approvedCount,
      rejectedCount,
      pendingCount,
      cricketCount,
      footballCount,
    });
  };

  const handleLogout = () => {
    router.push("/login");
  };

  // Update the chart configurations
  const screenWidth = Dimensions.get("window").width - 32; // Account for container padding
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
      paddingRight: 16, // Add padding to prevent label cutoff
    },
    barPercentage: 0.5,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#e3e3e3",
    },
    propsForLabels: {
      fontSize: 12, // Smaller font size for better fit
    },
  };

  // Update the bar data structure
  const barData = {
    labels: reportData.labels,
    datasets: [
      {
        data: reportData.approved.map((val) => val || 0), // Handle null/undefined values
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      },
      {
        data: reportData.rejected.map((val) => val || 0),
        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
      },
      {
        data: reportData.pending.map((val) => val || 0),
        color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
      },
    ],
    legend: ["Approved", "Rejected", "Pending"],
  };

  // Update the line data structure
  const lineData = {
    labels: reportData.labels,
    datasets: [
      {
        data: reportData.labels.map(
          (_, i) =>
            (reportData.approved[i] || 0) +
            (reportData.rejected[i] || 0) +
            (reportData.pending[i] || 0)
        ),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      },
    ],
    legend: ["Total Bookings"],
  };

  // Create ground type distribution data
  const groundDistributionData = {
    labels: ["Cricket", "Football"],
    datasets: [
      {
        data: [reportData.cricketCount || 0, reportData.footballCount || 0],
        color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
      },
    ],
    legend: ["Bookings Count"],
  };

  // In the return statement, wrap the charts in error boundaries
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Booking Reports",
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
      <ScrollView style={styles.container}>
        {/* Time Frame Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              timeFrame === "weekly" && styles.activeFilter,
            ]}
            onPress={() => setTimeFrame("weekly")}
          >
            <Text style={styles.filterText}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              timeFrame === "monthly" && styles.activeFilter,
            ]}
            onPress={() => setTimeFrame("monthly")}
          >
            <Text style={styles.filterText}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              timeFrame === "yearly" && styles.activeFilter,
            ]}
            onPress={() => setTimeFrame("yearly")}
          >
            <Text style={styles.filterText}>Yearly</Text>
          </TouchableOpacity>
        </View>

        {/* Ground Type Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              groundFilter === "all" && styles.activeFilter,
            ]}
            onPress={() => setGroundFilter("all")}
          >
            <Text style={styles.filterText}>All Grounds</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              groundFilter === "cricket" && styles.activeFilter,
            ]}
            onPress={() => setGroundFilter("cricket")}
          >
            <Text style={styles.filterText}>Cricket</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              groundFilter === "football" && styles.activeFilter,
            ]}
            onPress={() => setGroundFilter("football")}
          >
            <Text style={styles.filterText}>Football</Text>
          </TouchableOpacity>
        </View>

        {/* Ground Type Stats */}
        <View style={styles.groundStatsContainer}>
          <Text style={styles.chartTitle}>
            {groundFilter === "all"
              ? "Ground Type Distribution"
              : `${
                  groundFilter.charAt(0).toUpperCase() + groundFilter.slice(1)
                } Ground Stats`}
          </Text>
          <View style={styles.statsContainer}>
            {groundFilter === "all" && (
              <>
                <View style={[styles.statBox, styles.cricketStat]}>
                  <Text style={styles.statValue}>
                    {reportData.cricketCount}
                  </Text>
                  <Text style={styles.statLabel}>Cricket</Text>
                </View>
                <View style={[styles.statBox, styles.footballStat]}>
                  <Text style={styles.statValue}>
                    {reportData.footballCount}
                  </Text>
                  <Text style={styles.statLabel}>Football</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, styles.totalStat]}>
            <Text style={styles.statValue}>{reportData.totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statBox, styles.approvedStat]}>
            <Text style={styles.statValue}>{reportData.approvedCount}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={[styles.statBox, styles.rejectedStat]}>
            <Text style={styles.statValue}>{reportData.rejectedCount}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
          <View style={[styles.statBox, styles.pendingStat]}>
            <Text style={styles.statValue}>{reportData.pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Ground Distribution Chart (only shown when "All Grounds" is selected) */}
        {groundFilter === "all" && reportData.labels.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Ground Type Distribution</Text>
            <BarChart
              data={groundDistributionData}
              width={screenWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
              }}
              verticalLabelRotation={0}
              showValuesOnTopOfBars
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
              style={styles.barChartStyle}
            />
          </View>
        )}

        {/* Booking Status Distribution Chart */}
        {reportData.labels.length > 0 ? (
          <>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                {groundFilter === "all"
                  ? "Booking Status Distribution"
                  : `${
                      groundFilter.charAt(0).toUpperCase() +
                      groundFilter.slice(1)
                    } Booking Status`}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={barData}
                  width={Math.max(screenWidth, reportData.labels.length * 60)} // Adjust width based on number of labels
                  height={220}
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  showValuesOnTopOfBars
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix=""
                  style={styles.barChartStyle}
                />
              </ScrollView>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                {groundFilter === "all"
                  ? "Total Bookings Trend"
                  : `${
                      groundFilter.charAt(0).toUpperCase() +
                      groundFilter.slice(1)
                    } Bookings Trend`}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={lineData}
                  width={Math.max(screenWidth, reportData.labels.length * 60)}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.lineChartStyle}
                  fromZero
                />
              </ScrollView>
            </View>
          </>
        ) : null}

        {/* Navigate to Dashboard Button */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => router.push("/screens/adminDashboard")}
        >
          <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
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
  logoutButton: {
    marginRight: 16,
    padding: 8,
  },
  logoutText: {
    color: "#f44336",
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeFilter: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontWeight: "500",
    color: "#333",
  },
  groundStatsContainer: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    width: "48%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  totalStat: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  approvedStat: {
    backgroundColor: "#e8f5e9",
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  rejectedStat: {
    backgroundColor: "#ffebee",
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  pendingStat: {
    backgroundColor: "#fffde7",
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  cricketStat: {
    backgroundColor: "#e0f7fa",
    borderLeftWidth: 4,
    borderLeftColor: "#00bcd4",
  },
  footballStat: {
    backgroundColor: "#f3e5f5",
    borderLeftWidth: 4,
    borderLeftColor: "#9c27b0",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  chartContainer: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    width: "100%", // Ensure full width
    alignItems: "center", // Center the chart
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  dashboardButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  dashboardButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  barChartStyle: {
    marginVertical: 8,
    borderRadius: 16,
    paddingVertical: 8,
  },
  lineChartStyle: {
    marginVertical: 8,
    borderRadius: 16,
    paddingVertical: 8,
  },
});
