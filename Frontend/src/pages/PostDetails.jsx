import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import Spinner from "../components/Spinner";
import { useSelector } from "react-redux";

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
    `${API_URL}/api/post/update/${postId}`,
    updatedData
  );
  return res.data.post;
};

// Delete post
const deletePost = async (postId) => {
  const res = await axios.delete(`${API_URL}/api/post/delete/${postId}`);
  return res.data;
};

// Add a comment
const addComment = async (postId, commentData) => {
  const res = await axios.post(
    `${API_URL}/api/comment/create/${postId}`,
    commentData
  );
  return res.data.comment || [];
};

// Delete a comment
const deleteComment = async (commentId) => {
  const res = await axios.delete(`${API_URL}/api/comment/delete/${commentId}`);
  return res.data;
};

// Update comment
const updateComment = async ({ commentId, updatedText }) => {
  const res = await axios.put(`${API_URL}/api/comment/update/${commentId}`, {
    comment: updatedText,
  });
  return res.data.comment;
};

// Like post
const likePost = async (postId, userId) => {
  const res = await axios.post(`${API_URL}/api/post/like/${postId}`, {
    userId,
  });
  return res.data;
};

// Unlike post
const unlikePost = async (postId, userId) => {
  const res = await axios.delete(`${API_URL}/api/post/unlike/${postId}`, {
    data: { userId },
  });
  return res.data;
};

// Like comment
const likeComment = async (commentId, userId) => {
  const res = await axios.post(
    `${API_URL}/api/comment/likecomment/${commentId}`,
    { userId }
  );
  return res.data;
};

