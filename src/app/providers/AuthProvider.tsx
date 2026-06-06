import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/shared/lib/supabase";

interface AuthContext {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContext>({
  user: null,
  loading: true,
  refreshUser: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (sessionData.session) {
      await supabase.auth.refreshSession();
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    const nextUser = data.user ?? null;
    setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
