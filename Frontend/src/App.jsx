import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AddPost from "./pages/AddPost";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import PostDetails from "./pages/PostDetails";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:postId" element={<PostDetails />} />
        <Route path="/add-post" element={<AddPost />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
