import ReduxPage from "./pages/redux";
import "./App.css";

function App() {
  return (
    <div className="App">
      <ReduxPage />
    </div>
  );
}

// function f1() {
//   console.info(1);
//   return 1;
// }
// function f2() {
//   console.info(2);
//   return 2;
// }

// function f3() {
//   console.info(3);
//   return 3;
// }

// function compose(...funs) {
//   return funs.reduce((a, b) => {
//     console.info(a, "a"); // (...args) => {return a(b(...args))}
//     console.info(b, "b");
//     return (...args) => {
//       return a(b(...args));
//     };
//   });
// }
// // (...args) => {return a(b(...args))}
// console.info(compose(f1, f2, f3));
// console.info(compose(f1, f2, f3)());
export default App;
