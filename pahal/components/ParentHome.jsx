import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity, Image, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import { images } from "../constants";
import { useEffect } from "react";
import { fetchParentById } from "../redux/slices/parentSlice";

const ParentHome = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.user);
  const { parent } = useSelector((state) => state.parent);

  useEffect(() => {
    if (role === "parent") {
      dispatch(fetchParentById(user._id));
    }
  }, [user._id]);

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView className="flex flex-col my-3 px-4 space-y-6">
        {/* Welcome Section */}
        <View className="flex justify-between items-start flex-row">
          <View>
            <Text className="font-semibold text-xl text-blue-700">
              स्वागत है
            </Text>
            <Text className="text-3xl font-semibold text-blue-700">
              {parent?.name}
            </Text>
          </View>
        </View>

        {/* Image Section */}
        <Image
          source={images.institute}
          className="max-w-[380px] w-full h-[250px]"
          resizeMode="contain"
        />

        {/* Fee Announcement Section */}
        <View className="bg-yellow-100 border border-yellow-400 rounded-lg p-6 mb-4">
          <Text className="text-xl font-semibold text-yellow-700 mb-4">
            महत्वपूर्ण सूचना
          </Text>
          <Text className="text-lg text-gray-700">
            कृपया ध्यान दें: अगले महीने का शुल्क इस महीने की 30 तारीख तक जमा
            करें।
          </Text>
        </View>

        {/* Institute Info Section */}
        <View className="bg-white border-2 border-blue-600 rounded-lg shadow-lg p-6 mb-4">
          <Text className="text-xl font-bold text-blue-700 mb-4 text-center">
            संस्थान विवरण
          </Text>
          <View className="space-y-4">
            <View className="flex flex-row flex-wrap items-center">
              <Text className="text-lg font-semibold text-gray-700 w-[30%]">
                संस्थान का नाम:{" "}
              </Text>
              <Text className="text-lg text-gray-800 ml-2 flex-wrap max-w-[65%]">
                श्‍वेता नवोदय प्रवेश संस्थान
              </Text>
            </View>
            <View className="flex flex-row flex-wrap items-center">
              <Text className="text-lg font-semibold text-gray-700 w-[30%]">
                शिक्षक का नाम:{" "}
              </Text>
              <Text className="text-lg text-gray-800 ml-2 flex-wrap max-w-[65%]">
                श्‍वेता निर्मल, राम प्रकाश
              </Text>
            </View>
            <View className="flex flex-row flex-wrap items-center">
              <Text className="text-lg font-semibold text-gray-700 w-[30%]">
                पता:{" "}
              </Text>
              <Text className="text-lg text-gray-800 ml-2 flex-wrap max-w-[65%]">
                चमैला-पटना मोड़, बल्लीपुर बाजार, अयोध्या, उत्तर प्रदेश, भारत
              </Text>
            </View>
          </View>
        </View>

        {/* Student Details Section */}
        <View className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-6 mb-4">
          <Text className="text-xl font-bold text-blue-700 mb-4 text-center">
            बच्चों की जानकारी
          </Text>
          {user?.children_ids?.length > 0 ? (
            user.children_ids.map((child) => (
              <View
                key={child._id}
                className="flex-row justify-between items-center py-3 border-b border-gray-300"
              >
                <Text className="text-lg font-semibold text-gray-700">
                  {child.name}
                </Text>
                <Text className="text-lg text-gray-500">
                  कक्षा: {child.class}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-base text-gray-500">
              बच्चों की जानकारी उपलब्ध नहीं है।
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentHome;
