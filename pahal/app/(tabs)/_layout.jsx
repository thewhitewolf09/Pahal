import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";
import { Loader } from "../../components";
import Icon from "react-native-vector-icons/Ionicons"; // Use Ionicons or other icon libraries

const TabIcon = ({ iconName, color, name, focused }) => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 2 }}>
      {/* Use the Ionicons icon with vector icons */}
      <Icon name={iconName} size={24} color={color} />
      {/* Text component for the label */}
      <Text
        style={{
          color: color,
          fontSize: 12,
          fontWeight: focused ? "600" : "400",
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  const { loading, user, verified } = useSelector((state) => state.user);

  if (!loading && !user && verified) return <Redirect href="/sign-in" />;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#468585",
          tabBarInactiveTintColor: "#BDC3C7",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "white",
            height: 84,
          },
        }}
      >
        {/* Common Tabs for Both Roles */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="home-outline"
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      {/* These components should be outside of Tabs */}
      <StatusBar backgroundColor="#468585" style="light" />
    </>
  );
};

export default TabLayout;
