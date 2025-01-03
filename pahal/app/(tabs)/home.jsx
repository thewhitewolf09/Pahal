import { useSelector } from "react-redux";
import AdminHome from "../../components/AdminHome";
import ParentHome from "../../components/ParentHome";

const Home = () => {
  const { role } = useSelector((state) => state.user);
  return <>{role === "admin" ? <AdminHome /> : <ParentHome />}</>;
};

export default Home;
