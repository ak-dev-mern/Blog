import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import AddPost from "./pages/AddPost";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import PostDetails from "./pages/PostDetails";
import PrivateRoute from "./utils/PrivateRoute";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchUser } from "./redux/authSlice";
import "../src/App.css"

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);
  return (
    <>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route path="/add-post" element={<AddPost />} />
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
    </>
  );
}

export default App;
