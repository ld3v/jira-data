import { useReducer } from "react";

const useStates = <T extends Record<string, any>>(initialStates: T) => {
  return useReducer((p: T, a: Partial<T>) => ({ ...p, ...a }), initialStates);
};

export default useStates;
