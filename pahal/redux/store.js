// store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { composeWithDevTools } from "@redux-devtools/extension";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import userReducer from "./slices/userSlice";
import parentReducer from "./slices/parentSlice";
import studentReducer from "./slices/studentsSlice";
import attendanceReducer from "./slices/attendanceSlice";
import performanceReducer from "./slices/performanceSlice";
import feesReducer from "./slices/feesSlice"
import paymentReducer from "./slices/paymentSlice"

// Redux persist configuration
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  parent: parentReducer,
  student: studentReducer,
  attendance: attendanceReducer,
  performance: performanceReducer,
  fees: feesReducer,
  payment: paymentReducer
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store using Redux Toolkit
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For redux-persist compatibility
    }),
  devTools: process.env.NODE_ENV !== "production", // Enable DevTools in development
});

// Create persistor for redux-persist
const persistor = persistStore(store);

export { store, persistor };
