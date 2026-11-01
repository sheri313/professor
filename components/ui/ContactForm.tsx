"use client";

import { CircleAlert, CircleCheck, MailCheck, Send } from "lucide-react";
import { useState } from "react";
import type { ReactNode, SubmitEvent } from "react";

interface ContactFormProps {
  children: ReactNode;
  recipient: string;
  recipientName: string;
  postmarkTop: string;
  postmarkBottom: string;
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

interface PostmarkProps {
  top: string;
  bottom: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Long mailto: links get cut off by some browsers and email apps.
const MESSAGE_MAX_LENGTH = 1500;

// In reading order, so an invalid submit focuses the first problem on the page.
const fieldNames: FieldName[] = ["subject", "message", "name", "email"];

const validators: Record<FieldName, (value: string) => string | null> = {
  name: (value) => (value.trim().length >= 2 ? null : "Please enter your name."),
  email: (value) => (EMAIL_PATTERN.test(value.trim()) ? null : "Please enter a valid email."),
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
  const fieldProps = {
    id: `contact-${name}`,
    name,
    value,
    required: true,
    "aria-invalid": showError,
    "aria-describedby": messageId,
    className: `peer block w-full resize-none bg-transparent font-serif text-xl text-navy-900 outline-none! ${
      multiline ? "letter-lines" : "border-b border-navy-300 py-1"
    }`,
    onBlur: () => onBlur(name),
  };

  return (
    <div>
      <label
        htmlFor={fieldProps.id}
        className="font-mono text-[0.6875rem] uppercase tracking-widest text-navy-500"
      >
        {label}
      </label>
      <div className="relative">
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
        {/* Draws in on transform, so focusing a field never repaints the card. */}
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-0.5 origin-left transition-transform duration-300 ease-out peer-focus:scale-x-100 ${
            showError ? "scale-x-100 bg-rose-500" : "scale-x-0 bg-accent-600"
          }`}
        />
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

function Postmark({ top, bottom }: PostmarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className="postmark pointer-events-none absolute right-24 top-20 size-36 text-accent-800 sm:right-32 sm:top-24"
    >
      <defs>
        <path id="postmark-top" d="M30 100a70 70 0 0 1 140 0" />
        <path id="postmark-bottom" d="M20 100a80 80 0 0 0 160 0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <g fill="currentColor" className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em]">
        <text>
          <textPath href="#postmark-top" startOffset="50%" textAnchor="middle">
            {top}
          </textPath>
        </text>
        <text>
          <textPath href="#postmark-bottom" startOffset="50%" textAnchor="middle">
            {bottom}
          </textPath>
        </text>
      </g>
      <text
        x="100"
        y="108"
        fill="currentColor"
        textAnchor="middle"
        className="font-mono text-[22px] font-bold tracking-widest"
      >
        SENT
      </text>
    </svg>
  );
}

export default function ContactForm({
  children,
  recipient,
  recipientName,
  postmarkTop,
  postmarkBottom,
}: ContactFormProps) {
  const [values, setValues] = useState<FormValues>({ name: "", email: "", subject: "", message: "" });
  const [touched, setTouched] = useState<TouchedFields>({});
  const [draftUrl, setDraftUrl] = useState<string | null>(null);

  const readyFields = fieldNames.filter((name) => validators[name](values[name]) === null).length;
  const allReady = readyFields === fieldNames.length;
  const SubmitIcon = draftUrl ? MailCheck : Send;

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
      data-sent={draftUrl ? "" : undefined}
      className="airmail-edge rounded-2xl p-2.5 shadow-[0_48px_90px_-40px_rgb(12_20_35/0.55)]"
    >
      <div className="grid rounded-lg bg-paper-50 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="p-6 sm:p-9">
          <p className="font-serif text-3xl text-navy-900">Dear {recipientName},</p>

          <div className="mt-5 space-y-1">
            <FormField {...fieldProps("subject")} label="Regarding" />
            <FormField
              {...fieldProps("message")}
              label="Your message"
              multiline
              hint={`${values.message.length}/${MESSAGE_MAX_LENGTH}`}
            />
          </div>

          <p className="mt-2 font-serif text-xl italic text-navy-700">Yours sincerely,</p>
          <div className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <FormField {...fieldProps("name")} label="Your name" autoComplete="name" />
            <FormField
              {...fieldProps("email")}
              label="Your email"
              type="email"
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="group relative mt-2 flex w-full items-center justify-between overflow-hidden rounded-lg bg-navy-900 px-5 py-3.5 text-sm font-semibold text-white"
          >
            {/* Fills as fields become valid, so the button reports how close the letter is. */}
            <span
              aria-hidden="true"
              style={{ transform: `scaleX(${readyFields / fieldNames.length})` }}
              className="absolute inset-0 origin-left bg-accent-700 transition-transform duration-500 ease-out"
            />
            <span className="relative inline-flex items-center gap-2">
              <SubmitIcon
                aria-hidden="true"
                className={`size-4 transition-transform duration-300 ${
                  allReady && !draftUrl ? "group-hover:-rotate-12 group-hover:translate-x-1" : ""
                }`}
              />
              {draftUrl ? "Draft opened" : "Send Message"}
            </span>
            <span aria-hidden="true" className="relative font-mono text-xs opacity-80">
              {readyFields}/{fieldNames.length}
            </span>
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
        </div>

        <div className="relative border-t border-navy-200 p-6 sm:p-9 lg:border-l lg:border-t-0">
          {children}
          <Postmark top={postmarkTop} bottom={postmarkBottom} />
        </div>
      </div>
    </form>
  );
}
