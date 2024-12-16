import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

const getToken = (state) => state.user.token;

// Add Attendance
export const addAttendance = createAsyncThunk(
  "attendance/add",
  async (attendanceData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/attendance", attendanceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.attendance;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add attendance.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Attendance by Date
export const fetchAttendanceByDate = createAsyncThunk(
  "attendance/fetchByDate",
  async (date, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get(`/api/attendance/date/${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.attendance;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch attendance.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Attendance by Student
export const fetchAttendanceByStudent = createAsyncThunk(
  "attendance/fetchByStudent",
  async (studentId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get(`/api/attendance/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.attendance;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch attendance.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update Attendance
export const updateAttendance = createAsyncThunk(
  "attendance/update",
  async (attendanceData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    console.log("hi")
    try {
      const response = await api.patch(`/api/attendance`, attendanceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.attendance;
    } catch (error) {
      console.error(error)
      const errorMessage =
        error.response?.data?.message || "Failed to update attendance.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete Attendance
export const deleteAttendance = createAsyncThunk(
  "attendance/delete",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      await api.delete(`/api/attendance/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id; // Return the deleted attendance ID for state update
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete attendance.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Attendance Slice
const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendanceRecords: [],
    attendanceByStudent: [],
    attendanceByDate: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Attendance
      .addCase(addAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceRecords = action.payload;
      })
      .addCase(addAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Attendance by Date
      .addCase(fetchAttendanceByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceByDate = action.payload;
      })
      .addCase(fetchAttendanceByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Attendance by Student
      .addCase(fetchAttendanceByStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceByStudent = action.payload;
      })
      .addCase(fetchAttendanceByStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Attendance
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceRecords= action.payload
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Attendance
      .addCase(deleteAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceRecords = state.attendanceRecords.filter(
          (record) => record._id !== action.payload
        );
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearAttendanceError } = attendanceSlice.actions;

export default attendanceSlice.reducer;
