import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Alert, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CustomButton, FormField } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";
import { updateStudent } from "../../redux/slices/studentsSlice";

const EditStudentScreen = () => {
  const dispatch = useDispatch();
  const { studentId } = useLocalSearchParams();
  const { students } = useSelector((state) => state.student);
  const student = students.find((s) => s._id === studentId);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    class: "",
    parent_name: "",
    notes: "",
    accommodation: false,
  });

  const classOptions = ["Nursery", "1", "2", "3", "4", "5", "JNV", "JNV+"];

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        class: student.class,
        parent_name: student.parent_id.name || "",
        notes: student.notes || "",
        accommodation: student.accommodation || false,
      });
    }
  }, [student]);

  const setFormField = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.class) {
      return Alert.alert("कृपया सभी आवश्यक फ़ील्ड भरें।");
    }

    setUploading(true);

    const updatedData = {
      name: form.name,
      class: form.class,
      parent_id: student.parent_id._id,
      notes: form.notes,
      accommodation: form.accommodation,
    };

    try {
      await dispatch(updateStudent({ id: studentId, updatedData })).unwrap();
      setUploading(false);
      Alert.alert("सफलता", "विद्यार्थी सफलतापूर्वक अपडेट किया गया!");
      router.push("/home");
    } catch (error) {
      setUploading(false);
      Alert.alert(
        "त्रुटि",
        error?.message || "विद्यार्थी को अपडेट करने में विफल रहा।"
      );
    }
  };

  return (
    <SafeAreaView className="bg-white h-full p-4">
      <ScrollView>
        {/* Header */}
        <View className="flex justify-between items-center flex-row mb-8">
          <Text className="text-2xl font-semibold text-blue-700">
            विद्यार्थी अपडेट करें
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1d4ed8" />
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <FormField
          title="विद्यार्थी का नाम *"
          value={form.name}
          placeholder="विद्यार्थी का नाम दर्ज करें..."
          handleChangeText={(e) => setFormField("name", e)}
        />

        {/* Class Dropdown */}
        <View className="mb-4">
          <Text className="text-lg text-blue-700 font-bold mt-2">कक्षा *</Text>
          <View className="h-16 px-4 rounded-xl border-2 border-blue-600 focus:border-secondary">
            <Picker
              selectedValue={form.class}
              onValueChange={(value) => setFormField("class", value)}
              style={{ height: 50 }}
            >
              <Picker.Item label="कक्षा चुनें..." value="" />
              {classOptions.map((className) => (
                <Picker.Item
                  key={className}
                  label={className}
                  value={className}
                />
              ))}
            </Picker>
          </View>
        </View>

        <FormField
          title="पिता का नाम *"
          value={form.parent_name}
          placeholder="पिता का नाम दर्ज करें..."
          handleChangeText={(e) => setFormField("parent_id", e)}
          editable={false}
        />

        <FormField
          title="नोट्स"
          value={form.notes}
          placeholder="नोट्स दर्ज करें (वैकल्पिक)..."
          handleChangeText={(e) => setFormField("notes", e)}
          multiline={true}
        />

        <View className="flex-row items-center justify-between mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <Text className="text-lg text-blue-700 font-bold">आवास:</Text>
          <TouchableOpacity
            className={`px-6 py-2 rounded-lg ${
              form.accommodation ? "bg-green-600" : "bg-red-500"
            } shadow-md`}
            onPress={() => setFormField("accommodation", !form.accommodation)}
          >
            <Text className="text-white text-base font-medium">
              {form.accommodation ? "हां" : "नहीं"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <CustomButton
          title="विद्यार्थी अपडेट करें"
          handlePress={handleSubmit}
          isLoading={uploading}
          containerStyles="mt-7"
          disabled={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditStudentScreen;
