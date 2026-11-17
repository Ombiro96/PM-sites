import { useId, useState, type FormEvent } from "react";
import { enquiryUrl, postForm } from "@/lib/listings/api";
import {
  hasErrors,
  lengthError,
  nameError,
  phoneError,
  type Errors,
} from "@/lib/forms";
import { useSite } from "@/lib/site/context";
import { Field, fieldProps, Sent, TrapField } from "./Field";

type Name = "name" | "phone" | "message";

/** An enquiry about one house, sent to the backend's listings enquiries endpoint. */
export function EnquiryForm({
  houseId,
  startMessage,
}: {
  houseId: string;
  startMessage: string;
}) {
  const site = useSite();
  const id = useId();
  const [values, setValues] = useState({
    name: "",
    phone: "",
    message: startMessage,
    website: "",
  });
  const [errors, setErrors] = useState<Errors<Name>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [failure, setFailure] = useState("");

  const set = (name: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (state === "sending") return;
    const found: Errors<Name> = {
      name: nameError(values.name),
      phone: phoneError(values.phone),
      message: lengthError(values.message, 2000),
    };
    setErrors(found);
    setFailure("");
    if (hasErrors(found)) return;
    if (site.site.preview) {
      setFailure(
        "This is a preview. The form works once the site is published.",
      );
      return;
    }
    // A filled trap field is a script: it is told the enquiry went, and nothing is sent.
    if (values.website) {
      setState("sent");
      return;
    }

    setState("sending");
    const result = await postForm(enquiryUrl(site.api), {
      unit_type_id: houseId,
      channel: "form",
      name: values.name.trim(),
      phone: values.phone.trim(),
      message: values.message.trim(),
    });
    if (result.ok) {
      setState("sent");
    } else {
      setState("idle");
      setFailure(result.message);
    }
  }

  if (state === "sent") {
    return (
      <Sent title="Enquiry sent">
        Thank you. {site.facts.name} has your details and will get back to you.
      </Sent>
    );
  }

  const input = (name: Name) => ({
    ...fieldProps(`${id}-${name}`, errors[name]),
    value: values[name],
    onChange: (event: { target: { value: string } }) =>
      set(name)(event.target.value),
  });

  return (
    <form onSubmit={submit} noValidate>
      <b>Send an enquiry</b>
      <Field id={`${id}-name`} label="Your name" error={errors.name}>
        <input {...input("name")} type="text" autoComplete="name" required />
      </Field>
      <Field id={`${id}-phone`} label="Phone number" error={errors.phone}>
        <input
          {...input("phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
        />
      </Field>
      <Field
        id={`${id}-message`}
        label="Message"
        optional
        error={errors.message}
      >
        <textarea {...input("message")} rows={4} />
      </Field>
      <TrapField value={values.website} onChange={set("website")} />
      {failure ? (
        <p className="form-err" role="alert">
          {failure}
        </p>
      ) : null}
      <button type="submit" className="btn" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
