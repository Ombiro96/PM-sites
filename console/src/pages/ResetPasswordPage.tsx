import { useState, type FormEvent } from "react";
import { navigate } from "@/lib/router";
import { AuthLayout, TextLink } from "../components/AuthLayout";
import { FormError, PasswordField, SubmitButton } from "../components/fields";
import { PATHS } from "../lib/config";
import { resetPassword, type ResetField } from "../lib/session";
import { passwordError } from "../lib/validation";

const NO_MATCH = "The passwords you have entered do not match";

export function ResetPasswordPage({ token }: { token: string }) {
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [errors, setErrors] = useState<Partial<Record<ResetField, string>>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = {
      newPassword1: passwordError(newPassword1),
      newPassword2: newPassword1 === newPassword2 ? undefined : NO_MATCH,
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setBusy(true);
    try {
      const result = await resetPassword({ token, newPassword1, newPassword2 });
      if (result.ok) navigate(PATHS.login);
      else setErrors(result.errors);
    } catch (failure) {
      setErrors({
        nonFieldErrors:
          failure instanceof Error ? failure.message : String(failure),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      links={
        <>
          <TextLink href={PATHS.login}>Login</TextLink>
          <TextLink href={PATHS.forgotPassword}>Forgot Password</TextLink>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FormError message={errors.nonFieldErrors ?? ""} />
        <PasswordField
          id="new-password"
          label="New password"
          autoComplete="new-password"
          hint="The password should be unique and be at least 8 characters."
          value={newPassword1}
          error={errors.newPassword1}
          onChange={(event) => {
            setNewPassword1(event.target.value);
            setErrors({});
          }}
        />
        <PasswordField
          id="confirm-password"
          label="Confirm password"
          autoComplete="new-password"
          value={newPassword2}
          error={errors.newPassword2}
          onChange={(event) => {
            setNewPassword2(event.target.value);
            setErrors({});
          }}
        />
        <SubmitButton busy={busy}>Reset Password</SubmitButton>
      </form>
    </AuthLayout>
  );
}
