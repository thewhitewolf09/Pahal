import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

const getToken = (state) => state.user.token;

// Process Payment
export const processPayment = createAsyncThunk(
  "payments/process",
  async (paymentData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/payment", paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.payment;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to process payment.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Payment History by Parent ID
export const fetchPaymentHistory = createAsyncThunk(
  "payments/fetchHistory",
  async (parentId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get(`/api/payment/history/${parentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.payments;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch payment history.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete Payment
export const deletePayment = createAsyncThunk(
  "payments/delete",
  async (paymentId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      await api.delete(`/api/payment/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return paymentId; // Return the deleted payment ID for state update
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete payment.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Payment Slice
const paymentSlice = createSlice({
  name: "payments",
  initialState: {
    paymentHistory: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory.unshift(action.payload); // Add new payment to the history
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Payment History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Payment
      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = state.paymentHistory.filter(
          (payment) => payment._id !== action.payload
        );
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearPaymentError } = paymentSlice.actions;

export default paymentSlice.reducer;
