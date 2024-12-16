import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { Calendar } from "react-native-calendars";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  deleteStudent,
  fetchStudentById,
} from "../../redux/slices/studentsSlice";
import { fetchFeesByParent } from "../../redux/slices/feesSlice";
import { fetchAttendanceByStudent } from "../../redux/slices/attendanceSlice";
import { fetchPerformanceByStudent } from "../../redux/slices/performanceSlice";

const StudentDetail = () => {
  const dispatch = useDispatch();
  const { studentId } = useLocalSearchParams();
  const { student } = useSelector((state) => state.student);
  const { feesByParent } = useSelector((state) => state.fees);
  const { performanceByStudent } = useSelector((state) => state.performance);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [calendarMarkedDates, setCalendarMarkedDates] = useState({});

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");

  const fetchStudent = async () => {
    try {
      const result = await dispatch(fetchStudentById(studentId)).unwrap();
      if (result?.parent_id?._id) {
        await fetchRelatedData(result.parent_id._id);
      }
    } catch (error) {
      console.error("Error fetching student:", error.message || error);
      alert("छात्र विवरण प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।");
    }
  };

  const fetchRelatedData = async (parentId) => {
    try {
      await dispatch(fetchFeesByParent(parentId)).unwrap();
      await dispatch(fetchPerformanceByStudent(studentId)).unwrap();
    } catch (error) {
      console.error("Error fetching related data:", error.message || error);
      alert("डेटा प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।");
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        const attendanceData = await dispatch(
          fetchAttendanceByStudent(studentId)
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
        setLoading(false);
        Alert.alert("त्रुटि", "उपस्थिति प्राप्त करने में असफल।");
      }
    };

    fetchAttendance();
  }, [dispatch, studentId]);

  const fetchAllData = async () => {
    setLoading(true);
    await fetchStudent();
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleDeleteStudent = async () => {
    const normalizedInput = deleteConfirmationName.trim().toLowerCase();
    const normalizedName = student?.name.trim().toLowerCase();

    if (normalizedInput === normalizedName) {
      try {
        // Dispatch delete action
        await dispatch(deleteStudent(studentId));
        alert("छात्र को सफलतापूर्वक हटा दिया गया।");
        router.push("/student/student-list");
      } catch (error) {
        alert("चालू प्रक्रिया में कोई त्रुटि हुई।");
      } finally {
        setDeleteModalVisible(false);
      }
    } else {
      alert("आपके द्वारा दिया गया नाम गलत है।");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex justify-between items-center flex-row px-4 py-3">
          <Text className="text-2xl font-semibold text-blue-700">
            छात्र विवरण
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1d4ed8" />
          </TouchableOpacity>
        </View>

        <View className="bg-white p-6 mx-4 my-6 rounded-xl shadow-md border border-gray-300">
          {/* Header Section with Icons */}
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-blue-800">
              {student?.name || "जानकारी उपलब्ध नहीं"}
            </Text>
            <View className="flex flex-row space-x-4">
              {/* Edit Icon */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/student/edit-student",
                    params: {
                      studentId: student._id,
                    },
                  })
                }
                className="p-2 bg-blue-50 rounded-full shadow-sm"
              >
                <Ionicons name="create-outline" size={20} color="#2563EB" />
              </TouchableOpacity>
              {/* Delete Icon */}
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(true)}
                className="p-2 bg-red-50 rounded-full shadow-sm"
              >
                <Ionicons name="trash-outline" size={20} color="#FF0000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Student Details */}
          <View className="space-y-2">
            <Text className="text-base text-gray-500 font-bold">
              <Text className="font-medium text-gray-800">कक्षा: </Text>
              {student?.class || "N/A"}
            </Text>
            <Text className="text-base text-gray-500 font-bold">
              <Text className="font-medium text-gray-800">पिता का नाम: </Text>
              {student?.parent_id?.name || "N/A"}
            </Text>
            <Text className="text-base text-gray-500 font-bold">
              <Text className="font-medium text-gray-800">फ़ोन: </Text>
              {student?.parent_id?.phone || "N/A"}
            </Text>
            <Text className="text-base text-gray-500 font-bold">
              <Text className="font-medium text-gray-800">मासिक शुल्क: </Text>₹
              {feesByParent.filter((fee) => fee.student_id._id === studentId)[
                feesByParent.filter((fee) => fee.student_id._id === studentId)
                  .length - 1
              ]?.amount || "N/A"}
            </Text>
            <Text className="text-base text-gray-500 font-bold">
              <Text className="font-medium text-gray-800">आवास: </Text>
              {student?.accommodation ? "हाँ" : "नहीं"}
            </Text>
          </View>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={isDeleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center bg-black">
            <View className="bg-white p-6 rounded-xl w-4/5">
              <Text className="text-xl font-semibold text-blue-800 mb-4">
                छात्र को हटाने की पुष्टि करें
              </Text>
              <Text className="text-base text-gray-600 mb-2">
                कृपया छात्र का नाम{" "}
                <Text className="font-bold">{student?.name}</Text> दर्ज करें:
              </Text>
              <TextInput
                value={deleteConfirmationName}
                onChangeText={setDeleteConfirmationName}
                placeholder="नाम दर्ज करें"
                className="border border-gray-300 p-2 rounded mb-4"
              />
              <View className="flex flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setDeleteModalVisible(false)}
                  className="bg-gray-200 p-2 rounded-lg"
                >
                  <Text className="text-gray-700">रद्द करें</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteStudent}
                  className="bg-red-600 p-2 rounded-lg"
                >
                  <Text className="text-white">हटाएं</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View className="px-4 py-6 space-y-4">
          <Text className="text-lg font-semibold text-blue-700 mb-2">
            उपस्थिति कैलेंडर
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

        <View className="px-4 py-6 space-y-4">
          <Text className="text-lg font-semibold text-blue-700 mb-2">
            प्रदर्शन इतिहास
          </Text>
          <ScrollView className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Table Header */}
            <View className="flex-row bg-gray-200 border-b border-gray-300">
              <Text className="flex-1 text-center py-2 font-semibold text-gray-800">
                तारीख
              </Text>
              <Text className="flex-1 text-center py-2 font-semibold text-gray-800">
                विषय
              </Text>
              <Text className="flex-1 text-center py-2 font-semibold text-gray-800">
                अंक
              </Text>
            </View>

            {/* Table Rows */}
            {performanceByStudent.map((entry) => (
              <View
                key={entry._id}
                className="flex-row border-b border-gray-300"
              >
                {/* Test Date */}
                <Text className="flex-1 text-center py-2 text-gray-600">
                  {entry.test_date
                    ? new Date(entry.test_date).toLocaleDateString("hi-IN")
                    : "N/A"}
                </Text>

                {/* Subject */}
                <Text className="flex-1 text-center py-2 text-gray-800">
                  {entry.subject || "N/A"}
                </Text>

                {/* Marks */}
                <Text className="flex-1 text-center py-2 text-gray-800">
                  {entry.marks || 0}
                </Text>
              </View>
            ))}

            {/* Fallback Message */}
            {performanceByStudent.length === 0 && (
              <Text className="text-center text-gray-500 py-4">
                कोई प्रदर्शन डेटा उपलब्ध नहीं है।
              </Text>
            )}
          </ScrollView>
        </View>

        <View className="px-4 py-6 space-y-4">
          {/* Fees History Modal */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-blue-700 mb-2">
              शुल्क इतिहास
            </Text>
            <ScrollView className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Table Header */}
              <View className="flex-row bg-gray-200 border-b border-gray-300">
                <Text className="flex-1 text-center py-2 font-semibold text-gray-800">
                  माह
                </Text>
                <Text className="flex-1 text-center py-2 font-semibold text-gray-800">
                  अंतिम तिथि
                </Text>
                <Text className="flex-1 text-center py-2 font-semibold text-gray-800">
                  शुल्क
                </Text>
                <Text className="flex-1 text-center py-2 font-semibold text-gray-800">
                  स्थिति
                </Text>
              </View>

              {/* Table Rows */}
              {feesByParent
                .filter((fee) => fee.student_id._id === studentId)
                .map((fee) => (
                  <View
                    key={fee._id}
                    className="flex-row border-b border-gray-300"
                  >
                    {/* Month */}
                    <Text className="flex-1 text-center py-2 text-gray-800">
                      {fee.due_date
                        ? new Date(
                            new Date(fee.due_date).setMonth(
                              new Date(fee.due_date).getMonth() + 1
                            )
                          ).toLocaleString("hi-IN", { month: "long" })
                        : "N/A"}
                    </Text>

                    {/* Due Date */}
                    <Text className="flex-1 text-center py-2 text-gray-600">
                      {fee.due_date
                        ? new Date(fee.due_date).toLocaleDateString("hi-IN")
                        : "N/A"}
                    </Text>

                    {/* Amount */}
                    <Text className="flex-1 text-center py-2 text-gray-800">
                      ₹{fee?.amount || 0}
                    </Text>

                    {/* Payment Status */}
                    <Text
                      className={`flex-1 text-center py-2 font-semibold ${
                        fee.status === "Paid"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {fee.status === "Paid" ? "भुगतान हुआ" : "बकाया"}
                    </Text>
                  </View>
                ))}

              {/* No Fees Data Fallback */}
              {feesByParent.filter((fee) => fee.student_id._id === studentId)
                .length === 0 && (
                <Text className="text-center text-gray-500 py-4">
                  कोई शुल्क जानकारी उपलब्ध नहीं है।
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentDetail;
