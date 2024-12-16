import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAllStudents } from "../redux/slices/studentsSlice";
import {
  fetchAttendanceByDate,
  addAttendance,
  updateAttendance,
} from "../redux/slices/attendanceSlice"; 
import { router, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Ionicons from "react-native-vector-icons/Ionicons";


const AdminAttendance = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState({
    date: new Date(),
    showPicker: false,
  });
  const [attendance, setAttendance] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { students } = useSelector((state) => state.student);
  const { attendanceRecords, attendanceByDate } = useSelector(
    (state) => state.attendance
  );

  const { user, role } = useSelector((state) => state.user);

  // Helper to check if the selected date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const fetchAttendance = async (date) => {
    try {
      const formattedDate = formatDate(date);
      const fetchedAttendance = await dispatch(
        fetchAttendanceByDate(formattedDate)
      ).unwrap();

      if (fetchedAttendance && fetchedAttendance.length > 0) {
        // Convert fetched attendance array into the desired format
        const attendanceMap = fetchedAttendance.reduce((acc, record) => {
          acc[record.student_id._id] = record.status;
          return acc;
        }, {});

        setAttendance(attendanceMap);
        setIsEditing(true);
      } else {
        setAttendance({});
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch attendance for the selected date.");
    }
  };

  const saveAttendance = async () => {
    const formattedDate = formatDate(selectedDate.date);
    try {
      if (isEditing) {
        await dispatch(
          updateAttendance({ date: formattedDate, attendance })
        ).unwrap();
        Alert.alert("Success", "Attendance updated successfully.");
      } else {
        await dispatch(
          addAttendance({ date: formattedDate, attendance })
        ).unwrap();
        Alert.alert("Success", "Attendance saved successfully.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save attendance.");
    }
  };

  const getStudents = async () => {
    try {
      await dispatch(fetchAllStudents()).unwrap();
    } catch (error) {
      Alert.alert("Error", "Failed to fetch student list.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getStudents();
    await fetchAttendance(selectedDate.date);
    setRefreshing(false);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  const formatDate = (date) =>
    `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;

  const groupStudentsByClass = (students) => {
    return students.reduce((acc, student) => {
      if (!acc[student.class]) acc[student.class] = [];
      acc[student.class].push(student);
      return acc;
    }, {});
  };

  const groupedStudents = groupStudentsByClass(students);

  useFocusEffect(
    useCallback(() => {
      getStudents();
      fetchAttendance(selectedDate.date);
    }, [selectedDate.date])
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        className="flex flex-col my-3 px-4 space-y-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="flex justify-between items-start flex-row mb-6">
          <Text className="text-2xl font-semibold text-blue-700">उपस्थिति</Text>
        </View>

        {/* Date Selector */}
        <View className="flex flex-row justify-between items-center my-5 px-4">
          <Text className="text-lg font-semibold text-gray-700">
            दिनांक: {formatDate(selectedDate.date)}
          </Text>
          <TouchableOpacity
            className="p-2"
            onPress={() =>
              setSelectedDate({
                date: selectedDate.date,
                showPicker: true,
              })
            }
          >
            <MaterialIcons name="calendar-today" size={24} color="blue" />
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {selectedDate.showPicker && (
          <DateTimePicker
            value={selectedDate.date}
            mode="date"
            display="default"
            onChange={(event, date) => {
              if (date) {
                setSelectedDate({ date, showPicker: false });
                fetchAttendance(date);
              } else {
                setSelectedDate((prev) => ({ ...prev, showPicker: false }));
              }
            }}
          />
        )}

        {/* Student List */}
        {Object.entries(groupedStudents).map(([className, studentsInClass]) => (
          <View key={className} className="mb-5 px-4">
            <Text className="text-lg font-bold text-blue-800 mb-3">
              कक्षा: {className}
            </Text>
            <View className="space-y-3">
              {studentsInClass.map((student) => (
                <View
                  key={student._id}
                  className="flex flex-row justify-between items-center bg-white shadow-2xl rounded-lg p-3"
                >
                  <View>
                    <Text className="text-lg font-medium text-gray-700">
                      {student.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      अभिभावक: {student.parent_id.name}
                    </Text>
                  </View>
                  <View className="flex flex-row space-x-4 justify-center items-center">
                    <TouchableOpacity
                      onPress={() =>
                        handleAttendanceChange(student._id, "Present")
                      }
                      className={`w-12 h-12 rounded-full flex justify-center items-center ${
                        attendance[student._id] === "Present"
                          ? "bg-green-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <Text className="text-white font-bold">P</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleAttendanceChange(student._id, "Absent")
                      }
                      className={`w-12 h-12 rounded-full flex justify-center items-center ${
                        attendance[student._id] === "Absent"
                          ? "bg-red-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <Text className="text-white font-bold">A</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Save Button */}
        {isToday(selectedDate.date) && (
          <View className="flex items-center mt-5">
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              className="rounded-lg p-4 w-4/5"
            >
              <TouchableOpacity onPress={saveAttendance}>
                <Text className="text-white text-center font-bold text-lg">
                  {isEditing ? "उपस्थिति अपडेट करें" : "उपस्थिति दर्ज करें"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminAttendance;
