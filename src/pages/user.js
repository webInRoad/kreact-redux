import React, { Component } from "react";
import { connect } from "../kReactRedux";

@connect(({ user }) => ({
  user,
}))
class User extends Component {
  render() {
    console.info(222);
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
