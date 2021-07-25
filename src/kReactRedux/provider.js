import ReactReduxContext from "./context";
export default function Provider({ children, store }) {
  return (
    <ReactReduxContext.Provider value={store}>
      {children}
    </ReactReduxContext.Provider>
  );
}
