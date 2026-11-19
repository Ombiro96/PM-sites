import { useMemo, useRef, useState, type FormEvent } from "react";
import { AuthLayout, TextLink } from "../components/AuthLayout";
import {
  FormError,
  PasswordField,
  PhoneField,
  SubmitButton,
  TextField,
} from "../components/fields";
import { SitePreview } from "../components/SitePreview";
import { useAuth } from "../lib/auth";
import { API_BASE, PATHS } from "../lib/config";
import { LOOK_DETAILS } from "../lib/looks";
import { triedSite } from "../lib/preview";
import { signUp, usernameAvailable } from "../lib/session";
import { registrationSource, takeTrackingCookies } from "../lib/tracking";
import {
  emailError,
  formatPhone,
  normalizeUsername,
  passwordError,
  phoneError,
  usernameError,
} from "../lib/validation";
import { BRAND_COLOURS, parseWebsite, readTried } from "../lib/website";

/**
 * The website this account is about to get: what was tried on the landing
 * page, or the theme setup starts on. Never a random one, so setup keeps the promise.
 */
function NextWebsite() {
  const { tried, site } = useMemo(() => {
    const tried = readTried();
    const { look, brandColour } = parseWebsite(null);
    return {
      tried,
      site: triedSite(tried ?? { look, brandColour, name: "" }),
    };
  }, []);
  const look = LOOK_DETAILS[site.site.look].name;
  const colour =
    BRAND_COLOURS.find((each) => each.value === site.site.brand_colour)?.name ??
    "your colour";

  return (
    <figure>
      <div className="border-line overflow-hidden rounded-2xl border shadow-2xl shadow-black/10">
        <SitePreview
          site={site}
          title="Your website"
          width={1280}
          height={860}
        />
      </div>
      <figcaption className="mt-5">
        <p className="text-lg font-semibold tracking-tight">
          {tried?.name
            ? `Your ${tried.name} website is one step away.`
            : "Your website is one step away."}
        </p>
        <p className="text-ink-muted mt-1">
          {tried
            ? `${look} theme in ${colour}. Create your account and we write the first draft.`
            : "Create your account, choose a theme and we write the first draft. Nothing is public until you publish."}
        </p>
      </figcaption>
    </figure>
  );
}

type Field = "username" | "email" | "phone" | "password";
type Errors = Partial<Record<Field, string>>;

const USERNAME_TAKEN = "The username you have entered already exists";

export function RegisterPage() {
  const { accept } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const takenUsernames = useRef(new Set<string>());
  const latestUsername = useRef("");

  const setError = (field: Field, error: string | undefined) =>
    setErrors((current) => ({ ...current, [field]: error }));

  const number = phone.slice(dialCode.length);

  const usernameProblem = (value: string) =>
    usernameError(value) ??
    (takenUsernames.current.has(normalizeUsername(value))
      ? USERNAME_TAKEN
      : undefined);

  const checkUsername = async () => {
    const wanted = normalizeUsername(username);
    if (usernameProblem(username)) {
      setError("username", usernameProblem(username));
      return;
    }
    try {
      if (!(await usernameAvailable(wanted)))
        takenUsernames.current.add(wanted);
    } catch {
      // The sign-up itself still refuses a taken username.
    }
    if (normalizeUsername(latestUsername.current) === wanted)
      setError("username", usernameProblem(wanted));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {
      username: usernameProblem(username),
      email: emailError(email),
      phone: phoneError(dialCode, number),
      password: passwordError(password),
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setBusy(true);
    setProblem("");
    try {
      const result = await signUp({
        username: normalizeUsername(username),
        email: email.trim(),
        phoneNumber: formatPhone(dialCode, number),
        password,
        registrationSource: registrationSource(window.location.search),
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
      title="Create Account"
      aside={<NextWebsite />}
      links={
        <>
          <TextLink href={PATHS.forgotPassword}>Forgot Password</TextLink>
          <TextLink href={`${PATHS.login}${window.location.search}`}>
            Login
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
          error={errors.username}
          onChange={(event) => {
            setUsername(event.target.value);
            latestUsername.current = event.target.value;
            setError("username", undefined);
          }}
          onBlur={checkUsername}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("email", undefined);
          }}
          onBlur={() => setError("email", emailError(email))}
        />
        <PhoneField
          id="phone"
          label="Phone number"
          hint="The phone number should be in international format: country code then phone number."
          value={phone}
          error={errors.phone}
          onChange={(value, code) => {
            setPhone(value);
            setDialCode(code);
            setError("phone", undefined);
          }}
          onBlur={() =>
            number.trim() !== "" &&
            setError("phone", phoneError(dialCode, number))
          }
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          value={password}
          error={errors.password}
          hint="The password should be unique and be at least 8 characters."
          onChange={(event) => {
            setPassword(event.target.value);
            setError("password", undefined);
          }}
          onBlur={() => setError("password", passwordError(password))}
        />
        <label className="mb-5 flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            className="accent-brand mt-0.5 size-4"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            I agree to the{" "}
            <TextLink href={`${API_BASE}/termsofservice`} external>
              Terms and Conditions
            </TextLink>{" "}
            and{" "}
            <TextLink href={`${API_BASE}/privacypolicy`} external>
              Privacy Policy
            </TextLink>{" "}
            of BOMAHUT
          </span>
        </label>
        <SubmitButton busy={busy} disabled={!agreed}>
          Create Account
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
