import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Automatically send cookies with each request
axios.defaults.withCredentials = true;

const API_URL = import.meta.env.VITE_API_URL;

// 🔹 Async thunk to fetch logged-in user's data
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/api/user/profile`, {
        withCredentials: true,
      });
      return res.data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

// 🔹 Async thunk to log out user (clears cookie on backend)
export const logoutUser = () => async (dispatch) => {
  try {
    await axios.post(
      `${API_URL}/api/user/logout`,
      {},
      { withCredentials: true }
    );
    dispatch(logout());
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

// 🔹 Redux slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true, // assume loading until we fetch
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 🔹 Export actions and reducer
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
