"use client";

import { CircleAlert, CircleCheck, MailCheck, Send } from "lucide-react";
import { useState } from "react";
import type { SubmitEvent } from "react";

interface ContactFormProps {
  recipient: string;
}

type FieldName = "name" | "email" | "subject" | "message";
type FormValues = Record<FieldName, string>;
type TouchedFields = Partial<Record<FieldName, boolean>>;

interface FormFieldProps {
  name: FieldName;
  label: string;
  value: string;
  error: string | null;
  touched: boolean;
  type?: "text" | "email";
  autoComplete?: string;
  multiline?: boolean;
  hint?: string;
  onChange: (name: FieldName, value: string) => void;
  onBlur: (name: FieldName) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Long mailto: links get cut off by some browsers and email apps.
const MESSAGE_MAX_LENGTH = 1500;

const fieldNames: FieldName[] = ["name", "email", "subject", "message"];

const validators: Record<FieldName, (value: string) => string | null> = {
  name: (value) => (value.trim().length >= 2 ? null : "Please enter your name."),
  email: (value) => (EMAIL_PATTERN.test(value.trim()) ? null : "Please enter a valid email address."),
  subject: (value) => (value.trim().length >= 3 ? null : "Please add a short subject."),
  message: (value) => {
    if (value.trim().length < 10) return "Please write at least 10 characters.";
    if (value.length > MESSAGE_MAX_LENGTH) {
      return `Please keep your message under ${MESSAGE_MAX_LENGTH} characters.`;
    }
    return null;
  },
};

function buildMailtoUrl(recipient: string, { name, email, subject, message }: FormValues): string {
  const body = `${message.trim()}\r\n\r\n${name.trim()}\r\n${email.trim()}`;
  return `mailto:${recipient}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`;
}

function FormField({
  name,
  label,
  value,
  error,
  touched,
  type = "text",
  autoComplete,
  multiline = false,
  hint,
  onChange,
  onBlur,
}: FormFieldProps) {
  const showError = touched && error !== null;
  const showValid = touched && error === null;
  const messageId = `contact-${name}-message`;
  const className = `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-navy-900 transition-colors ${
    showError ? "border-rose-500" : showValid ? "border-accent-600" : "border-navy-200"
  }`;
  const fieldProps = {
    id: `contact-${name}`,
    name,
    value,
    required: true,
    "aria-invalid": showError,
    "aria-describedby": messageId,
    className,
    onBlur: () => onBlur(name),
  };

  return (
    <div>
      <label htmlFor={fieldProps.id} className="text-sm font-semibold text-navy-800">
        {label}
      </label>
      <div className="relative mt-1.5">
        {multiline ? (
          <textarea
            {...fieldProps}
            rows={5}
            onChange={(event) => onChange(name, event.target.value)}
          />
        ) : (
          <input
            {...fieldProps}
            type={type}
            autoComplete={autoComplete}
            onChange={(event) => onChange(name, event.target.value)}
          />
        )}
      </div>
      {/* The reserved line stops the form from jumping when a message appears. */}
      <p id={messageId} className="mt-1 flex min-h-5 items-center justify-between gap-3 text-xs">
        {showError ? (
          <span className="inline-flex items-center gap-1 font-medium text-rose-700">
            <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
            {error}
          </span>
        ) : showValid ? (
          <span className="inline-flex items-center gap-1 font-medium text-accent-700">
            <CircleCheck aria-hidden="true" className="size-3.5 shrink-0" />
            Looks good
          </span>
        ) : (
          <span />
        )}
        {hint && <span className="shrink-0 tabular-nums text-navy-500">{hint}</span>}
      </p>
    </div>
  );
}

export default function ContactForm({ recipient }: ContactFormProps) {
  const [values, setValues] = useState<FormValues>({ name: "", email: "", subject: "", message: "" });
  const [touched, setTouched] = useState<TouchedFields>({});
  const [draftUrl, setDraftUrl] = useState<string | null>(null);

  const handleChange = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setDraftUrl(null);
  };

  const handleBlur = (name: FieldName) => {
    setTouched((current) => ({ ...current, [name]: true }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });

    const firstInvalid = fieldNames.find((name) => validators[name](values[name]) !== null);
    if (firstInvalid) {
      const field = event.currentTarget.elements.namedItem(firstInvalid);
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    // The site has no mail backend, so the visitor's own email app sends the message.
    const url = buildMailtoUrl(recipient, values);
    setDraftUrl(url);
    window.location.href = url;
  };

  const fieldProps = (name: FieldName) => ({
    name,
    value: values[name],
    error: validators[name](values[name]),
    touched: touched[name] ?? false,
    onChange: handleChange,
    onBlur: handleBlur,
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label="Contact form"
      className="rounded-2xl bg-white p-5 shadow-xl sm:p-8"
    >
      <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        <FormField {...fieldProps("name")} label="Name" autoComplete="name" />
        <FormField {...fieldProps("email")} label="Email" type="email" autoComplete="email" />
      </div>
      <div className="mt-1 space-y-1">
        <FormField {...fieldProps("subject")} label="Subject" />
        <FormField
          {...fieldProps("message")}
          label="Message"
          multiline
          hint={`${values.message.length}/${MESSAGE_MAX_LENGTH}`}
        />
      </div>

      <button
        type="submit"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-800 sm:w-auto"
      >
        <Send aria-hidden="true" className="size-4" />
        Send Message
      </button>

      <div role="status" className="mt-4 empty:hidden">
        {draftUrl && (
          <p className="flex gap-2 rounded-lg bg-accent-50 p-3 text-sm text-accent-900">
            <MailCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              Your email app should now open with this message ready to send. If it doesn&apos;t,{" "}
              <a href={draftUrl} className="font-semibold underline">
                open the draft again
              </a>{" "}
              or write to{" "}
              <a href={`mailto:${recipient}`} className="font-semibold underline">
                {recipient}
              </a>
              .
            </span>
          </p>
        )}
      </div>
    </form>
  );
}
