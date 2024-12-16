import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";
import { Loader } from "../../components";
import Icon from "react-native-vector-icons/Ionicons"; // Use Ionicons or other icon libraries

const TabIcon = ({ iconName, color, name, focused }) => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 1 ,width : 40}}>
      {/* Use the Ionicons icon with vector icons */}
      <Icon name={iconName} size={30} color={color} style={{ opacity: 1 }} />
      {/* Text component for the label */}
      <Text
        style={{
          color: color,
          fontSize: 10,
          fontWeight: focused ? "600" : "400",
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  const { loading, user } = useSelector((state) => state.user);

  if (!loading && !user) return <Redirect href="/sign-in" />;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#2563eb",
          tabBarInactiveTintColor: "#BDC3C7",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "white",
            height: 72, // Adjusted tab bar height
            paddingBottom: 10,
            paddingTop: 14,
          },
          tabBarIconStyle: {
            opacity: 1, // Force opacity to 1 for inactive icons
          },
        }}
      >
        {/* Home Tab */}
        <Tabs.Screen
          name="home"
          options={{
            title: "होम पेज",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="home-outline"
                color={color}
                name="होम पेज"
                focused={focused}
              />
            ),
          }}
        />

        {/* Attendance Tab */}
        <Tabs.Screen
          name="attendance"
          options={{
            title: "उपस्थिति",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="calendar-outline"
                color={color}
                name="उपस्थिति"
                focused={focused}
              />
            ),
          }}
        />

        {/* Performance Tab */}
        <Tabs.Screen
          name="performance"
          options={{
            title: "प्रदर्शन",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="bar-chart-outline"
                color={color}
                name="प्रदर्शन"
                focused={focused}
              />
            ),
          }}
        />

        {/* Fees Tab */}
        <Tabs.Screen
          name="fees"
          options={{
            title: "फीस",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="cash-outline"
                color={color}
                name="फीस"
                focused={focused}
              />
            ),
          }}
        />

        {/* Settings Tab */}
        <Tabs.Screen
          name="settings"
          options={{
            title: "सेटिंग्स",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="settings-outline"
                color={color}
                name="सेटिंग्स"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      {/* Status Bar */}
      <StatusBar backgroundColor="#2563eb" style="light" />
    </>
  );
};

export default TabLayout;
