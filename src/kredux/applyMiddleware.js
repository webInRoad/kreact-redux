export default function applyMiddleware(...middlewares) {
  // applyMiddleware 的返回值应该是一个 enhancer
  // enhancer 是个接收 createStore 为参数的函数
  return function (createStore) {
    // enhancer 要返回一个新的 createStore
    return function newCreateStore(reducer) {
      // 创建 store
      let store = createStore(reducer);
      let dispatch = store.dispatch;

      // dispatch 属性一定要写成这种形式,不能直接将 store.dispatch 传入
      // 因为有多个中间件时, dispatch 的值是要获取上一个中间件加强后的 dispatch
      // 这种传递方式有效，是由于 dispatch 是引用类型
      const midApi = {
        getState: store.getState,
        dispatch: (action, ...args) => dispatch(action, ...args),
      };
      // 调用中间件的第一层函数 传递阉割版的 store 对象
      const middlewareChain = middlewares.map((middle) => middle(midApi));
      // 用 compose 得到一个组合了所有中间件的函数
      const middleCompose = compose(...middlewareChain);

      // 将原始的 dispatch 函数作为参数逐个调用中间件的第二层函数
      // 返回加强的 dispatch 覆盖最初的 dispatch
      dispatch = middleCompose(dispatch);

      return {
        ...store,
        dispatch,
      };
    };
  };
}
function compose(...funs) {
  if (funs.length === 0) {
    return (arg) => arg;
  }
  if (funs.length === 1) {
    return funs[0];
  }

  return funs.reduce((a, b) => {
    return (...args) => {
      return a(b(...args));
    };
  });
}
