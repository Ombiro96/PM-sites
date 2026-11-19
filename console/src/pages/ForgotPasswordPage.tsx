import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthLayout, TextLink } from "../components/AuthLayout";
import { NextWebsite } from "../components/NextWebsite";
import { FormError, SubmitButton, TextField } from "../components/fields";
import { PATHS } from "../lib/config";
import { sendPasswordReset } from "../lib/session";
import { normalizeUsername } from "../lib/validation";

const SENT = "A password reset link has been sent to your email. Thank you";

export function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string>();
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setProblem("");
    if (username.trim() === "") {
      setError("Please enter your username");
      return;
    }
    setBusy(true);
    try {
      const result = await sendPasswordReset(normalizeUsername(username));
      if (result.ok) toast.success(SENT);
      else setProblem(result.message);
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      aside={<NextWebsite signingIn />}
      links={
        <>
          <TextLink href={PATHS.login}>Login</TextLink>
          <TextLink href={PATHS.register}>Register</TextLink>
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
          error={error}
          onChange={(event) => {
            setUsername(event.target.value);
            setError(undefined);
          }}
        />
        <SubmitButton busy={busy}>Reset Password</SubmitButton>
      </form>
    </AuthLayout>
  );
}
