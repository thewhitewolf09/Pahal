import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";

const AuthLayout = () => {
  const { loading, user } = useSelector((state) => state.user);

  const isLogged = user !== null;

  if (!loading && isLogged) {
    return <Redirect href="/home" />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar backgroundColor="#1C70EC" style="light" />
    </>
  );
};

export default AuthLayout;
