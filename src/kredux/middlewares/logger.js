function logger(store) {
  return (next) => {
    return (action) => {
      console.log("====================================");
      console.log(action.type + "执行了！");
      console.log("prev state", store.getState());
      next(action);
      console.log("next state", store.getState());
      console.log("====================================");
    };
  };
}
export default logger;
