import { useSelector } from "react-redux";
import AdminPerformance from "../../components/AdminPerformance";
import ParentPerformance from "../../components/ParentPerformance";


const Performance = () => {
  const { user, token, role } = useSelector((state) => state.user);
  return <>{role === "admin" ? <AdminPerformance /> : <ParentPerformance />}</>;
};

export default Performance;
