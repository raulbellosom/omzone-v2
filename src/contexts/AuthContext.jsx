import { createContext, useState, useEffect, useCallback } from "react";
import { account, ID } from "@/lib/appwrite";
import { ROLES } from "@/constants/roles";

const VERIFY_URL = `${window.location.origin}/verify-email`;

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
    await account.createVerification(VERIFY_URL);

    // 5. Destroy session — user must verify before accessing the platform
    await account.deleteSession("current");
    setUser(null);
    setLabels([]);
  }

  async function resendVerification() {
    // Caller must ensure there's an active session or handle the error
    await account.createVerification(VERIFY_URL);
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
