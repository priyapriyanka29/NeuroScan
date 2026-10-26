import { createContext, useContext } from "react";

/** Application-wide state: backend health, analysis results, history, toasts. */
export const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return ctx;
}
