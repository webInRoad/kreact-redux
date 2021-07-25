import { useContext, useReducer, useLayoutEffect, useRef } from "react";
import ReactReduxContext from "./context";
import shallowEqual from "./shallowEqual";
function connect(mapStateToProps, mapDispatchToProps) {
  function getProps(store, wrapperProps) {
    const { getState, dispatch } = store;
    let stateProps = {};
    let dispatchProps = {};

    // 2. 如果传递了 mapStateToProps 参数，则传入 state 执行
    if (
      mapStateToProps !== "undefined" &&
      typeof mapStateToProps === "function"
    ) {
      stateProps = mapStateToProps(getState());
    }
    //  3. 默认将 dispatch 注入组件的 props 里
    dispatchProps = { dispatch };
    //  4. 如果传递了 mapDispatchToProps 参数并且参数是个函数类型，则传入 dispatch 执行
    //  5. 如果传递了 mapDispatchToProps 参数并且参数是个对象类型，则就要将参数当作 creators action 处理
    if (mapDispatchToProps !== "undefined") {
      if (typeof mapDispatchToProps === "function") {
        dispatchProps = mapDispatchToProps(dispatch);
      } else if (typeof mapDispatchToProps === "object") {
        dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
      }
    }

    // 6.组装最终的props
    const actualProps = Object.assign(
      {},
      wrapperProps,
      stateProps,
      dispatchProps
    );

    return actualProps;
  }
  return function (WrappedComponent) {
    return function (props) {
      // 1. 接收传递下来的 store
      const store = useContext(ReactReduxContext);
      const { subscribe } = store;
      const actualProps = getProps(store, props);
      // 7.记录上次渲染参数
      const lastProps = useRef();
      const [, forceUpdate] = useReducer((x) => x + 1, 0);
      const unsubscribe = useLayoutEffect(() => {
        subscribe(() => {
          const newProps = getProps(store, props);
          if (!shallowEqual(lastProps.current, newProps)) {
            lastProps.current = actualProps;
            forceUpdate();
          }
        });
        lastProps.current = actualProps;
        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      }, [store]);
      return <WrappedComponent {...actualProps} />;
    };
  };
}

// 手写 redux 里的 bindActionCreators
function bindActionCreators(creators, dispatch) {
  let obj = {};
  // 遍历对象
  for (let key in creators) {
    obj[key] = bindActionCreator(creators[key], dispatch);
  }
  return obj;
}

// 将 () => ({ type:'ADD' }) creator 转成成 () => dispatch({ type:'ADD' })
function bindActionCreator(creator, dispatch) {
  return (...args) => dispatch(creator(...args));
}

export default connect;
