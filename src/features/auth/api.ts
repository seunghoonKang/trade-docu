import { supabase } from "@/shared/lib/supabase";
import i18n from "@/shared/i18n/config";
import { upsertSeller } from "@/features/seller-management";
import type { LinkableOAuthProvider } from "./lib/profile";

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

interface SignupParams {
  email: string;
  password: string;
  name: string;
  company?: string;
}

export async function signup({ email, password, name, company }: SignupParams) {
  const lang = i18n.language.split("-")[0];
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        lang,
        name,
        company: company || null,
        agreed_at: new Date().toISOString(),
        profile_complete: true,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function completeOAuthProfile(name: string) {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      name,
      profile_complete: true,
      agreed_at: new Date().toISOString(),
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("User not found");

  const emptyBank = {
    bankName: "",
    bankSwift: "",
    accountNo: "",
    accountee: "",
    bankAddress: "",
    bankTel: "",
    bankFax: "",
  };
  await upsertSeller(
    data.user.id,
    { companyName: "", address: "", tel: "", fax: "", representative: name },
    emptyBank,
  );
  return data;
}

export async function verifySignupOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
  if (error) throw error;
  return data;
}

export async function resendSignupOtp(email: string) {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
}

export async function loginWithKakao() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
}

export async function linkOAuthProvider(provider: LinkableOAuthProvider) {
  const redirectTo = `${window.location.origin}/profile?linking=${provider}`;
  const { error } = await supabase.auth.linkIdentity({
    provider,
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function fetchUserIdentities() {
  const { data, error } = await supabase.auth.getUserIdentities();
  if (error) throw error;
  return data.identities;
}

export async function refreshAuthSession() {
  const { error } = await supabase.auth.refreshSession();
  if (error) throw error;
}

export async function reloadLinkedIdentities() {
  return fetchUserIdentities();
}

export async function unlinkOAuthProvider(provider: LinkableOAuthProvider) {
  const { data, error } = await supabase.auth.getUserIdentities();
  if (error) throw error;

  if (data.identities.length < 2) {
    throw { code: "last_identity_unlink" };
  }

  const identity = data.identities.find((item) => item.provider === provider);
  if (!identity) {
    throw { code: "identity_not_found" };
  }

  const { error: unlinkError } = await supabase.auth.unlinkIdentity(identity);
  if (unlinkError) throw unlinkError;

  await refreshAuthSession();
  return fetchUserIdentities();
}
