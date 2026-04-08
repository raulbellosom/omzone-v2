import { createContext, useState, useEffect, useCallback } from "react";
import { account, ID, functions } from "@/lib/appwrite";
import { ROLES } from "@/constants/roles";

const VERIFY_URL = `${window.location.origin}/verify-email`;
const RECOVERY_URL = `${window.location.origin}/reset-password`;

export const AuthContext = createContext(null);

function getLandingRoute(labels = []) {
  if (labels.includes(ROLES.ROOT) || labels.includes(ROLES.ADMIN))
    return "/admin";
  if (labels.includes(ROLES.OPERATOR)) return "/admin";
  if (labels.includes(ROLES.CLIENT)) return "/portal";
  return "/";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    try {
      const authUser = await account.get();
      setUser(authUser);
      setLabels(authUser.labels ?? []);
      return authUser;
    } catch {
      setUser(null);
      setLabels([]);
      return null;
    }
  }, []);

  useEffect(() => {
    hydrateUser().finally(() => setLoading(false));
  }, [hydrateUser]);

  async function login(email, password) {
    await account.createEmailPasswordSession(email, password);
    const authUser = await account.get();

    // Block unverified users — destroy session, signal caller
    if (!authUser.emailVerification) {
      // Send a fresh verification email while we still have a session
      try {
        await account.createVerification(VERIFY_URL);
      } catch {
        /* verification email may already be pending */
      }
      await account.deleteSession("current");
      setUser(null);
      setLabels([]);
      const err = new Error("Email not verified");
      err.type = "email_not_verified";
      err.email = email;
      throw err;
    }

    setUser(authUser);
    setLabels(authUser.labels ?? []);

    // Ensure user_profiles document exists (best-effort, non-blocking)
    functions
      .createExecution(
        "assign-user-label",
        JSON.stringify({ action: "ensure-profile" }),
        false,
        "/",
        "POST",
      )
      .catch(() => {
        /* profile may already exist or function temporarily unavailable */
      });

    return authUser;
  }

  async function register(name, email, password, phone) {
    // 1. Create account (optionally with phone)
    await account.create(ID.unique(), email, password, name);

    // 2. Temporary session to send verification email
    await account.createEmailPasswordSession(email, password);

    // 3. If phone provided, update it on the account
    if (phone) {
      try {
        await account.updatePhone(phone, password);
      } catch {
        /* phone update is best-effort */
      }
    }

    // 4. Send verification email
    let verificationSent = true;
    try {
      await account.createVerification(VERIFY_URL);
    } catch {
      verificationSent = false;
    }

    // 5. Destroy session — user must verify before accessing the platform
    await account.deleteSession("current");
    setUser(null);
    setLabels([]);

    return { verificationSent };
  }

  async function resendVerification() {
    // Caller must ensure there's an active session or handle the error
    await account.createVerification(VERIFY_URL);
  }

  async function resendVerificationWithCredentials(email, password) {
    // Create a temporary session, send verification, destroy session
    await account.createEmailPasswordSession(email, password);
    try {
      await account.createVerification(VERIFY_URL);
    } finally {
      await account.deleteSession("current").catch(() => {});
    }
  }

  async function logout() {
    try {
      await account.deleteSession("current");
    } catch {
      /* silent — session may already be expired */
    }
    setUser(null);
    setLabels([]);
  }

  async function changePassword(oldPassword, newPassword) {
    await account.updatePassword(newPassword, oldPassword);
  }

  async function requestPasswordRecovery(email) {
    await account.createRecovery(email, RECOVERY_URL);
  }

  async function confirmPasswordRecovery(userId, secret, newPassword) {
    await account.updateRecovery(userId, secret, newPassword);
  }

  function hasLabel(label) {
    return labels.includes(label);
  }

  const isAdmin = hasLabel(ROLES.ADMIN) || hasLabel(ROLES.ROOT);
  const isClient = hasLabel(ROLES.CLIENT);
  const isOperator = hasLabel(ROLES.OPERATOR);
  const isRoot = hasLabel(ROLES.ROOT);

  return (
    <AuthContext.Provider
      value={{
        user,
        labels,
        loading,
        login,
        register,
        logout,
        resendVerification,
        resendVerificationWithCredentials,
        changePassword,
        requestPasswordRecovery,
        confirmPasswordRecovery,
        hasLabel,
        isAdmin,
        isClient,
        isOperator,
        isRoot,
        getLandingRoute: () => getLandingRoute(labels),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
