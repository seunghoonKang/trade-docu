import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface SessionState {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<User | null>;
}

export const SessionContext = createContext<SessionState>({
  user: null,
  loading: true,
  refreshUser: async () => null,
});

export function useAuth() {
  return useContext(SessionContext);
}
