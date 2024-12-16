import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

const getToken = (state) => state.user.token;

// Add Parent
export const addParent = createAsyncThunk(
  "parent/add",
  async (parentData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/parent", parentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.parent;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add parent.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update Parent
export const updateParent = createAsyncThunk(
  "parent/update",
  async ({ id, updatedData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.patch(`/api/parent/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.parent;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update parent.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete Parent
export const deleteParent = createAsyncThunk(
  "parent/delete",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      await api.delete(`/api/parent/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id; // Return the ID of the deleted parent for state updates
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete parent.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch All Parents
export const fetchAllParents = createAsyncThunk(
  "parent/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get("/api/parent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.parents;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch parents.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Parent by ID
export const fetchParentById = createAsyncThunk(
  "parent/fetchById",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get(`/api/parent/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.parent;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch parent.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Send Reminder to a Single Parent
export const sendReminder = createAsyncThunk(
  "parent/sendReminder",
  async (parentId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post(
        `/api/parent/send-reminder`,
        { parentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.reminder; // Return reminder details
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send reminder.";
      return rejectWithValue(errorMessage);
    }
  }
);
 

// Notify All Parents
export const notifyAllParents = createAsyncThunk(
  "parent/notifyAllParents",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/parent/notify-all", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.results; // Return the notification results
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to notify all parents.";
      return rejectWithValue(errorMessage);
    }
  }
);


// Parent Slice
const parentSlice = createSlice({
  name: "parent",
  initialState: {
    parent: null,
    parents: [],
    reminders: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearParentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Add Parent
      .addCase(addParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addParent.fulfilled, (state, action) => {
        state.loading = false;
        state.parents.push(action.payload);
      })
      .addCase(addParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Update Parent
      .addCase(updateParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateParent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.parents.findIndex(
          (parent) => parent._id === action.payload._id
        );
        if (index !== -1) {
          state.parents[index] = action.payload;
        }
      })
      .addCase(updateParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Delete Parent
      .addCase(deleteParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteParent.fulfilled, (state, action) => {
        state.loading = false;
        state.parents = state.parents.filter(
          (parent) => parent._id !== action.payload
        );
      })
      .addCase(deleteParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Fetch All Parents
      .addCase(fetchAllParents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllParents.fulfilled, (state, action) => {
        state.loading = false;
        state.parents = action.payload;
      })
      .addCase(fetchAllParents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Fetch Parent by ID
      .addCase(fetchParentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParentById.fulfilled, (state, action) => {
        state.loading = false;
        state.parent = action.payload;
      })
      .addCase(fetchParentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle Send Reminder
      .addCase(sendReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendReminder.fulfilled, (state, action) => {
        state.loading = false;
        state.reminders.push(action.payload);
      })
      .addCase(sendReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Notify All Parents
      .addCase(notifyAllParents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(notifyAllParents.fulfilled, (state, action) => {
        state.loading = false;
        state.reminders = action.payload; // Save notification results
      })
      .addCase(notifyAllParents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearParentError } = parentSlice.actions;

export default parentSlice.reducer;
