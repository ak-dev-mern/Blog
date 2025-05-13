import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import AddPost from "./pages/AddPost";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import PostDetails from "./pages/PostDetails";
import PrivateRoute from "./utils/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../src/App.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "./redux/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, []);
  return (
    <>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route
            path="/add-post"
            element={
              <PrivateRoute>
                <AddPost />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
