"use server";

// Stub submit action. Phase 2 ships without a real mail backend — the form
// just logs submissions to the server console. Phase 2.1 can wire this up
// to Resend / Postmark / an SMTP relay / a mailto: fallback.
export type ContactFormState = {
  ok: boolean;
  error?: string;
};

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  // Minimal email shape check — no regex acrobatics.
  if (!email.includes("@") || !email.includes(".")) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  // TODO: replace with real email delivery (Resend, Postmark, SMTP...).
  console.log("[contact form submission]", {
    name,
    email,
    subject,
    message,
    receivedAt: new Date().toISOString(),
  });

  return { ok: true };
}
