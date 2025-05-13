import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import Spinner from "../components/Spinner";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-toastify";

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
    updatedData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data.post;
};

const deletePost = async (postId) => {
  const res = await axios.delete(`${API_URL}/api/post/delete/${postId}`);
  return res.data;
};

const addComment = async (postId, commentData) => {
  const { text } = commentData;
  if (!text) throw new Error("Comment text is required");
  const res = await axios.post(`${API_URL}/api/comment/create`, {
    postId,
    text,
  });
  return res.data.comment || [];
};

const deleteComment = async (commentId) => {
  const res = await axios.delete(`${API_URL}/api/comment/delete/${commentId}`);
  return res.data;
};

const updateComment = async ({ commentId, updatedText }) => {
  const res = await axios.put(`${API_URL}/api/comment/update/${commentId}`, {
    text: updatedText,
  });
  return res.data.comment;
};

const likePost = async (postId, userId) => {
  const res = await axios.post(
    `${API_URL}/api/like/like`,
    { postId },
    { userId }
  );
  return res.data;
};

const unlikePost = async (postId) => {
  const res = await axios.delete(`${API_URL}/api/like/unlike`, {
    data: { postId },
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
  const [editedImage, setEditedImage] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      navigate("/");
    },
  });

  const { mutate: updatePost } = useMutation({
    mutationFn: (updatedData) => editPost(postId, updatedData),
    onSuccess: () => {
      setIsEditing(false);
      refetch();
      toast.success("Post updated successfully!");
    },
  });

  const { mutate: addNewComment, isLoading: isAddingComment } = useMutation({
    mutationFn: (commentData) => addComment(postId, commentData),
    onSuccess: () => {
      setComment("");
      refetch();
      toast.success("Comment added!");
    },
  });

  const { mutate: removeComment } = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      refetch();
      toast.success("Comment deleted!");
    },
  });

  const { mutate: saveEditedComment } = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      setEditingCommentId(null);
      setEditedCommentText("");
      refetch();
      toast.success("Comment updated!");
    },
  });

  const { mutate: likePostMutate } = useMutation({
    mutationFn: () => likePost(postId, userId),
    onSuccess: () => {
      toast.success("Liked");
      refetch();
    },
  });

  const { mutate: unlikePostMutate } = useMutation({
    mutationFn: () => unlikePost(postId),
    onSuccess: () => {
      toast.error("Unlike");
      refetch();
    },
  });

  const toggleLike = () => {
    if (!userId) return toast.error("Please login to like posts.");
    post.likedBy?.includes(userId) ? unlikePostMutate() : likePostMutate();
  };

  const startEditingPost = () => {
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim() && editedContent.trim()) {
      const formData = new FormData();
      formData.append("title", editedTitle);
      formData.append("content", editedContent);
      if (editedImage) formData.append("post_image", editedImage);
      updatePost(formData);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    addNewComment({ text: comment });
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.comment);
  };

  const handleUpdateComment = () => {
    if (editedCommentText.trim()) {
      saveEditedComment({
        commentId: editingCommentId,
        updatedText: editedCommentText,
      });
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-danger">Error: {error.message}</p>;

  return (
    <div className="container bg-light p-4 shadow my-4 rounded">
      <div className="border-bottom mb-3">
        <h1 className="text-center text-primary">Blog Details</h1>
      </div>

      {/* Author Info */}
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
        />
      )}

      {/* Edit mode */}
      {isEditing ? (
        <>
          <input
            className="form-control mb-2"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <textarea
            className="form-control mb-2"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="form-control mb-2"
            onChange={(e) => setEditedImage(e.target.files[0])}
          />
          <button
            onClick={handleSaveEdit}
            className="btn btn-success btn-sm me-2"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </>
      )}

      {/* Like */}
      {userId && (
        <div className="mb-4 mt-3">
          <button
            onClick={toggleLike}
            className="btn btn-outline-success btn-sm me-2"
          >
            {post.likedBy?.includes(userId) ? "Unlike" : "Like"} Post
          </button>
          <span>
            <i className="bi bi-hand-thumbs-up-fill text-primary"></i>{" "}
            {post.likesCount || 0} Likes
          </span>
        </div>
      )}

      {!userId && (
        <div className="text-muted my-2">
          <i className="bi bi-hand-thumbs-up-fill text-primary"></i>{" "}
          {post.likesCount || 0} Likes
        </div>
      )}

      {/* Author Controls */}
      {isAuthor && !isEditing && (
        <div className="mb-4">
          <button
            onClick={startEditingPost}
            className="btn btn-outline-primary btn-sm me-2"
          >
            Edit Post
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline-danger btn-sm"
          >
            Delete Post
          </button>
        </div>
      )}

      {/* Comments */}
      <h5>Comments</h5>
      {userId ? (
        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-control"
            rows="3"
            placeholder="Add a comment"
          />
          <button
            onClick={handleAddComment}
            className="btn btn-primary mt-2"
            disabled={isAddingComment || !comment.trim()}
          >
            {isAddingComment ? "Posting..." : "Post Comment"}
          </button>
        </div>
      ) : (
        <p className="text-muted">Please log in to comment and like.</p>
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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <strong>{c.user?.username}</strong>
                <span className="ps-2 text-muted" style={{ fontSize: "12px" }}>
                  {dayjs(c.createdAt).fromNow()}
                </span>
              </div>

              {editingCommentId === c.id ? (
                <>
                  <textarea
                    className="form-control mb-2"
                    value={editedCommentText}
                    onChange={(e) => setEditedCommentText(e.target.value)}
                  />
                  <button
                    onClick={handleUpdateComment}
                    className="btn btn-sm btn-success me-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="btn btn-sm btn-secondary"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-1">{c.comment}</p>
                  {userId === c.userId && (
                    <div>
                      <button
                        onClick={() => startEditingComment(c)}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeComment(c.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>

      <div className="my-3 text-center">
        <Link to="#" onClick={() => window.history.back()}>
          <i className="bi bi-arrow-left"></i> Back to Blogs
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this post? This action cannot
                  be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteCurrentPost}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
