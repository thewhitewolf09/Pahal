import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

const getToken = (state) => state.user.token;

// Add Performance
export const addPerformance = createAsyncThunk(
  "performance/add",
  async (performanceData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/performance", performanceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.performance;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add performance.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch All Performance Records
export const fetchAllPerformance = createAsyncThunk(
  "performance/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get("/api/performance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.performances;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch performance records.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Performance by Student ID
export const fetchPerformanceByStudent = createAsyncThunk(
  "performance/fetchByStudent",
  async (studentId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get(`/api/performance/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.performance;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch performance records.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update Performance
export const updatePerformance = createAsyncThunk(
  "performance/update",
  async ({ id, marks }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.patch(
        `/api/performance/${id}`,
        { marks },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.performance;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update performance.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete Performance
export const deletePerformance = createAsyncThunk(
  "performance/delete",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      await api.delete(`/api/performance/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id; // Return the deleted performance ID for state update
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete performance.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Performance Slice
const performanceSlice = createSlice({
  name: "performance",
  initialState: {
    performanceRecords: [],
    performanceByStudent: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPerformanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Performance
      .addCase(addPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceRecords.push(action.payload);
      })
      .addCase(addPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Performance Records
      .addCase(fetchAllPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceRecords = action.payload;
      })
      .addCase(fetchAllPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Performance by Student
      .addCase(fetchPerformanceByStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceByStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceByStudent = action.payload;
      })
      .addCase(fetchPerformanceByStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Performance
      .addCase(updatePerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePerformance.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.performanceRecords.findIndex(
          (record) => record._id === action.payload._id
        );
        if (index !== -1) {
          state.performanceRecords[index] = action.payload;
        }
      })
      .addCase(updatePerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Performance
      .addCase(deletePerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceRecords = state.performanceRecords.filter(
          (record) => record._id !== action.payload
        );
      })
      .addCase(deletePerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearPerformanceError } = performanceSlice.actions;

export default performanceSlice.reducer;
