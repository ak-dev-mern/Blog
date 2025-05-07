import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";

const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

const fetchPosts = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/post/getallpost`);
    return res.data.posts || [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const Home = () => {
  const {
    data: posts = [], // Default posts to an empty array if undefined
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-danger">Failed to load posts.</p>;

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Latest Posts</h3>
      <div className="row">
        {posts.length === 0 ? (
          <p>No posts available.</p> // Show a message if no posts
        ) : (
          posts.map((post) => (
            <div key={post.id} className="col-md-6 mb-4">
              <div className="card h-100">
                {post.post_image && (
                  <img
                    src={`${API_URL}/uploads/${post.post_image}`}
                    className="card-img-top"
                    alt="Post"
                    style={{ maxHeight: "250px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{post.title}</h5>
                  <p className="card-text">{post.content.slice(0, 100)}...</p>
                  <Link
                    to={`/post/${post.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Post
                  </Link>
                </div>
                <div className="card-footer d-flex justify-content-between text-muted small">
                  <span>👍 {post.likes?.length || 0}</span>
                  <span>💬 {post.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
