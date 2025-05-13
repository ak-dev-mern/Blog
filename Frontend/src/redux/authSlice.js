import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Automatically send cookies with each request
axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL;

// Async thunk to fetch user data from backend
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/api/user/profile`, {
        withCredentials: true, // Ensure cookies are sent
      });

      return res.data.user; // ✅ Return user data to Redux store
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
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
        state.error = null; // Reset error when fetching user is successful
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
