"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm, type ContactFormState } from "@/app/contact/actions";
import { site } from "@/content/site";

const initialState: ContactFormState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  const { submitLabel, sendingLabel } = site.contact.form;
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center rounded-[12px] bg-dark px-8 font-caption text-[13px] font-bold uppercase tracking-[1px] text-dark-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? sendingLabel : submitLabel}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const f = site.contact.form;

  if (state.ok) {
    return (
      <div className="rounded-[16px] border border-rule bg-card/40 p-8 text-center">
        <div className="font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink">
          {f.successTitle}
        </div>
        <p className="mt-2 text-[0.95rem] leading-[1.5rem] text-body">
          {f.successBody}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field
          id="name"
          label={f.nameLabel}
          placeholder={f.namePlaceholder}
          required
        />
        <Field
          id="email"
          type="email"
          label={f.emailLabel}
          placeholder={f.emailPlaceholder}
          required
        />
      </div>
      <Field id="subject" label={f.subjectLabel} placeholder={f.subjectPlaceholder} />
      <Field
        id="message"
        label={f.messageLabel}
        placeholder={f.messagePlaceholder}
        textarea
        maxLength={5000}
      />

      {state.error ? (
        <p className="text-[0.9rem] text-[#d14343]">{state.error}</p>
      ) : null}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  maxLength?: number;
};

function Field({
  id,
  label,
  placeholder,
  type = "text",
  required,
  textarea,
  maxLength,
}: FieldProps) {
  const baseClass =
    "w-full bg-transparent border-b border-rule pb-2 text-[1rem] leading-[1.6] text-ink placeholder:text-faint focus:border-ink focus:outline-none transition-colors";
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </span>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          rows={5}
          className={baseClass}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          required={required}
          className={baseClass}
        />
      )}
    </label>
  );
}
