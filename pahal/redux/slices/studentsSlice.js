import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

const getToken = (state) => state.user.token;

// Add Student
export const addStudent = createAsyncThunk(
  "student/add",
  async (studentData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/student", studentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.student;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add student.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update Student
export const updateStudent = createAsyncThunk(
  "student/update",
  async ({ id, updatedData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.patch(`/api/student/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.student;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update student.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete Student
export const deleteStudent = createAsyncThunk(
  "student/delete",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      await api.delete(`/api/student/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id; // Return the ID of the deleted student for state updates
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete student.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch All Students
export const fetchAllStudents = createAsyncThunk(
  "student/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get("/api/student", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.students;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch students.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Student by ID
export const fetchStudentById = createAsyncThunk(
  "student/fetchById",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.get(`/api/student/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.student;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch student.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Student Slice
const studentSlice = createSlice({
  name: "student",
  initialState: {
    student: null,
    students: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearStudentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Add Student
      .addCase(addStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students.push(action.payload);
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Update Student
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.students.findIndex(
          (student) => student._id === action.payload._id
        );
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Delete Student
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.filter(
          (student) => student._id !== action.payload
        );
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Fetch All Students
      .addCase(fetchAllStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchAllStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Fetch Student by ID
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearStudentError } = studentSlice.actions;

export default studentSlice.reducer;
