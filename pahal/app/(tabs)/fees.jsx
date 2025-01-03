import { useSelector } from "react-redux";
import AdminFees from "../../components/AdminFees";
import ParentFees from "../../components/ParentFees";


const Fees = () => {
  const { role } = useSelector((state) => state.user);
  return <>{role === "admin" ? <AdminFees /> : <ParentFees />}</>;
};

export default Fees;
