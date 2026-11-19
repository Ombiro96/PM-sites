import { useEffect, useSyncExternalStore } from "react";
import { locationKey, navigate, subscribe } from "@/lib/router";
import { useAuth } from "./lib/auth";
import { PATHS } from "./lib/config";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SiteGate } from "./pages/SiteGate";

function Notice({
  children,
  onRetry,
}: {
  children: string;
  onRetry?: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-ink-muted">{children}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-brand font-medium hover:underline"
        >
          Try again
        </button>
      ) : null}
    </main>
  );
}

export function App() {
  useSyncExternalStore(subscribe, locationKey);
  const { state, retry } = useAuth();
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  const signedOutPaths: string[] = [
    "/",
    PATHS.login,
    PATHS.register,
    PATHS.forgotPassword,
  ];
  // The emailed link works whether or not this browser is signed in.
  const resetToken = path.startsWith(`${PATHS.resetPassword}/`)
    ? path.slice(PATHS.resetPassword.length + 1)
    : "";
  let wanted = path;
  if (resetToken === "") {
    const inSetup = path === PATHS.setup || path.startsWith(`${PATHS.setup}/`);
    if (
      state.status === "signed_in" &&
      !path.startsWith(`${PATHS.website}/`) &&
      !inSetup
    )
      wanted = `${PATHS.website}/pages`;
    if (state.status === "signed_out" && !signedOutPaths.includes(path))
      wanted = PATHS.login;
  }

  useEffect(() => {
    if (wanted !== path)
      navigate(`${wanted}${window.location.search}`, { replace: true });
  }, [wanted, path]);

  if (resetToken !== "") return <ResetPasswordPage token={resetToken} />;
  if (state.status === "checking") return <Notice>Loading…</Notice>;
  if (state.status === "unreachable")
    return (
      <Notice onRetry={retry}>
        We could not reach Bomahut. Check your connection.
      </Notice>
    );
  if (wanted !== path) return null;
  if (state.status === "signed_in") return <SiteGate user={state.user} />;
  if (path === PATHS.register) return <RegisterPage />;
  if (path === PATHS.forgotPassword) return <ForgotPasswordPage />;
  if (path === "/") return <LandingPage />;
  return <LoginPage />;
}
