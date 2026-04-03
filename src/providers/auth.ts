/**
 * Refine AuthProvider implementation.
 *
 * This bridges:
 * - Refine's auth contract (`check`, `login`, `register`, ...)
 * - our Better-Auth client (`authClient`)
 * - session cookie authentication (via `credentials: "include"` in the data provider)
 *
 * For a smoother UX, we prefer `localStorage.user` but fall back to fetching the
 * active user from the backend session when local storage is missing.
 */
import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";

/**
 * Best-effort user cache for immediate render.
 * If parsing fails (or in SSR), we return `null` and let `check()` fall back.
 */
const parseUserFromLocalStorage = (): User | null => {
  if (globalThis.window === undefined) return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

/**
 * Query the backend session cookie to recover the authenticated user.
 * Useful when localStorage is cleared but cookies are still valid.
 */
const getUserFromBackendSession = async (): Promise<User | null> => {
  if (globalThis.window === undefined) return null;
  try {
    const session = await authClient.getSession();
    // better-auth client typically returns `{ data: { user } }` when authenticated.
    const sessionUser = (session as any)?.data?.user;
    return (sessionUser ?? null) as User | null;
  } catch {
    return null;
  }
};

export const authProvider: AuthProvider = {
  register: async ({
    email,
    password,
    name,
    role,
    image,
    imageCldPubId,
  }: SignUpPayload) => {
    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        image,
        role,
        imageCldPubId,
      } as SignUpPayload);

      if (error) {
        return {
          success: false,
          error: {
            name: "Registration failed",
            message:
              error?.message || "Unable to create account. Please try again.",
          },
        };
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.user));

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: {
          name: "Registration failed",
          message: "Unable to create account. Please try again.",
        },
      };
    }
  },
  login: async ({ email, password }) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login error from auth client:", error);
        return {
          success: false,
          error: {
            name: "Login failed",
            message: error?.message || "Please try again later.",
          },
        };
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.user));

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("Login exception:", error);
      return {
        success: false,
        error: {
          name: "Login failed",
          message: "Please try again later.",
        },
      };
    }
  },
  forgotPassword: async ({ email }: { email: string }) => {
    try {
      // better-auth exposes password reset endpoints as `requestPasswordReset.*`
      // depending on enabled plugins/strategies. Use runtime checks to be safe.
      const client = authClient as any;
      const requestPasswordReset = client?.requestPasswordReset;

      if (!requestPasswordReset) {
        return {
          success: false,
          error: {
            name: "Forgot password not supported",
            message: "Password reset is not enabled in the auth client.",
          },
        };
      }

      // Better-Auth server route is `/request-password-reset` (no `/email` suffix).
      // Some clients expose `requestPasswordReset.email(...)`, but that maps to a
      // different path; always hit the base endpoint to match our backend.
      const result = await requestPasswordReset({ email });

      const error = result?.error;

      if (error) {
        return {
          success: false,
          error: {
            name: "Forgot password failed",
            message: error?.message || "Unable to send reset instructions.",
          },
        };
      }

      // Most better-auth reset flows just return success and email a token/link.
      // We only need to return a successful AuthActionResponse for Refine UI.
      return {
        success: true,
        redirectTo: undefined,
      };
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        error: {
          name: "Forgot password failed",
          message: error?.message || "Unable to send reset instructions.",
        },
      };
    }
  },
  logout: async () => {
    const { error } = await authClient.signOut();

    if (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: {
          name: "Logout failed",
          message: "Unable to log out. Please try again.",
        },
      };
    }

    localStorage.removeItem("user");

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
  check: async () => {
    const storedUser = parseUserFromLocalStorage();
    if (storedUser) return { authenticated: true };

    // Fallback: if cookies are valid but localStorage is missing,
    // fetch the user from the backend session.
    const sessionUser = await getUserFromBackendSession();
    if (sessionUser) {
      localStorage.setItem("user", JSON.stringify(sessionUser));
      return { authenticated: true };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
      error: {
        name: "Unauthorized",
        message: "Check failed",
      },
    };
  },
  getPermissions: async () => {
    const storedUser = parseUserFromLocalStorage();
    const parsedUser = storedUser ?? (await getUserFromBackendSession());

    if (!parsedUser) return null;

    return {
      role: parsedUser.role,
    };
  },
  getIdentity: async () => {
    const storedUser = parseUserFromLocalStorage();
    const parsedUser = storedUser ?? (await getUserFromBackendSession());

    if (!parsedUser) return null;

    return {
      id: parsedUser.id,
      name: parsedUser.name,
      email: parsedUser.email,
      image: parsedUser.image,
      role: parsedUser.role,
      imageCldPubId: parsedUser.imageCldPubId,
    };
  },
};
