import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { CustomButton, FormField } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { addStudent } from "../../redux/slices/studentsSlice";
import { fetchAllParents } from "../../redux/slices/parentSlice";
import { router } from "expo-router";

const AddStudentScreen = () => {
  const [uploading, setUploading] = useState(false);

  const { parents } = useSelector((state) => state.parent);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    studentClass: "",
    parentId: "",
    parentName: "",
    notes: "",
  });
  
  const [isModalVisible, setIsModalVisible] = useState(false);

  const dispatch = useDispatch();

  console.log(parents);

  useEffect(() => {
    const getParents = async () => {
      try {
        await dispatch(fetchAllParents());
      } catch (error) {
        Alert.alert("Error", "Failed to fetch parent list.");
      }
    };

    getParents();
  }, []);

  // Helper function to update form fields
  const setFormField = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  // Submit form
  const handleSubmit = async () => {
    if (form.name === "" || form.studentClass === "" || form.parentId === "") {
      return Alert.alert("कृपया सभी आवश्यक फ़ील्ड भरें।");
    }

    setUploading(true);

    const studentData = {
      name: form.name,
      class: form.studentClass,
      parent_id: form.parentId,
      notes: form.notes,
    };

    try {
      await dispatch(addStudent(studentData)).unwrap();

      setUploading(false);
      Alert.alert("सफलता", "विद्यार्थी सफलतापूर्वक जोड़ा गया!");
      router.push("/home");
    } catch (error) {
      setUploading(false);
      Alert.alert(
        "त्रुटि",
        error?.message || "विद्यार्थी जोड़ने में विफल रहा।"
      );
    }
  };

  // Filter parents based on search query
  const filteredParents = parents.filter((parent) =>
    parent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            विद्यार्थी जोड़ें
          </Text>
        </View>

        {/* Student Name */}
        <FormField
          title="विद्यार्थी का नाम *"
          value={form.name}
          placeholder="विद्यार्थी का नाम दर्ज करें..."
          handleChangeText={(e) => setFormField("name", e)}
        />

        {/* Student Class */}
        <FormField
          title="कक्षा *"
          value={form.studentClass}
          placeholder="विद्यार्थी की कक्षा दर्ज करें..."
          handleChangeText={(e) => setFormField("studentClass", e)}
        />

        {/* Parent Selection */}
        <View className="mb-4 mt-4">
          <Text className="text-lg font-bold mb-2 text-blue-700">
            अभिभावक चुनें *
          </Text>
          <TouchableOpacity
            className="w-full h-16 px-4 bg-white rounded-xl border-2 border-blue-600 focus:border-secondary flex flex-row items-center"
            onPress={() => setIsModalVisible(true)}
          >
            <Text className="text-lg font-semibold text-[#7B7B8B]">
              {form.parentName || "कृपया अभिभावक चुनें..."}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <FormField
          title="नोट्स"
          value={form.notes}
          placeholder="अतिरिक्त जानकारी दर्ज करें (वैकल्पिक)..."
          handleChangeText={(e) => setFormField("notes", e)}
        />

        {/* Submit Button */}
        <CustomButton
          title="विद्यार्थी जोड़ें"
          handlePress={handleSubmit}
          isLoading={uploading}
          containerStyles="mt-7"
          disabled={uploading}
        />
      </ScrollView>

      {/* Parent Selection Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-white mt-12 p-5">
            {/* Title */}
            <Text className="text-lg font-bold text-blue-700 mb-3">अभिभावक सूची</Text>

            {/* Search Input */}
            <TextInput
              placeholder="खोजें..."
              className="border border-gray-300 p-2 mb-3 rounded"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Parent List */}
            <FlatList
              data={filteredParents}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="p-2 border-b border-gray-300"
                  onPress={() => {
                    setFormField("parentId", item._id);
                    setFormField("parentName", item.name);
                    setIsModalVisible(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            {/* Close Button */}
            <CustomButton
              title="बंद करें"
              handlePress={() => setIsModalVisible(false)}
              containerStyles="mt-4"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddStudentScreen;
