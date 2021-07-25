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
