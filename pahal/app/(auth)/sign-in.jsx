import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { loginUser } from "../../redux/slices/userSlice";
import { router } from "expo-router";

const SignIn = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    mobileNumber: "",
    password: "",
    role: "parent", // Default role is parent
  });

  const handleSubmit = async () => {
    if (!form.mobileNumber || (form.role === "admin" && !form.password)) {
      Alert.alert("त्रुटि", "कृपया सभी फ़ील्ड्स भरें।");
      return;
    }

    try {
      await dispatch(
        loginUser({
          role: form.role,
          phone: form.mobileNumber,
          password: form.role === "admin" ? form.password : undefined,
        })
      ).unwrap();

      router.replace("/home"); // Navigate to the home screen on success
    } catch (err) {
      Alert.alert("त्रुटि", err || "लॉगिन विफल रहा।");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <View
            className="w-full flex justify-center h-full px-4 my-6"
            style={{
              minHeight: Dimensions.get("window").height - 100,
            }}
          >
            {/* App Logo */}
            <Image
              source={images.logo}
              className="w-[220px] h-[95px] self-center"
              resizeMode="contain"
            />

            {/* Illustration */}
            <Image
              source={images.institute}
              className="max-w-[380px] w-full h-[298px]"
              resizeMode="contain"
            />

            {/* Login Title */}
            <Text className="text-2xl font-semibold text-black font-psemibold">
              लॉग इन करें
            </Text>

            {/* Mobile Number Input */}
            <FormField
              title="मोबाइल नंबर"
              value={form.mobileNumber}
              handleChangeText={(e) => setForm({ ...form, mobileNumber: e })}
              otherStyles="mt-7"
              keyboardType="phone-pad"
              placeholder="अपना मोबाइल नंबर दर्ज करें"
            />

            {/* Conditional Password Input */}
            {form.role === "admin" && (
              <FormField
                title="पासवर्ड"
                value={form.password}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                otherStyles="mt-4"
                isPassword={true}
                placeholder="अपना पासवर्ड दर्ज करें"
              />
            )}

            {/* Submit Button */}
            <CustomButton
              title={"सबमिट करें"}
              handlePress={handleSubmit}
              containerStyles="mt-7"
              isLoading={loading}
            />

            {/* Sign-Up Suggestion */}
            <View className="flex justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-100 font-pregular">
                क्या आपके पास खाता नहीं है?
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "एडमिन से संपर्क करें",
                    "फ़ोन नंबर: +91 7827374161"
                  )
                }
              >
                <Text className="text-lg font-psemibold text-blue-600">
                  साइन अप करें
                </Text>
              </TouchableOpacity>
            </View>

            {/* Role Selection */}
            <View className="flex justify-center items-center mt-6 flex-row gap-2">
              <TouchableOpacity
                onPress={() =>
                  setForm({
                    ...form,
                    role: form.role === "parent" ? "admin" : "parent",
                  })
                }
              >
                <Text className="text-lg font-psemibold text-gray-600">
                  {form.role === "parent" ? "मैं एक हूँ " : "मैं एक हूँ "}
                  <Text className="font-semibold underline text-blue-600">
                    {form.role === "parent" ? "एडमिन" : "पैरेंट"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
