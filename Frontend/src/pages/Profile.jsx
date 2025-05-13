import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../redux/authSlice";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const Profile = () => {
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const userData = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userData.user && !userData.loading) {
      dispatch(fetchUser());
    }
  }, [dispatch, userData.user, userData.loading]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!newImage) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("profile_image", newImage);

    try {
      const res = await axios.put(
        `${API_URL}/api/user/profile-image`, // Changed endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      dispatch(fetchUser());
      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        "Failed to update image: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (userData.loading) return <p>Loading profile...</p>;
  if (userData.error) return <p>Error: {userData.error}</p>;
  if (!userData.user) return <p>No user data found</p>;

  return (
    <div className="container profile-container mt-4">
      <div className="card p-3 mt-5" style={{ maxWidth: "400px" }}>
        <h2 className="text-center">My Profile</h2>
        <div className="mb-3 text-center">
          <img
            src={
              preview ||
              (userData.user.profile_image
                ? `${API_URL}/uploads/${userData.user.profile_image}`
                : "https://dummyimage.com/150")
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
          disabled={uploading}
        />
        <button
          onClick={handleImageUpload}
          className="btn btn-primary w-100"
          disabled={!newImage || uploading}
        >
          {uploading ? "Uploading..." : "Upload New Image"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
