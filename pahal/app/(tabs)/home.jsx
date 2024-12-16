import { useSelector } from "react-redux";
import { Text, View } from "react-native";
import AdminHome from "../../components/AdminHome";
import ParentHome from "../../components/ParentHome";


const Home = () => {
  const { user, token, role } = useSelector((state) => state.user);
  return <>{role === "admin" ? <AdminHome /> : <ParentHome />}</>;
};

export default Home;
