
>[本文代码](https://codesandbox.io/s/github/webInRoad/kreact-redux)

[上一篇手写了 Redux 源码](https://juejin.cn/post/6988465501047357471)，同时也说明了 Redux 里头是没有 React 相关的 API，这篇咱们来写下 React-Redux，那么 React，Redux 以及 React-Redux 关系是：
 - Redux： Redux 是一个应用状态管理js库，它本身和 React 是没有关系的，换句话说，Redux 可以应用于其他框架构建的前端应用。
 - React-Redux：React-Redux 是连接 React 应用和 Redux 状态管理的桥梁。React-redux 主要专注两件事，一是如何向 React 应用中注入 redux 中的 Store ，二是如何根据 Store 的改变，把消息派发给应用中需要状态的每一个组件。
 - React:用于构建用户界面的库

#	一、为什么要使用 React-Redux
上一篇使用 Redux 开发了个加减器的功能，但是暴露了几个问题：

 1.  store 需要手动引入，并且在组件初始化以及销毁时，手动进行 subscribe 与 unsubscribe 
```javascript
import store from "../store";
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate();
    });
  }
  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
```
 2. 状态的更改，会导致所有的组件都重新渲染，比如 A 组件只依赖 a 状态，而 b 状态更改时，也会导致 A 组件的重新渲染
为了解决这些问题，react-redux 就应运而生了

# 二、什么是 React-Redux 
React-Redux 是连接 React 应用和 Redux 状态管理的桥梁。其中既有 React 的 API，也会依赖 Redux 的相关 API。其实 React-Redux 主要提供了两个 api:
1. Provider 为后代组件提供store
2. connect 为组件提供数据和变更⽅法
## Provider
将根组件嵌套在 `<Provider>` 中，这样子孙组件就能通过 `connect` 获取到 state

例子：

```javascript
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

```
其中的	`store` 参数就是指 Redux 的 `createStore` 生成的 store

## connect
`connect` 是个高阶组件，经过它包装后的组件将获取如下功能：

 1. 默认 `props` 里会带有 `dispatch` 函数
 2. 如果给 `connect` 传递了第一个参数，那么会将 `store` 里的 `state` 数据，映射到当前组件的 `props` 里
 3. 如果给 `connect` 传递了第二个参数，那么会将相关方法，映射到当前组件的 `props` 里
 4. 组件依赖的 `state` 更改时，会通知当前组件更新，重新渲染视图
 语法：
```javascript
function connect(mapStateToProps?, mapDispatchToProps?, mergeProps?, options?)
```
> 默认 create-react-app 脚手架是不支持 @装饰器的，可以通过 react-app-rewired [优雅配制](https://www.huaweicloud.com/articles/71bf8dcfcd156da7e5c1d325b6a999d9.html)

接下来分别讲解下这四个参数

**mapStateToProps：**
```javascript
const mapStateToProps = state => ({ count: state.count })
```
该函数必须返回一个纯对象，这个对象会与组件的 props 合并。如果定义该参数，组件将会监听 Redux store 的变化，否则不监听。

**mapDispatchToProps:**

如果省略这个 `mapDispatchToProps` 参数，默认情况下，`dispatch` 会注⼊到你的组件 `props` 中。
该参数存在两种格式：
 - 对象格式：
```javascript
const mapDispatchToProps = {
  add: () => ({ type: "ADD" }),
  minus: () => ({ type: "MINUS" }),
};
```
对象里的方法名会被合并到组件的 `props` 里，通过该方法名就可以触发相应的 `action`

**对象的形式，没办法往 `props` 里注入 `dispatch`，只能是具体的 `action` 操作**
 - 函数形式：
该函数将接收 `dispatch` 参数，然后返回任何要注入到 props 里的对象
```javascript
const mapDispatchToProps = (dispatch) => ({
  add: () => dispatch({ type: "ADD" }),
  minus: () => dispatch({ type: "MINUS" }),
});
```
上面这种写法有些复杂，可以采用 redux 提供的 `bindActionCreators` 简化下

```javascript
const mapDispatchToProps = (dispatch) => {
  let creators = {
    add: () => ({ type: "ADD" }),
    minus: () => ({ type: "MINUS" }),
  };
  creators = bindActionCreators(creators, dispatch);
  return {
    ...creators,
    dispatch,
  };
};
```
**mergeProps:**
```javascript
mergeProps(stateProps, dispatchProps, ownProps)
```
如果省略这个 mergeProps 参数，默认情况下，会返回 `Object.assign({}, ownProps, stateProps, dispatchProps)`。

如果定义了这个参数，`mapStateToProps()` 与 `mapDispatchToProps()` 的执⾏结果和组件⾃身的 `props` 将传⼊到这个回调函数中。

该回调函数返回的对象将作为 `props` 传递到被包裹的组件中。

**options:**
```javascript
{
  context?: Object,   // 自定义上下文
  pure?: boolean, // 默认为 true , 当为 true 的时候 ，除了 mapStateToProps 和 props ,其他输入或者state 改变，均不会更新组件。
  areStatesEqual?: Function, // 当pure true , 比较引进store 中state值 是否和之前相等。 (next: Object, prev: Object) => boolean
  areOwnPropsEqual?: Function, // 当pure true , 比较 props 值, 是否和之前相等。 (next: Object, prev: Object) => boolean
  areStatePropsEqual?: Function, // 当pure true , 比较 mapStateToProps 后的值 是否和之前相等。  (next: Object, prev: Object) => boolean
  areMergedPropsEqual?: Function, // 当 pure 为 true 时， 比较 经过 mergeProps 合并后的值 ， 是否与之前等  (next: Object, prev: Object) => boolean
  forwardRef?: boolean, //当为true 时候,可以通过ref 获取被connect包裹的组件实例。
}
```
`mergeProps` 与 `options` 比较少用到，重点关注前两个参数

**示例代码：**

```javascript
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
const mapStateToProps = (state) => ({ count: state.count });
// const mapDispatchToProps = {
//   add: () => ({ type: "ADD" }),
//   minus: () => ({ type: "MINUS" }),
// };
// const mapDispatchToProps = (dispatch) => ({
//   add: () => dispatch({ type: "ADD" }),
//   minus: () => dispatch({ type: "MINUS" }),
// });

const mapDispatchToProps = (dispatch) => {
  let creators = {
    add: () => ({ type: "ADD" }),
    minus: () => ({ type: "MINUS" }),
  };
  creators = bindActionCreators(creators, dispatch);
  return {
    ...creators,
    dispatch,
  };
};

@connect(mapStateToProps, mapDispatchToProps)
class Counter extends Component {
  render() {
    const { count, add, minus } = this.props;
    return (
      <div className="border">
        <h3>加减器</h3>
        <button onClick={add}>add</button>
        <span style={{ marginLeft: "10px", marginRight: "10px" }}>{count}</span>
        <button onClick={minus}>minus</button>
      </div>
    );
  }
}
export default Counter;

```
## useSelector and useDispatch
在函数组件里，除了使用 `connect` 方式接收传递的 state 与 dispatch 信息之外，React-Redux 还提供了两个 hook: `useSelector` 与 `useDispatch`

**useSelector:**
```javascript
const result: any = useSelector(selector: Function, equalityFn?: Function)
```
平时用的更多的是第一个参数，是个函数，参数为 `store` 的 `state`
```javascript
const state = useSelector(({ count }) => ({ count }));
```
返回个对象，`key` 为 `count`，内容就是 `store state` 里的 `count`。
这样通过 `state.count` 就可以获取到

**useDispatch:**
```javascript
const dispatch = useDispatch()
```
执行下 `useDispatch` 就获取到了 `dispatch`，通过 `dispatch` 就可以更改状态

**useStore:**

```javascript
const store = useStore()
```
返回 `store` 对象的引用。尽量不要使用该 `hook`，`useSelector` 才是首选

**示例代码：**
```javascript
import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
export default function ReactReduxHookPage() {
  const state = useSelector(({ count }) => count);
  const dispatch = useDispatch();
  const add = useCallback(() => {
    dispatch({ type: "ADD" });
  }, []);
  return (
    <div>
      <h3>ReactReduxHookPage</h3>
      <p>{state}</p>
      <button onClick={add}>add</button>
    </div>
  );
}
```

# 三、手写 Provide
`provide` 做的事情就是为后代组件提供 store ，这不正是 `React context api` 干的事
首先建一个 context 文件，导出需要用的 context ：

```javascript
import React from "react";

const ReactReduxContext = React.createContext();

export default ReactReduxContext;

```
将 context 应用到 `Provider` 组件里

```javascript
import ReactReduxContext from "./context";
export function Provider({ children, store }) {
  return (
    <ReactReduxContext.Provider value={store}>
      {children}
    </ReactReduxContext.Provider>
  );
}

```
可以看出 Provider 组件代码不难，无非就是将传进来的 `store` 作为 `context` 的 `value` 值，然后直接渲染 `children` 即可

# 四、手写 connect
## 基本功能
上面也讲到 `connect` 是个函数，并且返回个高阶组件，所以它的基本结构为：

```javascript
function connect() {
  return function (WrappedComponent) {
    return function (props) {
      return <WrappedComponent {...props} />;
    };
  };
}
export default connect;
```
罗列个 connect 组件要实现的功能：

 1. 接收传递下来的 `store` 
 2. 如果传递了 `mapStateToProps` 参数，则传入 `state` 执行
 3. 默认将 `dispatch` 注入组件的 `props` 里
 4. 如果传递了 `mapDispatchToProps` 参数并且参数是个**函数**类型，则传入 `dispatch` 执行
 5. 如果传递了 `mapDispatchToProps` 参数并且参数是个**对象**类型，则就要将参数当作 `creators action` 处理
 6. 将处理好的 `stateProps`，`dispatchProps`，以及组件自身的 `props` 一并传入组件

```javascript
import { useContext } from "react";
import ReactReduxContext from "./context";
function connect(mapStateToProps, mapDispatchToProps) {
  return function (WrappedComponent) {
    return function (props) {
      let stateProps = {};
      let dispatchProps = {};
      // 1. 接收传递下来的 store
      const store = useContext(ReactReduxContext);
      const { getState, dispatch } = store;
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
      return <WrappedComponent {...props} {...stateProps} {...dispatchProps} />;
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

```
## 触发组件更新
将官方的 React-Redux 替换为手写的 provider 与 connect，可以正常显示出页面，但会发现点击按钮，页面上的值并没有发生改变
![页面没有更新](https://img-blog.csdnimg.cn/img_convert/7e317df743bb880b89cb02416f4c3ac7.png)
在上一篇 Redux 里讲过，可以用 `store.subscribe` 来监听 `state` 的变化并执行回调。

```javascript
store.subscribe(() => {
	this.forceUpdate()
})
```
由于 `connect` 是个函数组件，那么在函数里是否有类似 `forceUpdate` 的东西呢？
目前官方并未提供，所以只能通过模拟实现：⽤⼀个增⻓的计数器来强制重新渲染

```javascript
const [, forceUpdate] = useReducer(x => x + 1, 0);
function handleClick() {
	forceUpdate();
}
```
在 `connect` 函数里加上如下代码：
```javascript
  const [, forceUpdate] = useReducer(x => x+1, 0)
  // 之所以用 useLayoutEffect 是为了在页面渲染之前就执行，防止操作过快时，采用 useEffect 会有缺失的情况
  const unsubscribe = useLayoutEffect(() => {
    subscribe(()=> {
      forceUpdate()
    })
    return () => {
      if(unsubscribe) {
        unsubscribe()
      }
    }
  }, [store])
```
再次验证:
![功能大体正常](https://img-blog.csdnimg.cn/img_convert/950cf17f9cdc4f0a0872cbd2413eafa5.png)
可以看到点击按钮，页面已经可以即时响应了，那是否已经足够完善呢？不是的，还存在些问题，下面我们边分析边改进
## 检查 props 变化
再添加个 user.js 组件：

```javascript
import React, { Component } from "react";
import { connect } from "../kReactRedux";

@connect(({ user }) => ({
  user,
}))
class User extends Component {
  render() {
    console.info(222); // 方便查看是否会重新渲染
    const { user } = this.props;
    return (
      <div className="border">
        <h3>用户信息</h3>
        {user.name}
      </div>
    );
  }
}
export default User;
```
该组件只依赖 `store` 里的 `user` 信息，但访问该页面，会发现点击 `counter` 组件里的 `add` 按钮，会导致 `user` 组件一并重新渲染
![重新渲染](https://img-blog.csdnimg.cn/img_convert/1868252e64720ba7c5247d981e6c4b39.png)
这也不难理解，因为现有的代码是采用 `subscribe` ，一旦 `store` 状态更改就会触发回调，而回调里做的事情就是强制刷新，而 `user` 组件又是采用 `connect` 包装的，自然也就会重新渲染。所以应该要在触发回调时，判断下当前组件的 `props` 值是否更改，如果更改了才强制刷新。

要检查前后 `props` 的更改，就需要将上次渲染的 `props` 与本次渲染的 `props` 进行比较。而要存储上次渲染的 `props` ，就得采用 [useRef](https://juejin.cn/post/6950464567847682056) 将上次渲染的 `props` 存储下来

```javascript
// 6.组装最终的props
const actualProps = Object.assign({}, props, stateProps, dispatchProps);
// 7.记录上次渲染参数
const lastProps = useRef();
useLayoutEffect(() => {
  lastProps.current = actualProps;
}, []);
```
检测 `props` 是否变化是需要重新计算的，所以将获取最终 `props` 的逻辑抽离出来

```javascript
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
    console.info(stateProps, "stateProps");
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
```

那么要如何比较前后两个 `props` 是否更改呢？ `React-Redux` 里面是采用的 `shallowEqual` ，也就是浅比较

```javascript
// shallowEqual.js 
function is(x, y) {
  if (x === y) {
    // 处理  +0 === -0 // true 的情况
    // 当是 +0 与 -0 时,要返回 false
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    // 处理 NaN !== NaN // true 的情况
    // 当 x 与 y 是 NaN 时,要返回 true
    return x !== x && y !== y;
  }
}

export default function shallowEqual(objA, objB) {
  // 首先对基本数据类型的比较
  // !! 若是同引用便会返回 true
  if (is(objA, objB)) return true;
  // 由于 is() 已经对基本数据类型做一个精确的比较，所以如果不等
  // 那就是object,所以在判断两个数据有一个不是 object 或者 null 之后，就可以返回false了
  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  // 过滤掉基本数据类型之后，就是对对象的比较了
  // 首先拿出 key 值，对 key 的长度进行对比
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // 长度不等直接返回false
  if (keysA.length !== keysB.length) return false;
  // 长度相等的情况下，进行循环比较
  for (let i = 0; i < keysA.length; i++) {
    // 调用 Object.prototype.hasOwnProperty 方法，判断 objB 里是否有 objA 中所有的 key
    // 如果有那就判断两个 key 值所对应的 value 是否相等(采用 is 函数)
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}
```
在 `subscribe` 回调里先获取最新的 `props`，并与上一次的 `props` 进行比较，如果不一样才进行更新，对应的组件就会重新渲染，而如果一样就不调用强制刷新函数，组件也就不会重新渲染。

```javascript
 subscribe(() => {
  const newProps = getProps(store, props);
   if (!shallowEqual(lastProps.current, newProps)) {
     lastProps.current = actualProps;
     forceUpdate();
   }
});
```
**connect 完整代码：**
```javascript
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


```
**验证下：**
![验证](https://img-blog.csdnimg.cn/img_convert/873c87c76f7a62f04ef19840f181b3aa.png)
点击 counter 里的 `add` 按钮，更改的是 `count` 值，由于 counter 组件里的 `mapStateToProps` 函数是跟 `count` 有关的，所以执行完 `getProps` 获取到的 `props` 跟原先的是不一样的；

而 user 组件里 `mapStateToProps` 、`mapDispatchToProps`、原有的 `props` 三者都与 `count` 无关，执行完 `getProps` 获取到的 `props` 是跟原先一样的，所以 user 组件不会重新渲染。

# 五、手写 useSelector 与 useDispatch
**useSelector:**
接收个函数参数，传入 `state` 并执行返回即可。当 `state` 更改时，强制重新执行

```javascript
import ReactReduxContext from "./context";
import { useContext, useReducer, useLayoutEffect } from "reat";
export default function useSelector(selector) {
  const store = useContext(ReactReduxContext);
  const { getState, subscribe } = store;
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const unsubscribe = useLayoutEffect(() => {
    subscribe(() => {
      forceUpdate();
    });
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  return selector(getState());
}

```
**useDispatch：**

返回 dispatch 即可

```javascript
import ReactReduxContext from "./context";
import { useContext } from "reat";
export default function useDispatch() {
  const store = useContext(ReactReduxContext);
  const { dispatch } = store;
  return dispatch;
}

```
# 五、总结

1. `React-Redux` 是连接 `React` 和 `Redux` 的库，同时使用了 `React` 和 `Redux` 的API。
2. `React-Redux` 提供的两个主要 api 是 `Provider` 与 `connect`
3. `Provider` 的作用是接收 `store` 并将它放到 `contextValue` 上传递下去。
4.	`connect` 的作用是从 `store` 中选取需要的属性(包括 `state` 与 `dispatch` )传递给包裹的组件。
5.	`connect` 会自己判断是否需要更新，判断的依据是依赖的 `store state` 是否已经变化了。
