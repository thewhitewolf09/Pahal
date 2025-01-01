import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { CustomButton, FormField } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchParentById, updateParent } from "../../redux/slices/parentSlice";
import { router, useLocalSearchParams } from "expo-router";

const EditParentScreen = () => {
  const dispatch = useDispatch();
  const { parentId } = useLocalSearchParams();

  const { parent } = useSelector((state) => state.parent);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
  });

  useEffect(() => {
    const fetchParent = async () => {
      if (parentId) {
        await dispatch(fetchParentById(parentId));
      }
    };
    fetchParent();
  }, [parentId]);

  useEffect(() => {
    if (parent) {
      setForm({
        name: parent.name || "",
        phone: parent.phone || "",
        whatsapp: parent.whatsapp || "",
      });
    }
  }, [parent]);

  const setFormField = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (form.name === "" || form.phone === "") {
      return Alert.alert("कृपया सभी आवश्यक फ़ील्ड भरें।");
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return Alert.alert("कृपया एक वैध 10 अंकों का फ़ोन नंबर दर्ज करें।");
    }

    setUploading(true);

    const updatedData = {
      name: form.name,
      phone: form.phone,
      whatsapp: form.whatsapp,
    };

    try {
      await dispatch(updateParent({ id: parentId, updatedData })).unwrap();
      setUploading(false);
      await dispatch(fetchParentById(parentId));
      Alert.alert("सफलता", "अभिभावक सफलतापूर्वक अपडेट किया गया!");
      router.push("/home");
    } catch (error) {
      setUploading(false);
      Alert.alert(
        "त्रुटि",
        error?.message || "अभिभावक को अपडेट करने में विफल रहा।"
      );
    }
  };

  return (
    <SafeAreaView className="bg-white h-full p-4">
      <ScrollView>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push("/home");
              }
            }}
            style={{ marginRight: 5 }}
          >
            <Ionicons name="chevron-back" size={24} color="blue" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-blue-700">
            अभिभावक अपडेट करें
          </Text>
        </View>

        {/* अभिभावक का नाम */}
        <FormField
          title="अभिभावक का नाम *"
          value={form.name}
          placeholder="अभिभावक का नाम दर्ज करें..."
          handleChangeText={(e) => setFormField("name", e)}
        />

        {/* फ़ोन नंबर */}
        <FormField
          title="फ़ोन नंबर *"
          value={form.phone}
          placeholder="फ़ोन नंबर दर्ज करें..."
          handleChangeText={(e) =>
            setFormField("phone", e.replace(/[^0-9]/g, ""))
          }
          keyboardType="numeric"
        />

        {/* व्हाट्सएप नंबर */}
        <FormField
          title="व्हाट्सएप नंबर"
          value={form.whatsapp}
          placeholder="व्हाट्सएप नंबर दर्ज करें (वैकल्पिक)..."
          handleChangeText={(e) =>
            setFormField("whatsapp", e.replace(/[^0-9]/g, ""))
          }
          keyboardType="numeric"
        />

        {/* सबमिट बटन */}
        <CustomButton
          title="अभिभावक अपडेट करें"
          handlePress={handleSubmit}
          isLoading={uploading}
          containerStyles="mt-7"
          disabled={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditParentScreen;
