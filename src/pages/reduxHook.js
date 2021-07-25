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
