import React, { useState,  useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import {
  addPerformance,
  fetchAllPerformance,
  updatePerformance,
} from "../redux/slices/performanceSlice";
import { fetchAllStudents } from "../redux/slices/studentsSlice";
import { useFocusEffect } from "expo-router";

const AdminPerformance = () => {
  const dispatch = useDispatch();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [newResults, setNewResults] = useState({});
  const [editMarks, setEditMarks] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { students } = useSelector((state) => state.student);
  const { performanceRecords } = useSelector((state) => state.performance);

  const groupStudentsByClass = () =>
    students.reduce((acc, student) => {
      if (!acc[student.class]) acc[student.class] = [];
      const studentPerformance = performanceRecords
        .filter((rec) => rec.student_id?._id === student?._id)
        .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))[0];

      acc[student.class].push({
        ...student,
        lastResult: studentPerformance
          ? studentPerformance.marks
          : "कोई डेटा नहीं",
      });
      return acc;
    }, {});

  const groupedStudents = groupStudentsByClass();

  const handleUpdatePerformance = async (performanceId) => {
    if (!editMarks) {
      Alert.alert("त्रुटि", "कृपया अंक दर्ज करें।");
      return;
    }
    try {
      await dispatch(
        updatePerformance({ id: performanceId, marks: editMarks })
      ).unwrap();
      Alert.alert("सफलता", "प्रदर्शन अपडेट किया गया।");
      setEditingStudentId(null);
    } catch (error) {
      console.error(error);
      Alert.alert("त्रुटि", "प्रदर्शन अपडेट करने में विफल।");
    }
  };

  const handleAddNewResults = async () => {
    const results = Object.entries(newResults).filter(
      ([, marks]) => marks.trim() !== ""
    );
    if (results.length === 0) {
      Alert.alert("त्रुटि", "कम से कम एक छात्र के लिए अंक दर्ज करें।");
      return;
    }
    try {
      for (const [studentId, marks] of results) {
        await dispatch(addPerformance({ student_id: studentId, marks }));
      }
      Alert.alert("सफलता", "परिणाम प्रस्तुत किए गए।");
      setIsAddingNew(false);
      setNewResults({});
    } catch (error) {
      Alert.alert("त्रुटि", "परिणाम प्रस्तुत करने में विफल।");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(fetchAllStudents());
    dispatch(fetchAllPerformance());
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAllStudents());
      dispatch(fetchAllPerformance());
    }, [dispatch])
  );

  return (
    <SafeAreaView className="bg-white h-full">
      {/* Keyboard Avoiding View for proper input handling on mobile */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex flex-col my-3 px-4 space-y-6"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View className="flex justify-between items-start flex-row mb-6">
            <Text className="text-2xl font-semibold text-blue-700">
              प्रदर्शन
            </Text>
          </View>

          <View className="mb-6 flex-row justify-between items-center">
            <Text className="font-semibold text-xl text-gray-600 underline">
              मिश्रित रविवार टेस्ट
            </Text>
            {!isAddingNew && (
              <TouchableOpacity
                onPress={() => setIsAddingNew(true)}
                className="bg-blue-700 p-3 rounded-lg"
              >
                <Text className="text-white font-bold">नया परिणाम जोड़ें</Text>
              </TouchableOpacity>
            )}
          </View>

          {Object.entries(groupedStudents).map(
            ([className, studentsInClass]) => (
              <View key={className} className="mb-6">
                <Text className="text-lg font-bold text-blue-700 mb-3">
                  कक्षा: {className}
                </Text>
                {studentsInClass.map((student) => {
                  const studentPerformance = performanceRecords.find(
                    (rec) => rec.student_id?._id === student?._id
                  );
                  const performanceId = studentPerformance?._id;
                  return (
                    <View
                      key={student?._id}
                      className="bg-white p-3 shadow-md mb-2 rounded-lg"
                    >
                      {isAddingNew ? (
                        <View className="flex-row items-center justify-between">
                          <View>
                            <Text className="text-gray-800 font-semibold text-base">
                              {student.name}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              अभिभावक: {student.parent_id.name}
                            </Text>
                          </View>
                          <TextInput
                            placeholder="अंक (100 में)"
                            keyboardType="numeric"
                            value={newResults[student?._id] || ""}
                            onChangeText={(text) =>
                              setNewResults((prev) => ({
                                ...prev,
                                [student?._id]: text,
                              }))
                            }
                            className="p-3 rounded-md w-[40%] border-2 border-blue-600 font-semibold text-base"
                          />
                        </View>
                      ) : editingStudentId === student?._id ? (
                        <View className="flex-row items-center justify-between">
                          <View className="w-1/2">
                            <Text className="text-gray-800 font-semibold text-base">
                              {student.name}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              अभिभावक: {student.parent_id.name}
                            </Text>
                          </View>
                          <View className="flex-row justify-between items-center w-1/2">
                            <TextInput
                              placeholder="अंक"
                              keyboardType="numeric"
                              value={editMarks}
                              onChangeText={setEditMarks}
                              className="p-3 rounded-md w-[40%] border-2 border-blue-600 font-semibold text-base"
                            />
                            <View className="flex-row items-center w-[50%]">
                              <TouchableOpacity
                                onPress={() =>
                                  handleUpdatePerformance(performanceId)
                                } // Use performanceId
                                className="p-2 rounded-lg mr-2"
                              >
                                <FontAwesome6
                                  name="edit"
                                  size={24}
                                  color="#1D4ED8"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => setEditingStudentId(null)}
                                className="p-2 rounded-lg"
                              >
                                <MaterialIcons
                                  name="cancel"
                                  size={24}
                                  color="#D1D5DB"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <View className="flex-row items-center justify-between shadow-2xl">
                          <View className="w-1/2">
                            <Text className="text-gray-800 font-semibold text-base">
                              {student.name}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              अभिभावक: {student.parent_id.name}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between w-1/2">
                            <Text className="text-gray-800 font-semibold text-base">
                              {student.lastResult}/100
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                setEditingStudentId(student?._id);
                                setEditMarks(
                                  student.lastResult === "कोई डेटा नहीं"
                                    ? ""
                                    : student.lastResult
                                );
                              }}
                            >
                              <FontAwesome6
                                name="edit"
                                size={24}
                                color="#1D4ED8"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )
          )}

          {isAddingNew && (
            <View className="flex-row justify-between mt-4 mb-8">
              <TouchableOpacity
                onPress={handleAddNewResults}
                className="flex-1 mr-2"
              >
                <LinearGradient
                  colors={["#2563EB", "#1D4ED8"]}
                  className="rounded-lg p-4"
                >
                  <Text className="text-white text-center font-bold text-lg">
                    जमा करें
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsAddingNew(false);
                  setNewResults({});
                }}
                className="flex-1 ml-2 bg-gray-200 rounded-lg p-4"
              >
                <Text className="text-center font-bold text-lg text-gray-700">
                  रद्द करें
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AdminPerformance;
