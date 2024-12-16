import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAllParents } from "../../redux/slices/parentSlice";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SearchInput } from "../../components";
import { router } from "expo-router";

const ParentList = () => {
  const dispatch = useDispatch();
  const { parents } = useSelector((state) => state.parent);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    dispatch(fetchAllParents());
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchAllParents());
    setRefreshing(false);
  };

  const handleParentPress = (parent) => {
    router.push({
      pathname: "/parent/parent-details",
      params: {
        parentId: parent._id,
      },
    });
  };

  const parentList = filteredResults.length > 0 ? filteredResults : parents;

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
          <Text className="text-2xl font-semibold text-blue-700">
            अभिभावक सूची
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1d4ed8" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchInput
          placeholder="अभिभावक का नाम खोजें..."
          parents={parents}
          setFilteredResults={setFilteredResults}
        />

        {/* Flat List of Parents */}
        <FlatList
          data={parentList}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleParentPress(item)}
              className="p-4 mb-4 rounded-lg shadow-lg bg-white flex-col border-2 border-gray-200"
            >
              {/* Parent Info */}
              <View className="mb-3">
                <Text className="text-xl font-bold text-blue-800">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  📞 <Text className="font-medium">{item.phone}</Text>
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  💬 WhatsApp:{" "}
                  <Text className="font-medium">
                    {item.whatsapp || "उपलब्ध नहीं"}
                  </Text>
                </Text>
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-300 my-2" />

              {/* Children Info */}
              {item.children_ids.length > 0 ? (
                <View>
                  <Text className="text-sm font-semibold text-gray-800 mb-2">
                    बच्चों की जानकारी:
                  </Text>
                  {item.children_ids.map((child) => (
                    <View
                      key={child._id}
                      className="flex-row items-center mb-1 bg-gray-100 p-2 rounded-lg"
                    >
                      <Text className="text-base font-medium text-blue-700 flex-1">
                        {child.name}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        कक्षा:{" "}
                        <Text className="font-medium">{child.class}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-sm text-gray-500">
                  बच्चों की जानकारी उपलब्ध नहीं है।
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <Text className="text-center text-gray-500 mt-4">
              कोई अभिभावक सूचीबद्ध नहीं है।
            </Text>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentList;
