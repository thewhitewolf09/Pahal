import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  RefreshControl,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import {
  deleteParent,
  fetchParentById,
  sendReminder,
} from "../../redux/slices/parentSlice";
import { CustomButton } from "../../components";
import { fetchFeesByParent } from "../../redux/slices/feesSlice";
import { fetchPaymentHistory } from "../../redux/slices/paymentSlice";

const ParentDetailScreen = () => {
  const dispatch = useDispatch();
  const { parentId } = useLocalSearchParams();
  const { feesByParent } = useSelector((state) => state.fees);
  const { parent } = useSelector((state) => state.parent);
  const { paymentHistory } = useSelector((state) => state.payment);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFeeModalVisible, setIsFeeModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  const fetchParentDetails = async (id) => {
    try {
      await dispatch(fetchParentById(id));
      await dispatch(fetchFeesByParent(id));
      await dispatch(fetchPaymentHistory(id));
    } catch (error) {
      console.error("Failed to fetch parent details:", error);
    }
  };

  useEffect(() => {
    if (parentId) fetchParentDetails(parentId);
  }, [parentId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchParentDetails(parentId);
    setRefreshing(false);
  };

  const handleDeleteParent = async () => {
    const normalizedInput = deleteConfirmationName.trim().toLowerCase();
    const normalizedName = parent?.name.trim().toLowerCase();

    if (normalizedInput === normalizedName) {
      try {
        await dispatch(deleteParent(parentId)).unwrap();
        alert("अभिभावक को सफलतापूर्वक हटा दिया गया।");
        router.push("/parent/parent-list");
      } catch (error) {
        alert("अभिभावक को हटाने में समस्या हुई।");
        console.error("Delete Parent Error:", error.message || error);
      } finally {
        setDeleteModalVisible(false);
      }
    } else {
      alert("आपके द्वारा दिया गया नाम गलत है।");
    }
  };

  const handleSendReminder = async (parentId) => {
    setIsSendingReminder(true);
    try {
      const response = await dispatch(sendReminder(parentId)).unwrap();
      alert(response?.message || "याद दिलाने का संदेश सफलतापूर्वक भेजा गया।");
    } catch (error) {
      alert(error || "याद दिलाने में समस्या आई।");
    } finally {
      setIsSendingReminder(false);
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
          <Text className="text-2xl font-semibold text-blue-700">
            अभिभावक का विवरण
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1d4ed8" />
          </TouchableOpacity>
        </View>

        {/* Parent Info */}
        <View className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-6">
          {/* Header Section with Icons */}
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              {parent?.name || "नाम उपलब्ध नहीं"}
            </Text>
            <View className="flex flex-row space-x-4">
              {/* Edit Icon */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/parent/edit-parent",
                    params: {
                      parentId: parent?._id,
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

          {/* Parent Details */}
          <View className="space-y-2">
            <Text className="text-base text-gray-600">
              📞 फोन नंबर:{" "}
              <Text className="font-medium">{parent?.phone || "N/A"}</Text>
            </Text>
            <Text className="text-base text-gray-600 flex flex-row items-center">
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />{" "}
              <Text className="ml-1 font-medium">
                {parent?.whatsapp || "उपलब्ध नहीं"}
              </Text>
            </Text>
          </View>
        </View>

        {/* Children Info and Fee Overview */}
        <View className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          {/* Section Title */}
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            बच्चों की जानकारी और शुल्क विवरण
          </Text>

          {parent?.children_ids?.length > 0 ? (
            parent.children_ids.map((child) => {
              // Get the fee details for the current child
              const childFee = feesByParent?.find(
                (fee) => fee.student_id?._id === child._id
              );

              return (
                <View key={child._id} className="py-3 border-b border-gray-300">
                  {/* Child Name and Class */}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-base font-medium text-gray-700">
                      {child.name}
                    </Text>
                    <Text className="text-base text-gray-500">
                      कक्षा: {child.class}
                    </Text>
                  </View>

                  {/* Fee Details */}
                  {childFee ? (
                    <View className="flex-row justify-between mt-2">
                      <Text className="text-base text-gray-700">
                        मासिक शुल्क: ₹{childFee.amount || "0"}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedStudent(child);
                          setIsFeeModalVisible(true);
                        }}
                        className="bg-blue-100 px-3 py-1 rounded"
                      >
                        <Text className="text-sm text-blue-700 font-semibold">
                          अधिक जानकारी
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text className="text-base text-gray-500 mt-2">
                      शुल्क की जानकारी उपलब्ध नहीं है।
                    </Text>
                  )}
                </View>
              );
            })
          ) : (
            <Text className="text-base text-gray-500">
              बच्चों की जानकारी उपलब्ध नहीं है।
            </Text>
          )}
        </View>

        {/* Reminder Button */}
        <TouchableOpacity
          onPress={() => handleSendReminder(parent?._id)}
          className={`p-3 rounded-lg shadow-sm mt-4 ${
            isSendingReminder ? "bg-gray-400" : "bg-yellow-500"
          }`}
          disabled={isSendingReminder}
        >
          <Text className="text-center text-white font-semibold">
            {isSendingReminder
              ? "संदेश भेजा जा रहा है..."
              : "शुल्क की याद दिलाएं"}
          </Text>
        </TouchableOpacity>

        {/* Payment History */}
        <View className="mt-6 mb-6">
          <Text className="text-xl font-semibold text-blue-700 mb-4">
            भुगतान इतिहास
          </Text>
          <FlatList
            data={paymentHistory}
            keyExtractor={(item) => item?._id}
            renderItem={({ item }) => (
              <View className="p-4 mb-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">तारीख:</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {new Date(item.payment_date).toLocaleString("hi-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-sm text-gray-600">राशि:</Text>
                  <Text className="text-sm font-semibold text-green-700">
                    ₹{item.amount_paid}
                  </Text>
                </View>
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
                  {feesByParent
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
                  {feesByParent.filter(
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

        {/* Delete Model */}
        <Modal
          visible={isDeleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
          animationType="slide"
          transparent={true}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-lg">
              <Text className="text-lg font-semibold text-blue-700 mb-4">
                अभिभावक को हटाने की पुष्टि करें
              </Text>
              <Text className="text-base text-gray-600 mb-2">
                कृपया अभिभावक का नाम{" "}
                <Text className="font-bold">{parent?.name}</Text> दर्ज करें:
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
                  onPress={handleDeleteParent}
                  className="bg-red-600 p-2 rounded-lg"
                >
                  <Text className="text-white">हटाएं</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentDetailScreen;
