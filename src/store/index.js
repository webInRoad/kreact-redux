import { createStore, applyMiddleware, combineReducers } from "../kredux";
import logger from "../kredux/middlewares/logger";
import thunk from "../kredux/middlewares/thunk";

const initialUser = {
  id: null,
  name: "",
};
const counterReducer = (state = 0, { type, payload = 1 }) => {
  switch (type) {
    case "ADD":
      return state + payload;
    case "MINUS":
      return state - payload;
    default:
      return state;
  }
};

const userReducer = (state = { ...initialUser }, { type, payload }) => {
  switch (type) {
    case "SET":
      return { ...state, ...payload };
    default:
      return state;
  }
};
export default createStore(
  combineReducers({ count: counterReducer, user: userReducer }),
  applyMiddleware(thunk, logger)
);
