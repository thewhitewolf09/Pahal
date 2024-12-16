import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  TextInput,
  Button,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"; // Access the router
import { fetchFeesByParent } from "../../redux/slices/feesSlice";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchStudentById } from "../../redux/slices/studentsSlice";
import {
  deletePayment,
  fetchPaymentHistory,
  processPayment,
} from "../../redux/slices/paymentSlice";
import CustomButton from "../../components/CustomButton";

const FeeDetailsScreen = () => {
  const dispatch = useDispatch();
  const { studentId } = useLocalSearchParams();
  const { feesByParent } = useSelector((state) => state.fees);
  const { paymentHistory } = useSelector((state) => state.payment);

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

// Fetch student details
const fetchStudent = async () => {
  try {
    const result = await dispatch(fetchStudentById(studentId)).unwrap();
    setStudent(result);

    if (result?.parent_id?._id) {
      // Fetch related data only if parent_id is available
      await fetchRelatedData(result.parent_id._id);
    }
  } catch (error) {
    console.error("Error fetching student:", error.message || error);
    alert("छात्र विवरण प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।");
  }
};

// Fetch fees and payment history based on parent_id
const fetchRelatedData = async (parentId) => {
  try {
    await dispatch(fetchFeesByParent(parentId)).unwrap();
    await dispatch(fetchPaymentHistory(parentId)).unwrap();
  } catch (error) {
    console.error("Error fetching related data:", error.message || error);
    alert("डेटा प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।");
  }
};

// Wrapper to fetch all data
const fetchAllData = async () => {
  setLoading(true);
  await fetchStudent();
  setLoading(false);
};

useFocusEffect(
  useCallback(() => {
    fetchAllData();
  }, [studentId])
);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const calculateTotalDueAndExtra = () => {
    const totalFees = feesByParent.reduce((sum, fee) => sum + parseInt(fee.amount), 0);
    const totalPayments = paymentHistory.reduce((sum, payment) => sum + parseInt(payment.amount_paid), 0);

    if (totalFees === totalPayments) {
      return { totalDue: 0, totalExtra: 0 };
    } else if (totalFees > totalPayments) {
      return { totalDue: totalFees - totalPayments, totalExtra: 0 };
    } else {
      return { totalDue: 0, totalExtra: totalPayments - totalFees };
    }
  };

  const handleFeeUpdate = async () => {
    const updatedFee = {
      parent_id: student?.parent_id?._id,
      amountPaid: paymentAmount,
    };

    try {
      await dispatch(processPayment(updatedFee)).unwrap();
      alert("फ़ीस अपडेट सफलतापूर्वक हो गई।");
      setIsModalVisible(false);
      fetchRelatedData(); // Refresh fees and payment history
    } catch (error) {
      console.error("Error updating fee:", error.message || error);
      alert("फ़ीस अपडेट करने में समस्या हुई। कृपया पुनः प्रयास करें।");
    }
  };

  const handleDeletePayment = (paymentId) => {
    Alert.alert(
      "पुष्टि करें",
      "क्या आप वाकई इस भुगतान को हटाना चाहते हैं?",
      [
        {
          text: "रद्द करें",
          style: "cancel",
        },
        {
          text: "हां, हटाएं",
          onPress: async () => {
            try {
              await dispatch(deletePayment(paymentId)).unwrap();
              alert("भुगतान सफलतापूर्वक हटा दिया गया।");
              fetchRelatedData();
            } catch (error) {
              console.error("Error deleting payment:", error.message || error);
              alert("भुगतान हटाने में समस्या हुई। कृपया पुनः प्रयास करें।");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const { totalDue, totalExtra } = calculateTotalDueAndExtra();

  if (loading) {
    return (
      <View className="flex justify-center flex-row items-center h-full">
        <ActivityIndicator color="blue" size="large" />
      </View>
    );
  }

  if (!student) {
    return (
      <View className="flex justify-center flex-row items-center h-full">
        <Text className="text-lg font-semibold text-gray-700">
          छात्र विवरण उपलब्ध नहीं है।
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        className="px-4 py-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex justify-between items-start flex-row mb-6">
          <Text className="text-2xl font-semibold text-blue-700">
            फीस जानकारी
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1d4ed8" />
          </TouchableOpacity>
        </View>

        {/* Student Overview */}
        <View className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
          <View className="space-y-2">
            <View className="flex flex-row items-center">
              <Text className="w-1/3 text-gray-500 text-base font-medium">
                नाम:
              </Text>
              <Text className="w-2/3 text-gray-800 text-lg font-semibold">
                {student?.name}
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <Text className="w-1/3 text-gray-500 text-base font-medium">
                कक्षा:
              </Text>
              <Text className="w-2/3 text-gray-800 text-lg font-semibold">
                {student?.class}
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <Text className="w-1/3 text-gray-500 text-base font-medium">
                पिता का नाम:
              </Text>
              <Text className="w-2/3 text-gray-800 text-lg font-semibold">
                {student?.parent_id.name}
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <Text className="w-1/3 text-gray-500 text-base font-medium">
                पिता का फ़ोन:
              </Text>
              <Text className="w-2/3 text-gray-800 text-lg font-semibold">
                {student?.parent_id.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Fee Overview */}
        <View className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-6">
          <View className="space-y-4">
            {/* Show Total Due only if fees are not extra and not fully cleared */}
            {totalExtra === 0 && totalDue > 0 && (
              <View className="flex flex-row justify-between items-center">
                <Text className="text-gray-600 text-base font-medium">
                  कुल बकाया:
                </Text>
                <Text className="text-lg font-semibold text-red-600">
                  ₹{totalDue} (बकाया)
                </Text>
              </View>
            )}

            {/* Show Total Extra only if fees are extra */}
            {totalExtra > 0 && (
              <View className="flex flex-row justify-between items-center">
                <Text className="text-gray-600 text-base font-medium">
                  कुल अतिरिक्त राशि:
                </Text>
                <Text className="text-lg font-semibold text-green-600">
                  ₹{totalExtra}
                </Text>
              </View>
            )}

            {/* Show Status Message */}
            <View className="flex justify-center items-center mt-4">
              {totalDue === 0 && totalExtra === 0 ? (
                <Text className="bg-green-100 text-green-700 text-lg font-bold py-2 px-4 rounded-lg shadow-md">
                  फीस पूरी हो चुकी है 🎉
                </Text>
              ) : totalDue > 0 ? (
                <Text className="bg-red-100 text-red-700 text-lg font-bold py-2 px-4 rounded-lg shadow-md">
                  फीस बकाया है!
                </Text>
              ) : (
                <Text className="bg-green-100 text-green-700 text-lg font-bold py-2 px-4 rounded-lg shadow-md">
                  अतिरिक्त फीस का भुगतान किया गया है!
                </Text>
              )}
            </View>
          </View>
        </View>

        <CustomButton
          title="Update Fee"
          handlePress={() => setIsModalVisible(true)}
        />

        {/* Payment History */}
        <View className="mb-4 mt-8">
          <Text className="text-xl font-semibold text-blue-700 mb-4">
            भुगतान इतिहास
          </Text>
          <FlatList
            data={paymentHistory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View className="p-4 mb-4 rounded-lg bg-white shadow-sm border border-gray-200">
                {/* Card Content */}
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-600 text-sm font-medium">
                    भुगतान तिथि:
                  </Text>
                  <Text className="text-gray-800 text-base font-semibold">
                    {new Date(item.payment_date).toLocaleDateString("hi-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-600 text-sm font-medium">
                    राशि:
                  </Text>
                  <Text className="text-green-700 text-base font-bold">
                    ₹{item.amount_paid}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 text-sm font-medium">
                    ट्रांजेक्शन आईडी:
                  </Text>
                  <Text className="text-gray-800 text-sm">
                    {item.transaction_id}
                  </Text>
                </View>

                {/* Delete Button Positioned Outside the Content */}
                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    onPress={() => handleDeletePayment(item._id)}
                    className="bg-red-100 p-2 rounded-full shadow-md hover:bg-red-200 active:scale-95"
                  >
                    <Ionicons name="trash-bin" size={18} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <View>
                <Text>कोई भुगतान इतिहास नहीं है</Text>
              </View>
            )}
            
          />
        </View>
      </ScrollView>

      {/* Modal for Fee Update */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-lg">
            <Text className="text-xl font-semibold text-blue-700 mb-6">
              अपडेट फीस
            </Text>
            {/* Payment Amount Input */}
            <TextInput
              placeholder="भुगतान राशि दर्ज करें"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700 text-base"
            />

            {/* Action Buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={handleFeeUpdate}
                className="bg-blue-600 px-6 py-3 rounded-lg shadow-lg"
              >
                <Text className="text-white text-center font-semibold">
                  अपडेट करें
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="bg-gray-300 px-6 py-3 rounded-lg shadow-lg"
              >
                <Text className="text-gray-800 text-center font-semibold">
                  रद्द करें
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FeeDetailsScreen;
