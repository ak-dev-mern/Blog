import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import Spinner from "../components/Spinner";
import { getLoggedInUserId } from "../utils/getToken.js";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

// Fetch post details
const fetchPost = async (postId) => {
  const res = await axios.get(`${API_URL}/api/post/${postId}`);
  return res.data.post;
};

// Edit post
const editPost = async (postId, updatedData) => {
  const res = await axios.put(
    `${API_URL}/api/post/update-post/${postId}`,
    updatedData
  );
  return res.data.post;
};

// Delete post
const deletePost = async (postId) => {
  const res = await axios.delete(`${API_URL}/api/post/delete-post/${postId}`);
  return res.data;
};

// Add a comment
const addComment = async (postId, commentData) => {
  const res = await axios.post(
    `${API_URL}/api/comment/create-comment/${postId}`,
    commentData
  );
  return res.data.comment || [];
};

// Delete a comment
const deleteComment = async (commentId) => {
  const res = await axios.delete(
    `${API_URL}/api/comment/delete-comment/${commentId}`
  );
  return res.data;
};

// Update comment
const updateComment = async ({ commentId, updatedText }) => {
  const res = await axios.put(
    `${API_URL}/api/comment/update-comment/${commentId}`,
    {
      comment: updatedText,
    }
  );
  return res.data.comment;
};

// Like post
const likePost = async (postId, userId) => {
  const res = await axios.post(`${API_URL}/api/post/like-post/${postId}`, {
    userId,
  });
  return res.data;
};

// Unlike post
const unlikePost = async (postId, userId) => {
  const res = await axios.delete(`${API_URL}/api/post/unlike-post/${postId}`, {
    data: { userId },
  });
  return res.data;
};

// Like comment
const likeComment = async (commentId, userId) => {
  const res = await axios.post(
    `${API_URL}/api/comment/like-comment/${commentId}`,
    {
      userId,
    }
  );
  return res.data;
};

// Unlike comment
const unlikeComment = async (commentId, userId) => {
  const res = await axios.delete(
    `${API_URL}/api/comment/unlike-comment/${commentId}`,
    {
      data: { userId },
    }
  );
  return res.data;
};

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");

  const {
    data: post,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
  });

  const { mutate: addNewComment } = useMutation({
    mutationFn: (commentData) => addComment(postId, commentData),
    onSuccess: () => {
      setComment("");
      refetch();
    },
  });

  const { mutate: deleteCurrentPost } = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      navigate("/");
    },
  });

  const { mutate: updatePost } = useMutation({
    mutationFn: (updatedData) => editPost(postId, updatedData),
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: removeComment } = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: saveEditedComment } = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      setEditingCommentId(null);
      setEditedText("");
      refetch();
    },
  });

  const { mutate: likePostMutate } = useMutation({
    mutationFn: (userId) => likePost(postId, userId),
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: unlikePostMutate } = useMutation({
    mutationFn: (userId) => unlikePost(postId, userId),
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: likeCommentMutate } = useMutation({
    mutationFn: (commentId, userId) => likeComment(commentId, userId),
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: unlikeCommentMutate } = useMutation({
    mutationFn: (commentId, userId) => unlikeComment(commentId, userId),
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-danger">Failed to load post.</p>;

const userId = getLoggedInUserId();
const isAuthor =
  userId && post?.userId && String(post.userId) === String(userId);

console.log("User ID:", userId);
console.log("Post User ID:", post?.userId);
console.log("Is Author:", isAuthor);

  const handleDeletePost = () => {
    deleteCurrentPost();
  };

  const handleEditPost = () => {
    const updatedData = { title: "New Title", content: "Updated content" }; // Replace with form
    updatePost(updatedData);
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      addNewComment({ comment });
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedText(comment.comment);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditedText("");
  };

  const handleUpdateComment = (commentId) => {
    if (editedText.trim()) {
      saveEditedComment({ commentId, updatedText: editedText });
    }
  };

  const handleLikePost = () => {
    if (post.likedBy.includes(userId)) {
      unlikePostMutate(userId);
    } else {
      likePostMutate(userId);
    }
  };

  const handleLikeComment = (commentId) => {
    if (commentId.likedBy.includes(userId)) {
      unlikeCommentMutate(commentId, userId);
    } else {
      likeCommentMutate(commentId, userId);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">{post.title}</h3>
      <p>{post.content}</p>

      {userId && isAuthor && (
        <div>
          <button
            onClick={handleEditPost}
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

      <div>
        <button
          onClick={handleLikePost}
          className="btn btn-outline-success btn-sm"
        >
          {post.likedBy && post.likedBy.includes(userId) ? "Unlike" : "Like"}{" "}
          Post
        </button>
        <span> {post.likesCount || 0} Likes</span>{" "}
        {/* Ensure it displays 0 if likesCount is undefined */}
      </div>

      <h4 className="mt-4">Comments</h4>

      {userId ? (
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-control"
            rows="3"
            placeholder="Add a comment"
          ></textarea>
          <button onClick={handleAddComment} className="btn btn-primary mt-2">
            Add Comment
          </button>
        </div>
      ) : (
        <p className="text-muted">Please log in to add a comment.</p>
      )}

      <div className="mt-4">
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((c) => (
            <div key={c.id} className="mb-3">
              <p>
                <strong>{c.user.username}</strong>:
              </p>

              {editingCommentId === c.id ? (
                <>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="form-control mb-2"
                    rows="2"
                  ></textarea>
                  <button
                    onClick={() => handleUpdateComment(c.id)}
                    className="btn btn-sm btn-success me-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="btn btn-sm btn-secondary"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div className="d-flex justify-content-between">
                  <p>{c.comment}</p>
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
                  <div>
                    <button
                      onClick={() => handleLikeComment(c)}
                      className="btn btn-outline-success btn-sm"
                    >
                      {c.likedBy.includes(userId) ? "Unlike" : "Like"} Comment
                    </button>
                    <span> {c.likesCount} Likes</span>
                  </div>
                </div>
              )}
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
