import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Alert, TouchableOpacity, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { logout } from "../../redux/slices/userSlice";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons"; // Assuming you're using FontAwesome for the edit icon
import { useEffect, useState } from "react";
import { fetchParentById } from "../../redux/slices/parentSlice";

const Settings = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.user);
  const { parent } = useSelector((state) => state.parent);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    if (role === "parent") {
      dispatch(fetchParentById(user?._id));
    }
  }, [user?._id]);

  const [details, setDetails] = useState({
    name: "श्‍वेता नवोदय प्रवेश संस्थान",
    address: {
      street: "चमैला-पटना मोड़, बल्लीपुर बाजार",
      city: "अयोध्या",
      state: "उत्तर प्रदेश",
      country: "भारत",
    },
    googleMapLocation: {
      latitude: 26.550039671658247,
      longitude: 82.04865485668407,
    },
  });

  const toggleMapSize = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  const handleLogout = () => {
    Alert.alert("लॉग आउट", "आप लॉग आउट हो चुके हैं।");
    dispatch(logout());
    router.push("/sign-in");
  };

  const contactSupport = () => {
    Linking.openURL(
      `mailto:sumitramprakashnirmal@gmail.com?subject=Help Request(Pahal) from ${user?.name}`
    );
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <View className="flex flex-col my-3 px-4 space-y-6">
        {/* Header */}
        <View className="flex justify-between items-start flex-row mb-6">
          <Text className="text-2xl font-semibold text-blue-700">सेटिंग्स</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* User Info Section */}
        <View className="rounded-lg shadow-lg mb-4 relative">
          <LinearGradient
            colors={["#E3F9FC", "#B3D9F1"]}
            className="p-6 rounded-lg"
          >
            {/* Edit Profile Icon */}
            {role === "parent" ? (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/parent/edit-parent",
                    params: {
                      parentId: user?._id,
                    },
                  })
                }
                className="absolute top-4 right-4"
              >
                <FontAwesome name="edit" size={28} color="#2563eb" />
              </TouchableOpacity>
            ) : null}
            {role === "parent" ? (
              <>
                <View className="flex flex-row items-center">
                  <Ionicons name="person-circle" size={60} color="#2563eb" />
                  <View className="ml-4 flex-1">
                    <Text className="text-xl font-semibold text-gray-800">
                      {parent?.name}
                    </Text>
                    {/* Phone Number with Phone Icon */}
                    <View className="flex flex-row items-center mt-2">
                      <Ionicons
                        name="phone-portrait"
                        size={24}
                        color="#4F8A8B"
                      />
                      <Text className="text-gray-600 ml-2">
                        {parent?.phone}
                      </Text>
                    </View>
                    {/* WhatsApp Number with WhatsApp Icon */}
                    <View className="flex flex-row items-center mt-2">
                      <Ionicons
                        name="logo-whatsapp"
                        size={24}
                        color="#25D366"
                      />
                      <Text className="text-gray-600 ml-2">
                        {parent?.whatsapp}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View className="flex flex-row items-center">
                  <Ionicons name="person-circle" size={60} color="#2563eb" />
                  <View className="ml-4 flex-1">
                    <Text className="text-xl font-semibold text-gray-800">
                      {user?.name}
                    </Text>
                    {/* Phone Number with Phone Icon */}
                    <View className="flex flex-row items-center mt-2">
                      <Ionicons
                        name="phone-portrait"
                        size={24}
                        color="#4F8A8B"
                      />
                      <Text className="text-gray-600 ml-2">{user?.phone}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </LinearGradient>
        </View>

        {/* <View className={`mb-4 rounded-lg shadow-lg`}>
          <View
            style={{
              borderColor: "#0f766e",
              borderWidth: 1,
              borderRadius: 10,
              overflow: "hidden",
            }}
          > */}
        {/* <MapView
              style={{
                height: isMapExpanded ? 500 : 200,
                marginBottom: 40,
              }}
              region={{
                latitude:
                  details.googleMapLocation?.latitude || 26.550039671658247,
                longitude:
                  details.googleMapLocation?.longitude || 82.04865485668407,
                latitudeDelta: isMapExpanded ? 0.002 : 0.01,
                longitudeDelta: isMapExpanded ? 0.002 : 0.01,
              }}
              zoomEnabled={true}
              scrollEnabled={true}
              showsUserLocation={true}
              followsUserLocation={true}
            >
              <Marker
                coordinate={{
                  latitude: details.googleMapLocation?.latitude,
                  longitude: details.googleMapLocation?.longitude,
                }}
                title={details?.name}
                description={`${details.address.street}, ${details.address.city},${details.address.state}, ${details.address.country}`}
              />
            </MapView> */}

        {/* Address Text */}
        {/* <View className="absolute bottom-0 left-0 right-0 p-2 bg-white rounded-lg">
              <Text className="text-center text-sm font-semibold">
                {details.address.street}, {details.address.city},{" "}
                {details.address.state}, ,{details.address.country}
              </Text>
            </View> */}

        {/* Toggle Button */}
        {/* <TouchableOpacity
              onPress={toggleMapSize}
              className="absolute right-2 top-2 bg-white p-2 rounded-full shadow-md"
            >
              <Ionicons
                name={isMapExpanded ? "contract" : "expand"}
                size={24}
                color="#0f766e"
              />
            </TouchableOpacity> */}
        {/* </View>
        </View> */}

        {/* Contact Support Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-blue-600 mb-3">
            क्या आपको और सहायता चाहिए?
          </Text>

          <TouchableOpacity
            onPress={contactSupport}
            className="bg-blue-600 py-3 px-6 rounded-full shadow-lg flex flex-row items-center justify-center"
          >
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text className="text-center text-white font-medium text-base ml-2">
              समर्थन से संपर्क करें
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feedback Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-blue-600 mb-3">
            हमें आपकी प्रतिक्रिया की आवश्यकता है!
          </Text>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://forms.gle/pU2cLf9WC6om6v1r8")
            }
            className="bg-blue-600 py-3 px-6 rounded-full shadow-lg flex flex-row items-center justify-center"
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#fff"
            />
            <Text className="text-center text-white font-medium text-base ml-2">
              प्रतिक्रिया दें
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
