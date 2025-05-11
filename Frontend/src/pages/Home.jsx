import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

const fetchPosts = async ({ pageParam = 1 }) => {
  const res = await axios.get(`${API_URL}/api/post/getall?page=${pageParam}`);
  return res.data;
};

const Home = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: fetchPosts,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.hasMore) {
          return pages.length + 1;
        }
        return undefined;
      },
    });

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-danger">Failed to load posts.</p>;

  return (
    <div className="container post-container py-4 my-5 rounded bg-white">
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<Spinner />}
        endMessage={<p className="text-center mt-4">No more posts.</p>}
      >
        <div className="row g-4">
          {allPosts.map((post) => (
            <div key={post.id} className="col-md-12">
              <Link
                to={`/post/${post.id}`}
                className="text-decoration-none text-dark"
              >
                <div className="shadow-sm rounded p-3 bg-white">
                  {/* User Info */}
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={
                        post.User?.profile_image
                          ? `${API_URL}/uploads/${post.User.profile_image}`
                          : "/default-avatar.png"
                      }
                      alt="User"
                      className="rounded-circle me-2"
                      width={30}
                      height={30}
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null; // Prevents infinite loop
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <span className="fw-bold">
                      {post.User?.username || "Unknown"}
                    </span>
                    <span
                      className="text-muted ps-1"
                      style={{ fontSize: "12px" }}
                    >
                      - {dayjs(post.createdAt).fromNow()}
                    </span>
                  </div>

                  {/* Post Image */}
                  {post.post_image && (
                    <img
                      src={`${API_URL}/uploads/${post.post_image}`}
                      className="w-100 rounded mb-3"
                      alt="Post"
                      style={{ objectFit: "cover", height: "auto" }}
                    />
                  )}

                  {/* Post Content */}
                  <h5>{post.title}</h5>
                  <p>{post.content.slice(0, 100)}...</p>

                  {/* Post Stats */}
                  <div className="text-muted small d-flex justify-content-start gap-3 pt-2">
                    <span>
                      <i className="bi bi-hand-thumbs-up-fill text-primary"></i>{" "}
                      {post.Likers?.length || 0}
                    </span>
                    <span>
                      <i className="bi bi-chat-fill text-primary"></i>{" "}
                      {post.Comments?.length || 0}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Home;
