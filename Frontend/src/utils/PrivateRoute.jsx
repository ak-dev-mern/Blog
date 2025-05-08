import { useSelector } from "react-redux";
import Spinner from "../components/Spinner";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) return <Spinner />; // Wait for fetchUser to complete
  if (!user) return <Navigate to="/login" replace />;

  return children;
};
export default PrivateRoute;
