import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Thunk for login (admin or parent)
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ role, ...credentials }, { rejectWithValue }) => {
    try {
      // Determine endpoint based on role
      const endpoint =
        role === "admin" ? "/api/admin/login" : "/api/parent/login";

      const response = await api.post(endpoint, credentials);

      console.log(response.data);
      return {
        user: response.data[role], // "admin" or "parent" key in the response
        token: response.data.token,
        role,
      };
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Login failed.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the user slice
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    role: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { logout } = userSlice.actions;
export default userSlice.reducer;
