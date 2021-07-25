
# 一、什么是 Redux

> A Predictable State Container for JS Apps（JS应用的可预测状态容器）

**可预测：**实际上指的是纯函数（每个相同的输入，都会有固定输出，并且没有副作用）这个是由 reducer 来保证的，同时方便了测试
**状态容器：** 在 web 页面中，每个 DOM 元素都有自己的状态，比如弹出框有显示与隐藏两种状态，列表当前处于第几页，每页显示多少条就是这个列表的状态，存储这些状态的对象就是状态容器。
虽说 Redux 是 React 全家桶的一员，但实际上 Redux 与 React 没有必然联系，它可以应用在任何其他库上，只是跟 React 搭配比较火。
![redux Flow](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/44ca55ee2e554912bee90e83536ed4c7~tplv-k3u1fbpfcp-zoom-1.image)
**Redux 的核心概念：**
 1. Store: 存储状态的容器， JS 对象
 2. React Component: 组件，或者称之为视图
 3. Actions: 对象，描述对状态进行怎样的操作
 4. Reducers:函数，操作状态并返回新的状态

 **Redux 工作流程：**
 1. 组件通过 dispatch 方法触发 Action 
 2. Store 接收 Action 并将 Action 分发给 Reducer
 3. Reducer 根据 Action  类型对状态进行更改并将更改后的状态返回给 Store
 4. 组件订阅了 Store 中的状态，Store 中的状态更新会同步到组件
 
接下来分别讲解下：
## React Components 
就是 React 组件，也就是 UI 层
## Store
管理数据的仓库，对外暴露些 API
```javascript
let store = createStore(reducers);
```
有以下职责：
 - 维持应用的 state； 
 - 提供 `getState()` 方法获取 state； 
 - 提供 `dispatch(action)` 方法更新 state； 
 - 通过 `subscribe(listener)` 注册监听器; 
 - 通过 `subscribe(listener)` 返回的函数注销监听器。
 
## Action
 action 就是个动作，在组件里通过 `dispatch(action)` 来触发 store 里的数据更改
## Reducer
action 只是个指令，告诉 store 要进行怎样的更改，真正更改数据的是 reducer。
reducer 是个纯函数，正因为它是个纯函数，才保证了 Redux 的可预测性。

# 二、为什么要使用 Redux
默认 React 传递数据只能自上而下传递，而下层组件要向上层组件传递数据时，需要上层组件传递修改数据的方法到下层组件，当项目越来越大时，这种传递方式会很杂乱。
而引用了 Redux，由于 Store 是独立于组件，使得数据管理独立于组件，解决了组件间传递数据困难的问题
## 计数器
定义个 store 容器文件，根据 reducer 生成 store
```javascript
import { createStore } from "redux";
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
export default createStore(counterReducer);
```
在组件中

```javascript
import React, { Component } from "react";
import store from "../store";
export default class Redux extends Component {
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

  add = () => {
    store.dispatch({ type: "ADD", payload: 1 });
  };
  minus = () => {
    store.dispatch({ type: "MINUS", payload: 1 });
  };
  render() {
    return (
      <div className="border">
        <h3>累加器</h3>
        <button onClick={this.add}>add</button>
        <span style={{ marginLeft: "10px", marginRight: "10px" }}>
          {store.getState()}
        </span>
        <button onClick={this.minus}>minus</button>
      </div>
    );
  }
}

```
 - 通过 getState 显示 state
 - 点击 add 或 minus 时触发 dispatch 并传递指令(action)
 - 并在 componentDidMount 监听 state 更改，有更改则就 forceUpdate 强制渲染
 - componentWillUnmount 清除监听

![加减器](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac620a66939141d3aaf477fa65d3361a~tplv-k3u1fbpfcp-zoom-1.image)

 1. createStore 创建store
  2. reducer 初始化、修改状态函数
  3. getState 获取状态值
  4. dispatch 提交更新
  5. subscribe 变更订阅
 #	三、开始手写
 上面有讲到 Redux 本身是与 React 没有丝毫联系的，所以我们先不与 React 搭配的写，而单纯只是在 html 里使用
 通过上面的讲解也可以看到，其实主要的就是 createStore 函数，该函数会暴露 getState，dispatch，subScribe 三个函数
 所以先搭下架子，创建 createStore.js 文件
```javascript
export default function createStore(reducer) {
  let currentState;
  // 获取 store 的 state
  function getState() {}
  // 更改 store
  function dispatch() {}
  // 订阅 store 更改
  function subscribe() {}
  return {
    getState,
    dispatch,
    subscribe,
  };
}
```
接着完善下各方法
## getState
返回当前的 state

```javascript
function getState() {
	return currentState
}
```
## dispatch
接收 action，并更新 store，通过谁更新的呢？ reducer

