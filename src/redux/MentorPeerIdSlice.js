// idSlice.js
import { createSlice } from "@reduxjs/toolkit";

const MentorPeerIdSlice = createSlice({
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

export const { setId, clearId } = MentorPeerIdSlice.actions;
export default MentorPeerIdSlice.reducer;
