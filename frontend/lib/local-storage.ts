export const STORAGE_KEYS = {
  onboarding: "onboarding-profile",
  securityPhone: "security.phone",
  balanceAmount: "balance.amount",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const buildNamespacedKey = (key: StorageKey, userId?: string | null) =>
  userId ? `${key}:${userId}` : key;

export const readNamespacedItem = (key: StorageKey, userId?: string | null) => {
  if (typeof window === "undefined") return null;

  const namespacedKey = buildNamespacedKey(key, userId);
  const direct = window.localStorage.getItem(namespacedKey);
  if (direct !== null) {
    return { key: namespacedKey, value: direct };
  }

  if (userId) {
    const fallback = window.localStorage.getItem(key);
    if (fallback !== null) {
      return { key, value: fallback };
    }
  }

  return null;
};

export const writeNamespacedItem = (
  key: StorageKey,
  value: string,
  userId?: string | null
) => {
  if (typeof window === "undefined") return;

  const namespacedKey = buildNamespacedKey(key, userId);
  window.localStorage.setItem(namespacedKey, value);

  if (userId) {
    window.localStorage.removeItem(key);
  }
};

export const removeNamespacedItem = (key: StorageKey, userId?: string | null) => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(buildNamespacedKey(key, userId));

  if (userId) {
    window.localStorage.removeItem(key);
  }
};
