import { useContext, useId, useState, type FormEvent } from "react";
import { leadsUrl, postForm } from "@/lib/listings/api";
import {
  hasErrors,
  lengthError,
  nameError,
  phoneError,
  unitCountError,
  type Errors,
} from "@/lib/forms";
import { PageKindContext, useSite } from "@/lib/site/context";
import { Field, fieldProps, Sent, TrapField } from "./Field";

const WHO = [
  ["looking_for_house", "Looking for a house"],
  ["tenant", "A tenant of yours"],
  ["owner", "An owner looking for a manager"],
  ["other", "Something else"],
] as const;

type Kind = "management_request" | "message";
type Name = "name" | "phone" | "building_location" | "unit_count" | "message";

const MESSAGE_LIMIT = 1000;

/**
 * The two forms that are not about one house: an owner asking the manager to
 * take on a building, and a general message. Both are saved as leads.
 */
export function LeadForm({ kind }: { kind: Kind }) {
  const site = useSite();
  const page = useContext(PageKindContext);
  const id = useId();
  const [values, setValues] = useState({
    name: "",
    phone: "",
    who: "looking_for_house",
    building_location: "",
    unit_count: "",
    message: "",
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
      building_location: lengthError(values.building_location, 200, "this"),
      unit_count:
        kind === "management_request"
          ? unitCountError(values.unit_count)
          : undefined,
      message: lengthError(values.message, MESSAGE_LIMIT),
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

    setState("sending");
    const management = kind === "management_request";
    const result = await postForm(leadsUrl(site.api, site.site.id), {
      kind,
      name: values.name.trim(),
      phone: values.phone.trim(),
      who: management ? "" : values.who,
      building_location: management ? values.building_location.trim() : "",
      unit_count:
        management && values.unit_count.trim()
          ? Number(values.unit_count)
          : null,
      message: values.message.trim(),
      page,
      website: values.website,
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
      <div className="formcard">
        <Sent title={kind === "message" ? "Message sent" : "Request sent"}>
          Thank you. {site.facts.name} has received your details.
        </Sent>
      </div>
    );
  }

  const input = (name: Name) => ({
    ...fieldProps(`${id}-${name}`, errors[name]),
    value: values[name],
    onChange: (event: { target: { value: string } }) =>
      set(name)(event.target.value),
  });

  return (
    <form className="formcard" onSubmit={submit} noValidate>
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
      {kind === "management_request" ? (
        <>
          <Field
            id={`${id}-building_location`}
            label="Where is the building?"
            optional
            error={errors.building_location}
          >
            <input {...input("building_location")} type="text" />
          </Field>
          <Field
            id={`${id}-unit_count`}
            label="Number of units"
            optional
            error={errors.unit_count}
          >
            <input {...input("unit_count")} type="text" inputMode="numeric" />
          </Field>
        </>
      ) : (
        <>
          <Field id={`${id}-who`} label="I am">
            <select
              id={`${id}-who`}
              value={values.who}
              onChange={(event) => set("who")(event.target.value)}
            >
              {WHO.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id={`${id}-message`}
            label="Message"
            optional
            error={errors.message}
          >
            <textarea {...input("message")} rows={4} />
          </Field>
        </>
      )}
      <TrapField value={values.website} onChange={set("website")} />
      {failure ? (
        <p className="form-err" role="alert">
          {failure}
        </p>
      ) : null}
      <button type="submit" className="btn" disabled={state === "sending"}>
        {state === "sending"
          ? "Sending…"
          : kind === "message"
            ? "Send message"
            : "Request a proposal"}
      </button>
    </form>
  );
}
