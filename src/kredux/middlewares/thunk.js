function thunk({ getState, dispatch }) {
  return (next) => {
    return (action) => {
      // 如果是个函数，则直接执行，并传入 dispatch 与 getState
      if (typeof action == "function") {
        return action(dispatch, getState);
      }
      next(action);
    };
  };
}
export default thunk;
