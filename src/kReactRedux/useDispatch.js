import ReactReduxContext from "./context";
import { useContext } from "reat";
export default function useDispatch() {
  const store = useContext(ReactReduxContext);
  const { dispatch } = store;
  return dispatch;
}
