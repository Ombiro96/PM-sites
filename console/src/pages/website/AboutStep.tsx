import { CheckField, TextAreaField } from "../../components/fields";
import { optionLabel } from "../../lib/labels";
import {
  ABOUT_TEXT_MAX,
  SERVICE_CHOICES,
  type Answers,
  type Audience,
} from "../../lib/website";

export function AboutStep({
  answers,
  audience,
  error,
  onChange,
}: {
  answers: Answers;
  audience: Audience;
  error?: string;
  onChange: (changes: Partial<Answers>) => void;
}) {
  const forOwners = audience !== "tenants";
  return (
    <>
      <TextAreaField
        id="about-text"
        label="What does your company do? (optional)"
        hint="Two or three sentences in your own words. This becomes the About section."
        maxLength={ABOUT_TEXT_MAX}
        value={answers.about_text}
        error={error}
        onChange={(event) => onChange({ about_text: event.target.value })}
      />
      {forOwners ? (
        <>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium">
              What do you do for owners?
            </legend>
            <p className="text-ink-muted mb-1 text-sm">
              Tick at least two to get a Services section.
            </p>
            {SERVICE_CHOICES.map((each) => (
              <CheckField
                key={each}
                label={optionLabel(each)}
                checked={answers.services.includes(each)}
                onChange={(ticked) =>
                  onChange({
                    services: SERVICE_CHOICES.filter((service) =>
                      service === each
                        ? ticked
                        : answers.services.includes(service),
                    ),
                  })
                }
              />
            ))}
          </fieldset>
          <div className="border-line mt-4 rounded-xl border bg-white px-3.5">
            <CheckField
              label="Show how much you manage"
              hint="Your number of buildings and units, taken from your Bomahut account. Off unless you tick this."
              checked={answers.show_figures}
              onChange={(show_figures) => onChange({ show_figures })}
            />
          </div>
        </>
      ) : null}
    </>
  );
}
