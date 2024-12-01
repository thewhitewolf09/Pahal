import { useSelector } from "react-redux";
import { Text, View } from "react-native";

const Home = () => {
  const { user, token, role } = useSelector((state) => state.user);
  return (
    <>
      <View>
        <Text>Hi</Text>
      </View>
    </>
  );
};

export default Home;