```javascript
  // 更改 store
  function dispatch(action) {
    // 将当前的 state 以及 action 传入 reducer 函数
    // 返回新的 state 存储在 currentState
    currentState = reducer(currentState, action);
  }
```
## subscribe
**作用：** 订阅 state 的更改
**如何做：** 采用[观察者模式](https://juejin.cn/post/6961017766560137230)，组件方监听 subscribe ，并传入回调函数，在 subscribe 里注册回调，并在 dispatch 触发回调
subscribe 里除了注册回调之外，还要返回注销该监听的函数，用于组件注销时取消该监听
```javascript
let curerntListeners = [];
// 订阅 state 更改
function subscribe(listener) {
  curerntListeners.push(listener);
  return () => {
    const index = curerntListeners.indexOf(listener);
    curerntListeners.splice(index, 1);
  };
}
```
dispatch 方法在更新数据之后，要执行订阅事件。

```javascript
  // 更改store
  function dispatch(action) {
    // store里面数据就更新了
    currentState = reducer(currentState, action);

    // 执行订阅事件
    curerntListeners.forEach(listener => listener());
  }
```
## 完整代码
将上面计数器里的 redux 改成引用手写的 redux，会发现页面没有最初值
![初始值](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6cee5353f941458eb8cc2005158eda0a~tplv-k3u1fbpfcp-zoom-1.image)
所以在 createStore 里加上 ` dispatch({ type: "kkk" });` 要注意传入的这个 type 要进入 reducer 函数的 **default** 条件
完整代码如下：

```javascript
export default function createStore(reducer) {
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

```
大家也可以自行查看下 Redux 里的 createStore [源码](https://github.com/reduxjs/redux/blob/master/src/createStore.ts)

# 四、Redux 中间件
说到 Redux，那就不得不提中间件，因为本身 Redux 能做的东西很有限，比如需要 redux-thunk 来达到异步调用，redux-logger 记录日志等。中间件就是个函数，对 store.dispatch 方法进行改造，在发出 Action 和执行 Reducer 这两步之间，添加其他功能，相当于加强 dispatch。

## 开发 Redux 中间件
开发中间件是有模板代码的

```javascript
export default store => next => action => {}
```
 1. 一个中间件接收 store 作为参数，返回一个函数
 2. 返回的这个函数接收 next（老的 dispatch 函数） 作为参数，返回一个新的函数
 3. 返回的新的函数就是加强的 dispatch 函数，在这个函数里可以拿到上面两层传递进来的 store 以及 next

比如模拟写个 logger 中间件

```javascript
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
```
## 注册中间件
```javascript
// 在createStore的时候将applyMiddleware作为第二个参数传进去
const store = createStore(
  reducer,
  applyMiddleware(logger)
)
```
可以看到是通过 createStore 的第二个参数来实现的，这个参数就是 enhancer。

> 实现上 createStore 总共是有三个参数，除了第一个 reducer 参数是必传的之外，第二个 state 初始值，以及第三个 enhancer 都是可选的

下面我们在手写的 createStore 里加入 enhancer
###  支持 enhancer
```javascript
function createStore(reducer,enhancer) {
	// 判断是否存在 enhancer
	// 如果存在并且是个函数, 则将 createStore 传递给它, 不是函数则抛出错误
	// 它会返回个新的 createStore
	// 传入 reducer ,执行新的 createStore，返回 store
	// 返回该 store
	if (typeof enhancer !== 'undefined') {
		if (typeof enhancer !== 'function') {
			throw new Error('enhancer必须是函数')
		}
		return enhancer(createStore)(reducer)
	}
	// 没有 enhancer 走原先的逻辑
	// 省略
}
```

### 手写 applyMiddleware
按上面的分析，applyMiddleware 函数，会接收中间件函数，并返回个 enhancer，所以基本结构为

```javascript
export default function applyMiddleware(...middlewares) {
  // applyMiddleware 的返回值应该是一个 enhancer
  // enhancer 是个接收 createStore 为参数的函数
  return function (createStore) {
    // enhancer 要返回一个新的 createStore
    return function newCreateStore(reducer) {};
  };
}

```
回想下 logger 中间件的结构，完善下 applyMiddleware

```javascript
export default function applyMiddleware(middleware) {
  // applyMiddleware 的返回值应该是一个 enhancer
  // enhancer 是个接收 createStore 为参数的函数
  //
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
      // 传入 store 执行 middleware
      // 得到新的 createStore 函数
      const chain = middleware(midApi);

      // 将原始的 dispatch 函数作为 next 参数传给 chain
      // 返回加强的 dispatch 覆盖最初的 dispatch
      dispatch = chain(dispatch);

      return {
        ...store,
        dispatch,
      };
    };
  };
}

```
**测试：**
是可以正常打印出日志的
![打印日志](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c87f37be9844740abaa86dabfa98dc7~tplv-k3u1fbpfcp-zoom-1.image)
### 支持多个中间件
上面已经在 applyMiddleware 函数里处理只有一个中间件的情况，那多个的场景呢？
首先我们再模拟写个 redux-thunk 中间件
默认 redux 只支持同步，并且参数只能是对象形式，redux-thunk 要实现的是你传入一个函数时，我就直接执行该函数，异步操作代码写在传递过来的函数里，如果传递过来的是个对象，则调用下一个中间件
```javascript
function thunk({ getState, dispatch }) {
  return next => {
    return action => {
      // 如果是个函数，则直接执行，并传入 dispatch 与 getState
      if (typeof action == 'function') {
        return action(dispatch, getState)
      }
      next(action)
    }
  }
}
```

现在要去依次执行各个中间件，要如何依次执行呢？就得采用柯里化，首先写个 compose

```javascript
function compose(...funs) {
	// 没有传递函数时，则返回参数透传函数
	if (funs.length === 0) {
		return (arg) => arg
	}
	// 传递一个函数时，则直接返回该函数，省去了遍历
	if (funs.length === 1) {
		return funs[0]
	}
	// 传递多个时，则采用 reduce,进行合并
	// 比如执行 compose(f1,f2,f3) 则会返回 (...args) => f1(f2(f3(...args)))
	return funs.reduce((a, b) => {
		return (...args) => {
			return a(b(...args))
		}
	})
}
```
applyMiddleware 函数支持多个中间件的代码：

```javascript
export default function applyMiddleware(...middlewares) {
  // applyMiddleware 的返回值应该是一个 enhancer
  // enhancer 是个接收 createStore 为参数的函数
  //
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
```
**验证：**

```javascript
import { createStore } from "../kredux";
import logger from "../kredux/middlewares/logger";
import thunk from "../kredux/middlewares/thunk";
import applyMiddleware from "../kredux/applyMiddleware";

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
export default createStore(counterReducer, applyMiddleware(thunk, logger));

```
并将 add 函数更改成异步触发 dispatch

```javascript
  add = () => {
    // store.dispatch({ type: "ADD", payload: 1 });
    store.dispatch(function (dispatch) {
      setTimeout(() => {
        dispatch({ type: "ADD", payload: 2 });
      }, 1000);
    });
  };
```
![中间件](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1fdacd6ad2354d088531aaf29ac9e7fe~tplv-k3u1fbpfcp-zoom-1.image)
# 五、手写 combineReducers
当业务逻辑复杂时，不可能都写在一个 reducer 里，这时就已经使用 combineReducers 将几个 reducer 组合起来。
再添加个 userReducer

```javascript
const userReducer = (state = { ...initialUser }, { type, payload }) => {
  switch (type) {
    case "SET":
      return { ...state, ...payload };
    default:
      return state;
  }
};
```
引入 combineReducers ，该函数接收个对象，key 为标识，value 为每个 reducer

```javascript
export default createStore(
  combineReducers({ count: counterReducer, user: userReducer }),
  applyMiddleware(thunk, logger)
);
```
根据上面的分析，来手写个 combineReducers ，它要返回个 reducer 函数，reducer 函数自然是要接收 state 跟 action 并返回新的 state

```javascript
export default function combineReducers(reducers) {
  return function reducer(state = {}, action) {
    let nextState = {};
    // 遍历所有的 reducers,并依次触发返回新的 state
    for (let key in reducers) {
      nextState[key] = reducers[key](state[key], action);
    }
    return nextState;
  };
}

```

# 六、总结

 1. Redux 本身就只是个可预测性状态容器，状态的更改都是通过发出 Action 指令，Action 指令会分发给 Reducer ，再由 Reducer 返回新的状态值，组件进行监听，但状态值更改了，就重新渲染。
 2. Redux 是典型的观察者模式，subscribe 时注册回调事件，dispatch action 时执行回调
 3. Redux 重点在于 createStore 函数，该函数会返回三个方法，其中 getState 用于返回当前的 state，subscribe 用于订阅 state 的更改，dispatch 更新 store，并执行回调事件
 4. 默认的 Redux 只支持传入对象，以及只能执行同步，要满足更多的场景就需要采用中间件
 5. 中间件是个模板为`export default store => next => action => {}` 的函数
 6. 注册中间件，就要使用 createStore 的 enhancer
 7. Redux 的中间件是对 dispatch 进行加强，这就是典型的[装饰者模式](https://juejin.cn/post/6962439378266226696)，可以看出 Redux 里到处是设计模式
