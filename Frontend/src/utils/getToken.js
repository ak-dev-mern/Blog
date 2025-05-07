import * as jwt_decode from "jwt-decode"; // keep this
import Cookies from "js-cookie";
export const getLoggedInUserId = () => {
  const token = Cookies.get("token");
  console.log("token:", token);
  if (!token) return null;

  try {
    const decoded = jwt_decode.default(token); // ✅ use .default here
    console.log("Decoded token:", decoded);
    return decoded.userId || decoded.id || decoded._id || decoded.sub;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
