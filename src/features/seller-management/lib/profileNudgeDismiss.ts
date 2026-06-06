const KEY_PREFIX = "trade-docu:profile-nudge-dismissed:";

export function isProfileNudgeDismissed(userId: string): boolean {
  return localStorage.getItem(`${KEY_PREFIX}${userId}`) === "1";
}

export function dismissProfileNudge(userId: string): void {
  localStorage.setItem(`${KEY_PREFIX}${userId}`, "1");
}
