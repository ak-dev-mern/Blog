import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../redux/authSlice"; // Import the fetchUser action

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const Profile = () => {
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const userData = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
 if (!userData.user) {
   dispatch(fetchUser());
 }

  }, [dispatch, userData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
    setPreview(URL.createObjectURL(file)); // Create a temporary preview of the image
  };

  const handleImageUpload = async () => {
    if (!newImage) return;

    const formData = new FormData();
    formData.append("profile_image", newImage); // Add selected file to form data

    try {
      // Make a PUT request to update the profile image
      const res = await axios.put(
        `${API_URL}/api/user/profile-image`,
        formData,
        {
          withCredentials: true,
        }
      );

      alert("Profile image updated!");

      // After successful image upload, dispatch fetchUser to get the latest user data from the backend
      dispatch(fetchUser());

      // Optional: You can update the local userData state if you want to immediately update the UI
      // This step may not be necessary since you're already fetching the user data via Redux
    } catch (error) {
      alert(
        "Failed to update image: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Optional cleanup of the image preview when the component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview); // Clean up the object URL to avoid memory leaks
    };
  }, [preview]);

if (userData.loading) return <p>Loading profile...</p>;
if (userData.error) return <p>Error: {userData.error}</p>;
if (!userData.user) return <p>No user data found</p>;

  return (
    <div className="container mt-4">
      <h2>My Profile</h2>
      <div className="card p-3" style={{ maxWidth: "400px" }}>
        <div className="mb-3 text-center">
          <img
            src={
              preview
                ? preview
                : userData.user.profile_image
                ? `${API_URL}/uploads/${userData.user.profile_image}`
                : "https://dummyimage.com/150"
            }
            alt="Profile"
            className="img-thumbnail rounded-circle"
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
        </div>
        <h5 className="text-center">{userData.user.username}</h5>
        <p className="text-center">{userData.user.email}</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="form-control mb-2"
        />
        <button onClick={handleImageUpload} className="btn btn-primary w-100">
          Upload New Image
        </button>
      </div>
    </div>
  );
};

export default Profile;
