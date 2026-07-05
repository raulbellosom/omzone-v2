/**
 * Maps a caught error (Appwrite exception, network failure, or generic Error)
 * to a friendly, translated message. Never surfaces the raw err.message to the UI —
 * raw SDK/browser error text is untranslated and often too technical for end users.
 *
 * @param {unknown} err
 * @param {(key: string) => string} t - translate function from useLanguage()
 * @param {string} fallbackKey - i18n key to use when the error doesn't match a known case
 */
export function getErrorMessage(err, t, fallbackKey = "common.errorLoadFailed") {
  const code = err?.code;
  const message = err?.message || "";

  if (code === 404 || /not found/i.test(message)) return t("common.errorNotFound");
  if (code === 401 || code === 403) return t("common.errorUnauthorized");
  if (code === 429) return t("common.errorRateLimit");
  if (err instanceof TypeError || /network|fetch/i.test(message)) {
    return t("common.errorNetwork");
  }
  return t(fallbackKey);
}
