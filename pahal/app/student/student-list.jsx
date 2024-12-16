import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAllStudents } from "../../redux/slices/studentsSlice";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SearchInput } from "../../components";
import { router } from "expo-router";

const StudentList = () => {
  const dispatch = useDispatch();
  const { students } = useSelector((state) => state.student);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    dispatch(fetchAllStudents());
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchAllStudents());
    setRefreshing(false);
  };

  const handleStudentPress = (student) => {
    router.push({
        pathname: "/student/student-details",
        params: {
          studentId: student._id,
        },
      });
  };

  // Group students by class
  const groupStudentsByClass = (studentsList) => {
    const grouped = studentsList.reduce((acc, student) => {
      const className = student.class || "Unknown";
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(student);
      return acc;
    }, {});

    return Object.entries(grouped).map(([className, students]) => ({
      title: `कक्षा ${className}`,
      data: students,
    }));
  };

  const groupedStudents = groupStudentsByClass(
    filteredResults.length > 0 ? filteredResults : students
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
        <View className="flex justify-between items-center flex-row mb-6">
          <Text className="text-2xl font-semibold text-blue-700">छात्र सूची</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1d4ed8" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchInput
          placeholder="छात्र का नाम खोजें..."
          students={students}
          setFilteredResults={setFilteredResults}
        />

        {/* Grouped Student List */}
        <SectionList
          sections={groupedStudents}
          keyExtractor={(item) => item._id}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="text-lg font-bold text-blue-900 bg-gray-100 px-4 py-2 rounded-md mt-4 mb-2">
              {title}
            </Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleStudentPress(item)}
              className="p-4 mb-4 rounded-lg shadow-md bg-white flex-row justify-between items-center border border-gray-300"
            >
              {/* Student Info */}
              <View>
                <Text className="text-lg font-semibold text-blue-800">{item.name}</Text>
                <Text className="text-sm text-gray-700 mt-2">
                  कक्षा: <Text className="font-medium">{item.class}</Text>
                </Text>
                <Text className="text-sm text-gray-700 mt-1">
                  पिता का नाम: <Text className="font-medium">{item.parent_id.name}</Text>
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentList;
