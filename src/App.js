import CounterPage from "./pages/counter";
import UserPage from "./pages/user";
import ReactReduxHookPage from "./pages/reduxHook";
import "./App.css";

function App() {
  return (
    <div className="App">
      <CounterPage />
      <UserPage />
      {/* <ReactReduxHookPage /> */}
    </div>
  );
}

export default App;
