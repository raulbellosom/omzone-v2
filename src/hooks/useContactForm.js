import { useState } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 5000;

const INITIAL_FORM = { name: "", email: "", subject: "", message: "" };

export default function useContactForm(t) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [captchaToken, setCaptchaToken] = useState(null);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = t("contact.validation.nameRequired");
    if (!form.email.trim()) e.email = t("contact.validation.emailRequired");
    else if (!EMAIL_RE.test(form.email.trim()))
      e.email = t("contact.validation.emailInvalid");
    if (!form.message.trim())
      e.message = t("contact.validation.messageRequired");
    else if (form.message.length > MAX_MESSAGE)
      e.message = t("contact.validation.messageTooLong");
    if (!captchaToken) e.captcha = t("contact.validation.captchaRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setStatus("sending");
    try {
      const execution = await functions.createExecution(
        env.functionSubmitContact,
        JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || null,
          message: form.message.trim(),
          recaptchaToken: captchaToken,
        }),
        false,
        "/",
        "POST",
      );

      const result = JSON.parse(execution.responseBody);

      if (!result.ok) {
        throw new Error(result.error?.code || "submission_failed");
      }

      setStatus("success");
      setForm(INITIAL_FORM);
      setCaptchaToken(null);
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus("idle");
    setCaptchaToken(null);
  }

  return {
    form,
    errors,
    status,
    captchaToken,
    setCaptchaToken,
    handleChange,
    submit,
    reset,
  };
}
