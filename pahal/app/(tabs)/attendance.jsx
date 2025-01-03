import { useSelector } from "react-redux";
import AdminAttendance from "../../components/AdminAttendance";
import ParentAttendance from "../../components/ParentAttendance";

const Attendance = () => {
  const {role } = useSelector((state) => state.user);
  return <>{role === "admin" ? <AdminAttendance /> : <ParentAttendance />}</>;
};

export default Attendance;
