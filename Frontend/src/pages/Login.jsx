import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchUser } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // toggle state

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/api/user/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const resultAction = await dispatch(fetchUser());
      if (fetchUser.fulfilled.match(resultAction)) {
        navigate("/user/profile");
      } else {
        alert("Failed to load user profile after login");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        "Login failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="container">
      <form
        onSubmit={handleLogin}
        className="p-4"
        style={{ maxWidth: "400px", margin: "auto" }}
      >
        <h4 className="mb-3 text-center">Login</h4>

        <div className="mb-3">
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>

        <div className="mb-3 position-relative">
          <input
            className="form-control"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((prev) => !prev)}
              id="showPassword"
            />
            <label className="form-check-label" htmlFor="showPassword">
              Show Password
            </label>
          </div>
        </div>

        <button className="btn btn-primary w-100" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
