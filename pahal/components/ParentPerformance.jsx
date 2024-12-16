import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchPerformanceByStudent } from "../redux/slices/performanceSlice"; // Assume this action exists
import { Picker } from "@react-native-picker/picker";
import { TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";

const ParentPerformance = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user); // Get user details
  const [selectedChild, setSelectedChild] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(false);

  // Set default child when component mounts
  useEffect(() => {
    if (user.children_ids && user.children_ids.length > 0) {
      setSelectedChild(user.children_ids[0]); // Set the first child as default
    }
  }, [user]);

  // Fetch performance for the selected child
  useEffect(() => {
    const fetchPerformance = async () => {
      if (!selectedChild) return;

      try {
        setLoading(true);
        const performanceData = await dispatch(
          fetchPerformanceByStudent(selectedChild._id)
        ).unwrap();
        setPerformance(performanceData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        Alert.alert("त्रुटि", "प्रदर्शन प्राप्त करने में असफल।");
      }
    };

    fetchPerformance();
  }, [dispatch, selectedChild]);

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView className="flex flex-col p-4">
        {/* Header */}
        <View className="flex justify-between items-start flex-row mb-6">
          <Text className="text-2xl font-semibold text-blue-700">प्रदर्शन</Text>
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

        {/* Performance History */}
        {selectedChild && performance.length > 0 && (
          <View className="mt-4">
            <Text className="text-lg font-semibold mb-2 text-blue-700">
              प्रदर्शन इतिहास:
            </Text>
            {performance.map((record) => (
              <View
                key={record._id}
                className="mb-4 p-4 rounded-lg bg-blue-50 border-2 border-blue-200"
              >
                <Text className="text-lg font-semibold">{record.subject}</Text>
                <Text className="text-base">मार्क्स: {record.marks}/100</Text>
                <Text className="text-xs text-gray-600">
                  {new Date(record.test_date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Loading or No Performance Data */}
        {!selectedChild && !loading && (
          <Text className="text-center text-gray-500 mt-6">
            कृपया प्रदर्शन देखने के लिए बच्चे का चयन करें।
          </Text>
        )}

        {performance.length === 0 && selectedChild && !loading && (
          <Text className="text-center text-gray-500 mt-6">
            कोई प्रदर्शन डेटा उपलब्ध नहीं है।
          </Text>
        )}

        {loading && (
          <ActivityIndicator size="large" color="#2563EB" className="mt-6" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentPerformance;
