import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { navigate } from "@/lib/router";
import { NETWORK_PROBLEM, onNotSignedIn } from "./api";
import { fetchUser, type User } from "./session";
import { clearToken, readToken, storeToken } from "./token";

export type AuthState =
  | { status: "checking" }
  | { status: "unreachable" }
  | { status: "signed_out"; message?: string }
  | { status: "signed_in"; user: User };

type Auth = {
  state: AuthState;
  accept: (token: string) => Promise<void>;
  signOut: () => void;
  retry: () => void;
};

const AuthContext = createContext<Auth | null>(null);

const SESSION_ENDED = "You were signed out. Sign in again to carry on.";
const NOT_A_MANAGER =
  "This account cannot manage a website. Sign in with your property manager account.";

async function currentState(): Promise<AuthState> {
  if (!readToken()) return { status: "signed_out" };
  try {
    const user = await fetchUser();
    if (user.teamMember) return { status: "signed_in", user };
    clearToken();
    return { status: "signed_out", message: NOT_A_MANAGER };
  } catch (error) {
    if (error instanceof Error && error.message === NETWORK_PROBLEM)
      return { status: "unreachable" };
    clearToken();
    return { status: "signed_out" };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "checking" });

  const check = useCallback(async () => {
    setState({ status: "checking" });
    setState(await currentState());
  }, []);

  useEffect(() => {
    let current = true;
    currentState().then((next) => {
      if (current) setState(next);
    });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    onNotSignedIn(() => {
      clearToken();
      setState({ status: "signed_out", message: SESSION_ENDED });
    });
    return () => onNotSignedIn(null);
  }, []);

  const auth = useMemo<Auth>(
    () => ({
      state,
      accept: async (token) => {
        storeToken(token);
        setState(await currentState());
      },
      signOut: () => {
        clearToken();
        // Leaving on purpose goes home; a session that ran out still lands on sign-in, with its message.
        navigate("/", { replace: true });
        setState({ status: "signed_out" });
      },
      retry: check,
    }),
    [state, check],
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth needs an AuthProvider above it.");
  return auth;
}
