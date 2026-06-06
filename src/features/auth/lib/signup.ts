import type { Session, User } from "@supabase/supabase-js";

type SignupData = { user: User | null; session: Session | null };

/** Supabase returns an empty identities array when the email is already registered (e.g. via OAuth). */
export function isSignupForExistingAccount(data: SignupData): boolean {
  return data.user !== null && (data.user.identities?.length ?? 0) === 0;
}