// Unlike comment
const unlikeComment = async (commentId, userId) => {
  const res = await axios.delete(
    `${API_URL}/api/comment/unlikecomment/${commentId}`,
    { data: { userId } }
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
    error,
    refetch,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
  });

  const userData = useSelector((state) => state.auth.user);
  const userId = userData?.id || userData?.userId;

  // Fix: Compare userId to post.userId
  const isAuthor = Number(post?.userId) === Number(userId);

  console.log(isAuthor);

  // Mutations
  const { mutate: addNewComment, isLoading: isAddingComment } = useMutation({
    mutationFn: (commentData) => addComment(postId, commentData),
    onSuccess: () => {
      setComment("");
      refetch();
    },
  });

  const { mutate: deleteCurrentPost, isLoading: isDeletingPost } = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      navigate("/");
    },
  });

  const { mutate: updatePost, isLoading: isUpdatingPost } = useMutation({
    mutationFn: (updatedData) => editPost(postId, updatedData),
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: removeComment, isLoading: isDeletingComment } = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: saveEditedComment, isLoading: isUpdatingComment } =
    useMutation({
      mutationFn: updateComment,
      onSuccess: () => {
        setEditingCommentId(null);
        setEditedText("");
        refetch();
      },
    });

  const {
    mutate: likePostMutate,
    isLoading: isLikingPost,
    error: likePostError,
  } = useMutation({
    mutationFn: () => likePost(postId, userId),
    onSuccess: () => {
      refetch();
    },
  });

  const {
    mutate: unlikePostMutate,
    isLoading: isUnlikingPost,
    error: unlikePostError,
  } = useMutation({
    mutationFn: () => unlikePost(postId, userId),
    onSuccess: () => {
      refetch();
    },
  });

  const {
    mutate: likeCommentMutate,
    isLoading: isLikingComment,
    error: likeCommentError,
  } = useMutation({
    mutationFn: (commentId) => likeComment(commentId, userId),
    onSuccess: () => {
      refetch();
    },
  });

  const {
    mutate: unlikeCommentMutate,
    isLoading: isUnlikingComment,
    error: unlikeCommentError,
  } = useMutation({
    mutationFn: (commentId) => unlikeComment(commentId, userId),
    onSuccess: () => {
      refetch();
    },
  });

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteCurrentPost();
    }
  };

  const handleEditPost = () => {
    const updatedData = {
      title: prompt("Enter new title", post.title),
      content: prompt("Enter new content", post.content),
    };

    if (updatedData.title && updatedData.content) {
      updatePost(updatedData);
    }
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

  const handleUpdateComment = () => {
    if (editedText.trim()) {
      saveEditedComment({
        commentId: editingCommentId,
        updatedText: editedText,
      });
    }
  };

  const handleLikePost = () => {
    if (!userId) {
      alert("Please login to like posts");
      return;
    }

    if (post?.likedBy?.includes(userId)) {
      unlikePostMutate();
    } else {
      likePostMutate();
    }
  };

  const handleLikeComment = (commentId) => {
    if (!userId) {
      alert("Please login to like comments");
      return;
    }

    const comment = post?.comments?.find((c) => c.id === commentId);
    if (comment?.likedBy?.includes(userId)) {
      unlikeCommentMutate(commentId);
    } else {
      likeCommentMutate(commentId);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-danger">Error: {error.message}</p>;

  return (
    <div className="container mt-4">
      <h3 className="mb-4">{post?.title}</h3>
      <p>{post?.content}</p>

      {userId && isAuthor && (
        <div className="mb-3">
          <button
            onClick={handleEditPost}
            className="btn btn-outline-primary btn-sm me-2"
            disabled={isUpdatingPost}
          >
            {isUpdatingPost ? "Updating..." : "Edit Post"}
          </button>
          <button
            onClick={handleDeletePost}
            className="btn btn-outline-danger btn-sm"
            disabled={isDeletingPost}
          >
            {isDeletingPost ? "Deleting..." : "Delete Post"}
          </button>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={handleLikePost}
          className="btn btn-outline-success btn-sm me-2"
          disabled={isLikingPost || isUnlikingPost}
        >
          {post?.likedBy?.includes(userId) ? "Unlike" : "Like"} Post
          {(isLikingPost || isUnlikingPost) && (
            <Spinner size="sm" className="ms-2" />
          )}
        </button>
        <span> {post?.likesCount || 0} Likes</span>
        {(likePostError || unlikePostError) && (
          <div className="text-danger mt-1">
            {likePostError?.message || unlikePostError?.message}
          </div>
        )}
      </div>

      <h4 className="mt-4">Comments</h4>

      {userId ? (
        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-control"
            rows="3"
            placeholder="Add a comment"
            disabled={isAddingComment}
          ></textarea>
          <button
            onClick={handleAddComment}
            className="btn btn-primary mt-2"
            disabled={isAddingComment || !comment.trim()}
          >
            {isAddingComment ? "Adding..." : "Add Comment"}
          </button>
        </div>
      ) : (
        <p className="text-muted">Please log in to add a comment.</p>
      )}

      <div className="mt-4">
        {post?.comments?.length > 0 ? (
          post.comments.map((c) => (
            <div key={c.id} className="mb-3 p-3 border rounded">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1">
                    <strong>{c.user?.username}</strong>
                  </p>

                  {editingCommentId === c.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="form-control mb-2"
                        rows="2"
                      ></textarea>
                      <button
                        onClick={handleUpdateComment}
                        className="btn btn-sm btn-success me-2"
                        disabled={isUpdatingComment}
                      >
                        {isUpdatingComment ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="btn btn-sm btn-secondary"
                        disabled={isUpdatingComment}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="mb-2">{c.comment}</p>
                  )}
                </div>

                {userId === c.userId && editingCommentId !== c.id && (
                  <div className="d-flex">
                    <button
                      onClick={() => startEditingComment(c)}
                      className="btn btn-sm btn-outline-primary me-2"
                      disabled={isDeletingComment}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeComment(c.id)}
                      className="btn btn-sm btn-outline-danger"
                      disabled={isDeletingComment}
                    >
                      {isDeletingComment ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-2">
                <button
                  onClick={() => handleLikeComment(c.id)}
                  className="btn btn-outline-success btn-sm me-2"
                  disabled={isLikingComment || isUnlikingComment}
                >
                  {c.likedBy?.includes(userId) ? "Unlike" : "Like"} Comment
                  {(isLikingComment || isUnlikingComment) && (
                    <Spinner size="sm" className="ms-2" />
                  )}
                </button>
                <span>{c.likesCount || 0} Likes</span>
                {(likeCommentError || unlikeCommentError) && (
                  <div className="text-danger mt-1">
                    {likeCommentError?.message || unlikeCommentError?.message}
                  </div>
                )}
              </div>
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
