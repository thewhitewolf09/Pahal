import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  RefreshControl,
  TextInput,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { fetchAllFees, fetchFeesByParent } from "../redux/slices/feesSlice";
import {
  fetchPaymentHistory,
  processPayment,
} from "../redux/slices/paymentSlice";
import CustomButton from "./CustomButton";
import RazorpayCheckout from "react-native-razorpay";
import { images } from "../constants";

const ParentFees = () => {
  const dispatch = useDispatch();
  const { feesRecords, feesByParent } = useSelector((state) => state.fees);
  const { paymentHistory } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);
  const [isFeeModalVisible, setIsFeeModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  const fetchAllData = async () => {
    await dispatch(fetchFeesByParent(user?._id)).unwrap();
    await dispatch(fetchPaymentHistory(user?._id)).unwrap();
    await dispatch(fetchAllFees()).unwrap();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleFeePayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("कृपया मान्य भुगतान राशि दर्ज करें।");
      return;
    }

    const options = {
      description: "फीस भुगतान",
      image: images.logo,
      currency: "INR",
      key: process.env.YOUR_RAZORPAY_KEY_ID,
      amount: paymentAmount * 100, // Amount in paise (₹1 = 100 paise)
      name: "PAHAL",
      prefill: {
        // email: user?.email || "example@example.com",
        contact: user?.phone || "9999999999",
        name: user?.name || "Parent",
      },
      theme: { color: "#1d4ed8" },
    };

    try {
      const paymentResult = await RazorpayCheckout.open(options);
      // Payment Success
      alert(
        `भुगतान सफल! ट्रांजैक्शन आईडी: ${paymentResult.razorpay_payment_id}`
      );
      setIsModalVisible(false);

      // Dispatch payment details to backend
      const updatedFee = {
        parent_id: user?._id,
        amountPaid: paymentAmount,
        transactionId: paymentResult.razorpay_payment_id,
      };
      await dispatch(processPayment(updatedFee)).unwrap();
      fetchAllData();
    } catch (error) {
      // Payment Failure
      console.error("Payment Error: ", error);
      alert("भुगतान रद्द या असफल हो गया। कृपया पुनः प्रयास करें।");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        className="px-4 py-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="flex justify-between items-center flex-row mb-6">
          <Text className="text-2xl font-semibold text-blue-700">फीस</Text>
        </View>

        {/* Fee Overview */}
        <View className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            बच्चों का शुल्क विवरण
          </Text>

          {/* Table Header */}
          <View className="flex-row justify-between border-b border-gray-300 pb-2">
            <Text className="text-base font-medium text-gray-600">नाम</Text>
            <Text className="text-base font-medium text-gray-600">
              मासिक शुल्क
            </Text>
            <Text className="text-base font-medium text-gray-600">स्थिति</Text>
          </View>

          {/* Fee Rows */}
          {feesByParent && feesByParent.length > 0 ? (
            [
              ...new Map(
                feesByParent.map((fee) => [fee.student_id?._id, fee.student_id])
              ).values(),
            ].map((student) => (
              <View
                key={student?._id}
                className="flex-row justify-between py-2 border-b border-gray-100"
              >
                <Text className="text-base text-gray-700">
                  {student?.name || "जानकारी उपलब्ध नहीं"}
                </Text>
                <Text className="text-base text-blue-700">
                  ₹
                  {feesByParent.find(
                    (fee) => fee.student_id?._id === student?._id
                  )?.amount || "0"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStudent(student);
                    setIsFeeModalVisible(true);
                  }}
                  className="bg-blue-100 px-3 py-1 rounded"
                >
                  <Text className="text-sm text-blue-700 font-semibold">
                    अधिक जानकारी
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-500 mt-4">
              कोई शुल्क जानकारी उपलब्ध नहीं है।
            </Text>
          )}
        </View>

        <View className="bg-white shadow-md p-6 rounded-lg mt-6 mb-6 border border-gray-200">
          {(() => {
            const totalFees = feesByParent.reduce(
              (total, fee) => total + fee.amount,
              0
            );
            const totalPayments = paymentHistory.reduce(
              (total, payment) => total + payment.amount_paid,
              0
            );
            const balance = totalPayments - totalFees;

            if (balance === 0) {
              return (
                <Text className="text-xl font-semibold text-green-600 text-center">
                  🎉 फीस पूरी तरह से भुगतान की गई है! 🎉
                </Text>
              );
            } else if (balance > 0) {
              return (
                <Text className="text-xl font-semibold text-green-600 text-center">
                  अतिरिक्त राशि: ₹{balance}
                </Text>
              );
            } else {
              return (
                <Text className="text-xl font-semibold text-red-500 text-center">
                  बकाया राशि: ₹{Math.abs(balance)}
                </Text>
              );
            }
          })()}
        </View>

        <CustomButton
          title="फीस जमा करें"
          handlePress={() => setIsModalVisible(true)}
        />

        {/* Payment History */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-blue-700 mt-6 mb-4">
            भुगतान इतिहास
          </Text>
          <FlatList
            data={paymentHistory}
            keyExtractor={(item) => item?._id}
            renderItem={({ item }) => (
              <View className="p-4 mb-4 bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Payment Date */}
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">तारीख:</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {new Date(item.payment_date).toLocaleString("hi-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Text>
                </View>

                {/* Payment Amount */}
                <View className="flex-row justify-between mt-2">
                  <Text className="text-sm text-gray-600">राशि:</Text>
                  <Text className="text-sm font-semibold text-green-700">
                    ₹{item.amount_paid}
                  </Text>
                </View>

                {/* Transaction ID */}
                <View className="flex-row justify-between mt-2">
                  <Text className="text-sm text-gray-600">लेनदेन आईडी:</Text>
                  <Text className="text-sm font-semibold text-gray-500">
                    {item.transaction_id || "उपलब्ध नहीं"}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text className="text-center text-gray-500">
                कोई भुगतान इतिहास उपलब्ध नहीं है।
              </Text>
            )}
          />
        </View>

        {/* Modal for Fee Details */}
        <Modal
          visible={isFeeModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-lg">
              <Text className="text-xl font-semibold text-blue-700 mb-4">
                {selectedStudent?.name || "जानकारी उपलब्ध नहीं"} का शुल्क विवरण
              </Text>
              <ScrollView>
                <View className="border border-gray-300 rounded-lg overflow-hidden">
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
                  {feesRecords
                    .filter(
                      (fee) => fee.student_id?._id === selectedStudent?._id
                    )
                    .map((fee) => (
                      <View
                        key={fee?._id}
                        className="flex-row border-b border-gray-300"
                      >
                        {/* Calculated Month */}
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
                          ₹{fee.amount}
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
                  {/* Fallback Message */}
                  {feesRecords.filter(
                    (fee) => fee.student_id?._id === selectedStudent?._id
                  ).length === 0 && (
                    <Text className="text-center text-gray-500 py-4">
                      कोई शुल्क जानकारी उपलब्ध नहीं है।
                    </Text>
                  )}
                </View>
              </ScrollView>
              <TouchableOpacity
                onPress={() => setIsFeeModalVisible(false)}
                className="bg-gray-300 mt-4 py-2 rounded-lg"
              >
                <Text className="text-center text-gray-800 font-semibold">
                  बंद करें
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal for Fee Payment */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-lg">
              <Text className="text-xl font-semibold text-blue-700 mb-6">
                फीस का भुगतान करें
              </Text>
              <TextInput
                placeholder="भुगतान राशि दर्ज करें"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700 text-base"
              />
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={handleFeePayment}
                  className="bg-blue-600 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">
                    भुगतान करें
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  className="bg-gray-300 px-6 py-3 rounded-lg"
                >
                  <Text className="text-gray-800 font-semibold text-center">
                    रद्द करें
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentFees;
