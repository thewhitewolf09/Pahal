import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";

import { fetchAttendanceByStudent } from "../redux/slices/attendanceSlice";

const ParentAttendance = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user); // Get user details
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [calendarMarkedDates, setCalendarMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);

  // Set default child when component mounts
  useEffect(() => {
    if (user.children_ids && user.children_ids.length > 0) {
      setSelectedChild(user.children_ids[0]);
    }
  }, [user]);

  // Fetch attendance for the selected child
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedChild) return;

      try {
        setLoading(true);
        const attendanceData = await dispatch(
          fetchAttendanceByStudent(selectedChild._id)
        ).unwrap();

        setAttendance(attendanceData);

        // Convert attendance data to calendar format
        const markedDates = attendanceData.reduce((acc, record) => {
          const dateKey = record.date.split("T")[0]; // Format: YYYY-MM-DD
          acc[dateKey] = {
            customStyles: {
              container: {
                backgroundColor: record.status === "Present" ? "green" : "red",
                borderRadius: 20,
              },
              text: {
                color: "white",
                fontWeight: "bold",
              },
            },
          };
          return acc;
        }, {});
        setCalendarMarkedDates(markedDates);
        setLoading(false);
      } catch (error) {
        console.log(error)
        setLoading(false);
        Alert.alert("त्रुटि", "उपस्थिति प्राप्त करने में असफल।");
      }
    };

    fetchAttendance();
  }, [selectedChild]);

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView className="flex flex-col p-4">
        {/* Header */}
        <View className="flex justify-between items-start flex-row mb-6">
          <Text className="text-2xl font-semibold text-blue-700">उपस्थिति</Text>
        </View>

        {/* Child Selector */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2 text-blue-700">
            बच्चा चुनें:
          </Text>
          <View className="border-2 border-blue-700 rounded-lg px-2 py-1 mt-2">
            <Picker
              selectedValue={selectedChild?._id || ""}
              onValueChange={(childId) =>
                setSelectedChild(
                  user.children_ids.find((child) => child._id === childId)
                )
              }
            >
              {user.children_ids.map((child) => (
                <Picker.Item
                  key={child._id}
                  label={`${child.name} (कक्षा: ${child.class})`}
                  value={child._id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Selected Child Info */}
        {selectedChild && (
          <View className="mb-4 p-4 rounded-lg bg-blue-100">
            <Text className="text-lg font-bold">नाम: {selectedChild.name}</Text>
            <Text className="text-sm">कक्षा: {selectedChild.class}</Text>
          </View>
        )}

        {/* Attendance Calendar */}
        {selectedChild && (
          <View className="mt-4">
            <Text className="text-lg font-semibold mb-2 text-blue-700">
              उपस्थिति कैलेंडर:
            </Text>
            <Calendar
              markedDates={calendarMarkedDates}
              markingType={"custom"}
              theme={{
                arrowColor: "#2563EB",
                todayTextColor: "#2563EB",
              }}
            />
          </View>
        )}

        {/* Message for no selection */}
        {!selectedChild && !loading && (
          <Text className="text-center text-gray-500 mt-6">
            कृपया उपस्थिति देखने के लिए बच्चे का चयन करें।
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentAttendance;
