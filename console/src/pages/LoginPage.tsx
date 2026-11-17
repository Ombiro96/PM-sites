import { useState, type FormEvent } from "react";
import { AuthLayout, TextLink } from "../components/AuthLayout";
import {
  FormError,
  PasswordField,
  SubmitButton,
  TextField,
} from "../components/fields";
import { useAuth } from "../lib/auth";
import { PATHS } from "../lib/config";
import { signIn } from "../lib/session";
import { takeTrackingCookies } from "../lib/tracking";
import { normalizeUsername } from "../lib/validation";

export function LoginPage() {
  const { accept } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (username.trim() === "" || password === "") {
      setProblem("Please fill in all required details");
      return;
    }
    setBusy(true);
    setProblem("");
    try {
      const result = await signIn({
        username: normalizeUsername(username),
        password,
        trackingCookies: takeTrackingCookies(),
      });
      if (result.ok) await accept(result.token);
      else setProblem(result.message);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      links={
        <>
          <TextLink href={PATHS.forgotPassword}>Forgot Password</TextLink>
          <TextLink href={`${PATHS.register}${window.location.search}`}>
            Register
          </TextLink>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FormError message={problem} />
        <TextField
          id="username"
          label="Username"
          autoComplete="username"
          autoCapitalize="none"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <SubmitButton busy={busy}>Sign In</SubmitButton>
      </form>
    </AuthLayout>
  );
}
