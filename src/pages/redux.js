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
    // store.dispatch({ type: "ADD", payload: 1 });
    store.dispatch(function (dispatch) {
      setTimeout(() => {
        dispatch({ type: "ADD", payload: 2 });
      }, 1000);
    });
  };
  minus = () => {
    store.dispatch({ type: "MINUS", payload: 1 });
  };
  render() {
    return (
      <div className="border">
        <h3>加减器</h3>
        <button onClick={this.add}>add</button>
        <span style={{ marginLeft: "10px", marginRight: "10px" }}>
          {store.getState().count}
        </span>
        <button onClick={this.minus}>minus</button>
      </div>
    );
  }
}
