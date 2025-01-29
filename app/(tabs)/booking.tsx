import { View, Text, StyleSheet } from "react-native";
import React from "react";

const booking = () => {
  return (
    <View style={styles.container}>
      <Text>Booking</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default booking;

// import { Calendar, DateData } from "react-native-calendars";
// import { View, Text, StyleSheet, Pressable } from "react-native";
// import { useState } from "react";

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   timeSlotContainer: {
//     marginTop: 20,
//   },
//   timeSlot: {
//     padding: 15,
//     marginVertical: 5,
//     backgroundColor: "#e0e0e0",
//     borderRadius: 8,
//   },
//   selectedSlot: {
//     backgroundColor: "#4CAF50",
//   },
//   slotText: {
//     textAlign: "center",
//     color: "#333",
//   },
//   selectedText: {
//     color: "#fff",
//   },
// });

// const timeSlots: string[] = [
//   "09:00 AM",
//   "10:00 AM",
//   "11:00 AM",
//   "02:00 PM",
//   "03:00 PM",
//   "04:00 PM",
// ];

// const BookingScreen: React.FC = () => {
//   const [selectedDate, setSelectedDate] = useState<string>("");
//   const [selectedSlot, setSelectedSlot] = useState<string>("");

//   return (
//     <View style={styles.container}>
//       <Calendar
//         onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
//         markedDates={{
//           [selectedDate]: { selected: true, selectedColor: "#4CAF50" },
//         }}
//         minDate={new Date().toISOString().split("T")[0]}
//       />

//       <View style={styles.timeSlotContainer}>
//         {selectedDate &&
//           timeSlots.map((slot) => (
//             <Pressable
//               key={slot}
//               style={[
//                 styles.timeSlot,
//                 selectedSlot === slot && styles.selectedSlot,
//               ]}
//               onPress={() => setSelectedSlot(slot)}
//             >
//               <Text
//                 style={[
//                   styles.slotText,
//                   selectedSlot === slot && styles.selectedText,
//                 ]}
//               >
//                 {slot}
//               </Text>
//             </Pressable>
//           ))}
//       </View>
//     </View>
//   );
// };

// export default BookingScreen;
