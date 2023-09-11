// reducers/userReducer.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: localStorage.getItem("user")
    ? localStorage.getItem("user")
    : [],
  reducers: {
    setUser: (state, action) => {
      const user = action.payload;
      localStorage.setItem("user", user.username); // Save user to localStorage
      localStorage.setItem("role", user.role); // Save user to localStorage
      return user;
    },
    signOut: (state) => {
      localStorage.removeItem("user"); // Remove user data from localStorage
      localStorage.removeItem("role"); // Save user to localStorage
      return null; // Clear user data (sign out)
    },
  },
});

export const { setUser, signOut } = userSlice.actions;
export default userSlice.reducer;
