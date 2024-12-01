import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
} from "react-native";
import { useSelector } from "react-redux"; // Import useSelector from react-redux
import { Redirect, router } from "expo-router";
import { images } from "../constants";
import { CustomButton, Loader } from "../components";

const Welcome = () => {
  // Get the loading and user state from the Redux store
  const { loading, user, verified } = useSelector((state) => state.user);

  // Check if user is logged in (assuming user will be null or undefined if not logged in)
  const isLogged = user !== null;

  if (!loading && isLogged && verified) return <Redirect href="/home" />;

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <View className="w-full flex justify-center items-center h-full px-4">
          <Image
            source={images.logo}
            className="w-[220px] h-[95px]"
            resizeMode="contain"
          />

          <Image
            source={images.institute}
            className="max-w-[380px] w-full h-[298px]"
            resizeMode="contain"
          />

          <View className="relative mt-6">
            <Text className="text-3xl text-black font-bold text-center pt-4">
              अपने शिक्षण अनुभव को{"\n"}
              <Text className="text-blue-600">पहल</Text> के साथ बदलें
            </Text>
          </View>

          <Text className="text-sm font-pregular text-gray-600 mt-7 text-center">
            छात्रों के प्रदर्शन को ट्रैक करें, पढ़ाई को बनाएं अधिक प्रभावी
          </Text>

          <CustomButton
            title="शुरू करे"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#2563eb" style="light" />
    </SafeAreaView>
  );
};

export default Welcome;
