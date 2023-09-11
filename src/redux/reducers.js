// reducers/index.js
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./UserSlice";
import userPeerId from "./UserPeerIdSlice";
import mentorPeerId from "./MentorPeerIdSlice";
const rootReducer = combineReducers({
  user: userReducer,
  userId: userPeerId,
  mentorId: mentorPeerId,
});

export default rootReducer;
