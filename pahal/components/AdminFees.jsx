import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchAllFees,
  fetchMonthlyFeesSummary,
} from "../redux/slices/feesSlice";
import { fetchAllStudents } from "../redux/slices/studentsSlice";
import SearchInput from "./SearchInput";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { notifyAllParents } from "../redux/slices/parentSlice";

const AdminFees = () => {
  const dispatch = useDispatch();

  const { feesRecords, monthlySummary } = useSelector((state) => state.fees);
  const { students } = useSelector((state) => state.student);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const getBorderColor = (status) => {
    if (status === "Pending") return "border-red-500";
    if (status === "Paid") return "border-green-500";
    return "border-gray-300";
  };

  const getStudentFeeStatus = (studentId) => {
    const studentFees = feesRecords.filter(
      (fee) => fee?.student_id?._id === studentId
    );

    if (studentFees.some((fee) => fee.status === "Pending")) return "Pending";
    if (studentFees.every((fee) => fee.status === "Paid")) return "Paid";

    return "Unknown";
  };

  const handleStudentPress = (student) => {
    router.push({
      pathname: "/student/student-fee-details",
      params: {
        studentId: student?._id,
      },
    });
  };

  const handleNotifyParents = async () => {
    setLoading(true);
    const result = await dispatch(notifyAllParents());
    if (result.meta.requestStatus === "fulfilled") {
      Alert.alert("सफलता", "सभी अभिभावकों को सफलतापूर्वक सूचित कर दिया गया।");
      setLoading(false);
    } else {
      Alert.alert(
        "त्रुटि",
        error || "अभिभावकों को सूचित करने में असफल। कृपया पुनः प्रयास करें।"
      );
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAllStudents());
      dispatch(fetchAllFees());
      dispatch(fetchMonthlyFeesSummary());
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(fetchAllStudents());
    dispatch(fetchAllFees());
    dispatch(fetchMonthlyFeesSummary());
    setRefreshing(false);
  };

  // Sort the filtered results based on fee status
  const sortedResults = filteredResults.sort((a, b) => {
    const feeStatusA = getStudentFeeStatus(a?._id);
    const feeStatusB = getStudentFeeStatus(b?._id);

    const priority = {
      Pending: 1,
      Paid: 2,
    };

    return priority[feeStatusA] - priority[feeStatusB];
  });

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
          <Text className="text-2xl font-semibold text-blue-700">फीस</Text>
        </View>

        {/* Search Bar */}
        <SearchInput
          placeholder="छात्र का नाम खोजें..."
          students={students}
          setFilteredResults={setFilteredResults}
        />

        {/* Monthly Fees Summary Card */}
        <View className="bg-blue-100 p-4 rounded-lg shadow-md">
          <Text className="text-lg font-bold text-blue-900 mb-2">
            मासिक शुल्क सारांश
          </Text>
          <View className="flex flex-row justify-between">
            <Text className="text-base text-blue-700">
              कुल शुल्क (वर्तमान माह):
            </Text>
            <Text className="text-base font-pbold text-blue-700">
              ₹{monthlySummary?.totalFeesCurrentMonth}
            </Text>
          </View>
          <View className="flex flex-row justify-between mt-1">
            <Text className="text-base  text-blue-700">कुल बकाया शुल्क:</Text>
            <Text className="text-base font-pbold text-red-700">
              ₹{monthlySummary?.totalUnpaidFees}
            </Text>
          </View>
        </View>

        <View className="flex items-end mt-4">
          <TouchableOpacity
            onPress={handleNotifyParents}
            className="bg-blue-500 py-3 px-5 rounded-lg flex-row items-center space-x-2"
            disabled={loading}
            style={{ alignSelf: "flex-end" }}
          >
            {/* Notification Icon */}
            <Ionicons name="notifications-outline" size={20} color="white" />

            {/* Button Text */}
            <Text className="text-white font-bold text-center">
              {loading
                ? "संदेश भेजा जा रहा है..."
                : "सभी अभिभावकों को सूचित करें"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Student List */}
        <FlatList
          data={sortedResults}
          keyExtractor={(item) => item?._id}
          renderItem={({ item }) => {
            const feeStatus = getStudentFeeStatus(item?._id);

            return (
              <TouchableOpacity
                onPress={() => handleStudentPress(item)}
                className={`p-4 mb-4 rounded-lg shadow-md bg-white flex-row justify-between items-center border-2 ${getBorderColor(
                  feeStatus
                )}`}
              >
                {/* Student Info */}
                <View>
                  <Text className="text-lg font-bold text-blue-900">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    कक्षा: {item.class}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    पिता का नाम: {item.parent_id.name}
                  </Text>
                </View>

                {/* Fee Status */}
                <View
                  className={`px-3 py-1 rounded-full ${
                    feeStatus === "Pending"
                      ? "bg-red-100"
                      : feeStatus === "Paid"
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      feeStatus === "Pending"
                        ? "text-red-600"
                        : feeStatus === "Paid"
                        ? "text-green-600"
                        : "text-gray-600"
                    } font-medium`}
                  >
                    {feeStatus === "Pending"
                      ? "बाकी"
                      : feeStatus === "Paid"
                      ? "भरी गई"
                      : "अज्ञात"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminFees;
