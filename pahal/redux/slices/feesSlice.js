import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

const getToken = (state) => state.user.token;

// Add Fee
export const addFee = createAsyncThunk(
  "fees/add",
  async (feeData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/fees", feeData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.fee;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add fee record.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch All Fees
export const fetchAllFees = createAsyncThunk(
  "fees/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get("/api/fees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.fees;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch fee records.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Fees by Student ID
export const fetchFeesByParent = createAsyncThunk(
  "fees/fetchFeesByParent",
  async (parentId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get(`/api/fees/${parentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      
      return response.data.fees;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch fee records.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update Fee Status (Paid)
export const updateFeeStatus = createAsyncThunk(
  "fees/updateStatus",
  async ({ id, status, paymentDetails }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.patch(
        `/api/fees/${id}`,
        { status, ...paymentDetails },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.fee;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update fee status.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete Fee Record
export const deleteFee = createAsyncThunk(
  "fees/delete",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      await api.delete(`/api/fees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id; // Return the deleted fee ID for state update
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete fee record.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Pending Fees (for reminders)
export const fetchPendingFees = createAsyncThunk(
  "fees/fetchPending",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get("/api/fees/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.pendingFees;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch pending fee records.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Monthly Fees Summary
export const fetchMonthlyFeesSummary = createAsyncThunk(
  "fees/fetchMonthlyFeesSummary",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get("/api/fees/summery/monthly", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.summary;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch monthly fees summary.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fees Slice
const feesSlice = createSlice({
  name: "fees",
  initialState: {
    feesRecords: [],
    feesByParent: [],
    pendingFees: [],
    monthlySummary: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearFeesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Fee
      .addCase(addFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFee.fulfilled, (state, action) => {
        state.loading = false;
        state.feesRecords.push(action.payload);
      })
      .addCase(addFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Fees
      .addCase(fetchAllFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFees.fulfilled, (state, action) => {
        state.loading = false;
        state.feesRecords = action.payload;
      })
      .addCase(fetchAllFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Fees by Student
      .addCase(fetchFeesByParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeesByParent.fulfilled, (state, action) => {
        state.loading = false;
        state.feesByParent = action.payload;
      })
      .addCase(fetchFeesByParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Fee Status
      .addCase(updateFeeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeeStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.feesRecords.findIndex(
          (record) => record._id === action.payload._id
        );
        if (index !== -1) {
          state.feesRecords[index] = action.payload;
        }
      })
      .addCase(updateFeeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Fee Record
      .addCase(deleteFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFee.fulfilled, (state, action) => {
        state.loading = false;
        state.feesRecords = state.feesRecords.filter(
          (record) => record._id !== action.payload
        );
      })
      .addCase(deleteFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Pending Fees
      .addCase(fetchPendingFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingFees.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingFees = action.payload;
      })
      .addCase(fetchPendingFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Monthly Fees Summary
      .addCase(fetchMonthlyFeesSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyFeesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlySummary = action.payload;
      })
      .addCase(fetchMonthlyFeesSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearFeesError } = feesSlice.actions;

export default feesSlice.reducer;
