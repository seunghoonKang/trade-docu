import { useState } from "react";
import { useTranslation } from "react-i18next";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui";
import { Button } from "@/shared/ui";
import { resendSignupOtp, verifySignupOtp } from "../api";

const OTP_LENGTH = 6;

interface Props {
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function OtpVerifyModal({ email, onSuccess, onClose }: Props) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setVerifying(true);
    try {
      await verifySignupOtp(email, otp);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.verifyFailed"));
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await resendSignupOtp(email);
      setOtp("");
      setInfo(t("auth.codeResent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.resendFailed"));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t("auth.verifyEmailTitle")}</h2>
        <p className="text-base text-gray-700 mb-2 text-center">{t("auth.verifyOtpMessage", { email })}</p>
        <p className="text-sm text-gray-500 mb-4 text-center">{t("auth.verifyEmailSpam")}</p>
        <form onSubmit={handleVerify} className="space-y-4">
          {error && <p className="text-base text-red-500 text-center">{error}</p>}
          {info && <p className="text-base text-green-600 text-center">{info}</p>}
          <div className="flex justify-center">
            <InputOTP
              maxLength={OTP_LENGTH}
              pattern={REGEXP_ONLY_DIGITS}
              value={otp}
              onChange={setOtp}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="submit" disabled={verifying || otp.length < OTP_LENGTH} className="w-full">
            {t("auth.verifyButton")}
          </Button>
          <div className="flex justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-base text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {resending ? t("auth.resending") : t("auth.resendCode")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-base text-gray-500 hover:text-gray-700"
            >
              {t("auth.verifyLater")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
