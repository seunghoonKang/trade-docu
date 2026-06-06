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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      const shouldRefreshFromServer =
        event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED";

      if (shouldRefreshFromServer) {
        // Must stay synchronous — async callbacks block Supabase getSession().
        void supabase.auth.getUser().then(({ data, error }) => {
          setUser(error ? session.user : (data.user ?? session.user));
        });
        return;
      }

      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
