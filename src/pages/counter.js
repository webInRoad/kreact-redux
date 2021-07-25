import React, { Component } from "react";
// import { connect } from "react-redux";
import { connect } from "../kReactRedux";
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
