// --- Full PostDetails.jsx with Likes and Inline Editing ---
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import Spinner from "../components/Spinner";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const fetchPost = async (postId) => {
  const res = await axios.get(`${API_URL}/api/post/${postId}`);
  return res.data.post;
};

const editPost = async (postId, updatedData) => {
  const res = await axios.put(
    `${API_URL}/api/post/update/${postId}`,
    updatedData
  );
  return res.data.post;
};

const deletePost = async (postId) => {
  const res = await axios.delete(`${API_URL}/api/post/delete/${postId}`);
  return res.data;
};

const addComment = async (postId, commentData) => {
  const res = await axios.post(
    `${API_URL}/api/comment/create/${postId}`,
    commentData
  );
  return res.data.comment || [];
};

const likePost = async (postId, userId) => {
  const res = await axios.post(`${API_URL}/api/post/like/${postId}`, {
    userId,
  });
  return res.data;
};

const unlikePost = async (postId, userId) => {
  const res = await axios.delete(`${API_URL}/api/post/unlike/${postId}`, {
    data: { userId },
  });
  return res.data;
};

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  const user = useSelector((state) => state.auth.user);
  const userId = user?.id || user?.userId;

  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
  });

  const isAuthor = post && userId && post.User?.id === userId;

  const { mutate: deleteCurrentPost } = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => navigate("/"),
  });

  const { mutate: updatePost } = useMutation({
    mutationFn: (updatedData) => editPost(postId, updatedData),
    onSuccess: () => {
      setIsEditing(false);
      refetch();
    },
  });

  const { mutate: addNewComment, isLoading: isAddingComment } = useMutation({
    mutationFn: (commentData) => addComment(postId, commentData),
    onSuccess: () => {
      setComment("");
      refetch();
    },
  });

  const { mutate: likePostMutate } = useMutation({
    mutationFn: () => likePost(postId, userId),
    onSuccess: () => refetch(),
  });

  const { mutate: unlikePostMutate } = useMutation({
    mutationFn: () => unlikePost(postId, userId),
    onSuccess: () => refetch(),
  });

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteCurrentPost();
    }
  };

  const startEditingPost = () => {
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim() && editedContent.trim()) {
      updatePost({ title: editedTitle, content: editedContent });
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      addNewComment({ comment });
    }
  };

  const handleToggleLike = () => {
    if (!userId) return alert("Please login to like this post.");
    if (post.likedBy?.includes(userId)) {
      unlikePostMutate();
    } else {
      likePostMutate();
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-danger">Error: {error.message}</p>;

  return (
    <div className="container bg-light p-4 shadow mt-4 rounded">
      <div className="d-flex align-items-center mb-3">
        <img
          src={
            post.User?.profile_image
              ? `${API_URL}/uploads/${post.User.profile_image}`
              : "/default-avatar.png"
          }
          alt="User"
          className="rounded-circle me-2"
          width={40}
          height={40}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-avatar.png";
          }}
        />
        <div>
          <strong>{post.User?.username || "Unknown"}</strong>
          <div className="text-muted" style={{ fontSize: "12px" }}>
            {dayjs(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {post.post_image && (
        <img
          src={`${API_URL}/uploads/${post.post_image}`}
          className="img-fluid rounded mb-3"
          alt="Post"
          style={{ objectFit: "cover" }}
        />
      )}

      {isEditing ? (
        <div className="mb-4">
          <input
            type="text"
            className="form-control mb-2"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <textarea
            className="form-control mb-2"
            rows="4"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          ></textarea>
          <button
            onClick={handleSaveEdit}
            className="btn btn-success btn-sm me-2"
          >
            Save Changes
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </>
      )}

      {userId && (
        <div className="mb-4">
          <button
            onClick={handleToggleLike}
            className="btn btn-outline-success btn-sm me-2"
          >
            {post.likedBy?.includes(userId) ? "Unlike" : "Like"} Post
          </button>
          <span>{post.likesCount || 0} Likes</span>
        </div>
      )}

      {isAuthor && !isEditing && (
        <div className="mb-4">
          <button
            onClick={startEditingPost}
            className="btn btn-outline-primary btn-sm me-2"
          >
            Edit Post
          </button>
          <button
            onClick={handleDeletePost}
            className="btn btn-outline-danger btn-sm"
          >
            Delete Post
          </button>
        </div>
      )}

      <hr />
      <h5>Comments</h5>

      {userId ? (
        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-control"
            rows="3"
            placeholder="Add a comment"
          ></textarea>
          <button
            onClick={handleAddComment}
            className="btn btn-primary mt-2"
            disabled={isAddingComment || !comment.trim()}
          >
            {isAddingComment ? "Posting..." : "Post Comment"}
          </button>
        </div>
      ) : (
        <p className="text-muted">Please log in to like and comment.</p>
      )}

      <div className="mt-4">
        {post.comments?.length > 0 ? (
          post.comments.map((c) => (
            <div key={c.id} className="mb-3 p-3 border rounded">
              <div className="d-flex align-items-center mb-2">
                <img
                  src={
                    c.user?.profile_image
                      ? `${API_URL}/uploads/${c.user.profile_image}`
                      : "/default-avatar.png"
                  }
                  alt="User"
                  className="rounded-circle me-2"
                  width={30}
                  height={30}
                  style={{ objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <strong>{c.user?.username}</strong>
              </div>
              <p>{c.comment}</p>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default PostDetails;
