import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000"; // Replace with your actual API URL

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("post_image", image); // match backend field name

      const res = await axios.post(`${API_URL}/api/post/create`, formData, {
        withCredentials: true, // if using cookie-based auth
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);
      setTitle("");
      setContent("");
      setImage(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Add New Post</h3>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Image (optional)</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button className="btn btn-primary" type="submit">
          Create Post
        </button>
      </form>
    </div>
  );
};

export default AddPost;
