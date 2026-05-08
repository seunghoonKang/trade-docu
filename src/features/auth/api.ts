import { supabase } from "@/shared/lib/supabase";
import i18n from "@/shared/i18n/config";

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
      },
    },
  });
  if (error) throw error;
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
