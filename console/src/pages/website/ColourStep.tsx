import { useState } from "react";
import { TextField } from "../../components/fields";
import { BRAND_COLOURS, brandColourError } from "../../lib/website";

export function ColourStep({
  brandColour,
  onChoose,
}: {
  brandColour: string;
  onChoose: (colour: string) => void;
}) {
  const [typed, setTyped] = useState(brandColour);
  const error = typed === brandColour ? undefined : brandColourError(typed);

  const choose = (colour: string) => {
    setTyped(colour);
    if (!brandColourError(colour)) onChoose(colour.toLowerCase());
  };

  return (
    <>
      <fieldset className="mb-6">
        <legend className="mb-2.5 text-sm font-medium">
          Suggested colours
        </legend>
        <div className="grid grid-cols-4 gap-3">
          {BRAND_COLOURS.map(({ name, value }) => (
            <label
              key={value}
              className="has-focus-visible:outline-brand cursor-pointer rounded-xl text-center text-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
            >
              <input
                type="radio"
                name="brand-colour"
                value={value}
                checked={value === brandColour}
                onChange={() => choose(value)}
                className="peer sr-only"
              />
              <span
                className="peer-checked:ring-brand block h-14 rounded-xl ring-offset-2 peer-checked:ring-2"
                style={{ background: value }}
              />
              <span className="text-ink-muted peer-checked:text-ink mt-1.5 block peer-checked:font-semibold">
                {name}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex items-start gap-3">
        <input
          type="color"
          aria-label="Pick your own colour"
          value={brandColour}
          onChange={(event) => choose(event.target.value)}
          className="border-line mt-7 h-12 w-14 shrink-0 cursor-pointer rounded-lg border bg-white p-1"
        />
        <div className="grow">
          <TextField
            id="brand-colour"
            label="Your own colour"
            hint="A colour code such as #1d4e89."
            autoCapitalize="none"
            spellCheck={false}
            maxLength={7}
            value={typed}
            error={error}
            onChange={(event) => choose(event.target.value.trim())}
          />
        </div>
      </div>
    </>
  );
}
