import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchUser } from "../redux/authSlice"; // optional

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

  // Password validation regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // Check if password matches regex
    if (e.target.name === "password") {
      if (!passwordRegex.test(e.target.value)) {
        setPasswordError(
          "Password must be at least 6 characters, include uppercase, lowercase, a number, and a special character"
        );
      } else {
        setPasswordError("");
      }
    }
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check password validation before submitting
    if (!passwordRegex.test(formData.password)) {
      setPasswordError(
        "Password must be at least 6 characters, include uppercase, lowercase, a number, and a special character"
      );
      return;
    }

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      if (profileImage) data.append("profile_image", profileImage);

      await axios.post(`${API_URL}/api/user/register`, data);

      dispatch(fetchUser()); // Optional

      // Reset form
      setFormData({ username: "", email: "", password: "" });
      setProfileImage(null);

      alert("Registered successfully!");
      navigate("/login"); // Redirect to login page
    } catch (error) {
      alert(
        "Registration failed: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="container register-container">
      <form onSubmit={handleSubmit} className="p-4 mt-5 rounded rounded-3">
        <h3 className="text-center">Register</h3>
        {/* Display error message at the top of the form */}
        {passwordError && (
          <div className="alert alert-danger">{passwordError}</div>
        )}

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3 position-relative">
          <input
            type={showPassword ? "text" : "password"} // Toggle between password and text input
            className="form-control"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="btn btn-link position-absolute top-50 end-0 translate-middle-y"
            onClick={() => setShowPassword((prev) => !prev)} // Toggle password visibility
            style={{ cursor: "pointer" }}
          >
            {showPassword ? (
              <i className="bi bi-eye-slash"></i> // Icon for password visible (hidden)
            ) : (
              <i className="bi bi-eye"></i> // Icon for password hidden
            )}
          </button>
        </div>
        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
          />
          <small className="text-muted">Optional profile image</small>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
