// idSlice.js
import { createSlice } from "@reduxjs/toolkit";

const UserPeerIdSlice = createSlice({
  name: "id",
  initialState: null,
  reducers: {
    setId: (state, action) => {
      return action.payload;
    },
    clearId: (state) => {
      return null;
    },
  },
});

export const { setId, clearId } = UserPeerIdSlice.actions;
export default UserPeerIdSlice.reducer;
