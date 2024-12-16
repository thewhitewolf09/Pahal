import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { Loader } from ".";
import { images } from "../constants";
import { fetchAllStudents } from "../redux/slices/studentsSlice";

const AdminHome = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { students } = useSelector((state) => state.student);
  const { attendanceRecords } = useSelector((state) => state.attendance);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyPerformance, setWeeklyPerformance] = useState([0, 0, 0, 0]);

  const manageParent = () => {
    router.push("/parent/add-parent");
  };

  const manageStudents = () => {
    router.push("/student/add-student");
  };

  const postAnnouncement = () => {
    router.push("/post-announcement");
  };

  const fetchData = async () => {
    await dispatch(fetchAllStudents());
    setWeeklyPerformance([5000, 7000, 8000, 12000]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <Loader isLoading={false} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col my-3 px-4 space-y-6">
          {/* Header */}
          <View className="flex justify-between items-start flex-row">
            <View>
              <Text className="font-semibold text-xl text-blue-700">
                स्वागत है
              </Text>
              <Text className="text-3xl font-semibold text-blue-700">
                {user?.name}
              </Text>
            </View>
        
          </View>

          <Image
            source={images.institute}
            className="max-w-[380px] w-full h-[250px]"
            resizeMode="contain"
          />

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

          {/* Key Stats */}
          <View className="bg-white border-2 border-blue-600 rounded-lg shadow-lg p-6 mb-4">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              मुख्य आँकड़े
            </Text>
            <View className="flex flex-col space-y-4">
              <StatCard title="कुल छात्र" value={students.length} icon="👩‍🏫" />
              <StatCard
                title="उपस्थित छात्र"
                value={
                  attendanceRecords.filter(
                    (attendance) => attendance.status === "Present"
                  ).length
                }
                icon="✅"
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex flex-row flex-wrap justify-evenly mb-2">
            <ActionButton
              title="अभिभावक सूची"
              colors={["#2563EB", "#1D4ED8"]} // Blue shades for gradient
              onPress={() => router.push("/parent/parent-list")}
            />
            <ActionButton
              title="छात्र सूची"
              colors={["#1D4ED8", "#2563EB"]} // Blue shades for gradient
              onPress={() => router.push("/student/student-list")}
            />

            <ActionButton
              title="अभिभावक जोड़ें"
              colors={["#2563EB", "#1D4ED8"]} // Blue shades for gradient
              onPress={manageParent}
            />
            <ActionButton
              title="छात्र जोड़ें"
              colors={["#1D4ED8", "#2563EB"]} // Blue shades for gradient
              onPress={manageStudents}
            />
            {/* <ActionButton
              title="घोषणा पोस्ट करें"
              colors={["#1D4ED8", "#2563EB"]} // Blue shades for gradient
              onPress={postAnnouncement}
            /> */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ title, value, icon }) => (
  <LinearGradient
    colors={["#E3F9FC", "#B3D9F1"]}
    className="rounded-lg p-4 shadow-lg mb-1"
    style={{ elevation: 5 }}
  >
    <View className="flex flex-row items-center justify-between">
      <Text className="text-3xl">{icon}</Text>
      <View className="flex-1 ml-4">
        <Text className="text-gray-700 text-lg font-semibold">{title}</Text>
        <Text className="text-gray-800 text-2xl font-bold">{value}</Text>
      </View>
    </View>
  </LinearGradient>
);

const ActionButton = ({ title, colors, onPress }) => (
  <LinearGradient
    colors={colors}
    className="rounded-lg p-4 my-1 mx-1 w-5/12"
    style={{ elevation: 2 }}
  >
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <Text className="text-white text-center font-bold">{title}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

export default AdminHome;
