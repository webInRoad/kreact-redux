export default function createStore(reducer, enhancer) {
  // 判断是否存在 enhancer
  // 如果存在并且是个函数, 则将 createStore 传递给它
  // 它会返回个新的 createStore
  // 传入 reducer ,执行新的 createStore，返回 store
  // 返回该 store
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error("enhancer必须是函数");
    }
    return enhancer(createStore)(reducer);
  }
  let currentState;
  let curerntListeners = [];
  // 获取 store 的 state
  function getState() {
    return currentState;
  }
  // 更改 store
  function dispatch(action) {
    // 将当前的 state 以及 action 传入 reducer 函数
    // 返回新的 state 存储在 currentState
    currentState = reducer(currentState, action);
    // 执行订阅事件
    curerntListeners.forEach((listener) => listener());
  }
  // 订阅 state 更改
  function subscribe(listener) {
    curerntListeners.push(listener);
    return () => {
      const index = curerntListeners.indexOf(listener);
      curerntListeners.splice(index, 1);
    };
  }
  dispatch({ type: "kkk" });
  return {
    getState,
    dispatch,
    subscribe,
  };
}
