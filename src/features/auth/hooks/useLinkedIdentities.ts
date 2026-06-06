import { useCallback, useEffect, useState } from "react";
import type { UserIdentity } from "@supabase/supabase-js";
import { reloadLinkedIdentities } from "../api";

export function useLinkedIdentities(userId: string | undefined) {
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const list = await reloadLinkedIdentities();
    setIdentities(list);
    return list;
  }, []);

  useEffect(() => {
    if (!userId) {
      setIdentities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    reload()
      .catch(() => setIdentities([]))
      .finally(() => setLoading(false));
  }, [userId, reload]);

  return { identities, loading, reload };
}
