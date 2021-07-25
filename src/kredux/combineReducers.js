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
