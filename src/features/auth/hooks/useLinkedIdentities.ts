import { useCallback, useEffect, useRef, useState } from "react";
import type { User, UserIdentity } from "@supabase/supabase-js";
import { reloadLinkedIdentities } from "../api";

function getIdentityKey(user: User | null | undefined) {
  return user?.identities?.map((identity) => identity.provider).sort().join(",") ?? "";
}

export function useLinkedIdentities(user: User | null | undefined) {
  const userId = user?.id;
  const identityKey = getIdentityKey(user);
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedForUserRef = useRef<string | null>(null);

  const reload = useCallback(async () => {
    const list = await reloadLinkedIdentities();
    setIdentities(list);
    return list;
  }, []);

  useEffect(() => {
    if (!userId) {
      setIdentities([]);
      setLoading(false);
      loadedForUserRef.current = null;
      return;
    }

    let cancelled = false;
    const showLoading = loadedForUserRef.current !== userId;

    if (showLoading) {
      setLoading(true);
    }

    reload()
      .then(() => {
        if (!cancelled) loadedForUserRef.current = userId;
      })
      .catch(() => {
        if (!cancelled) setIdentities([]);
      })
      .finally(() => {
        if (!cancelled && showLoading) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, identityKey, reload]);

  return { identities, loading, reload };
}
