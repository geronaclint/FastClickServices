import { useState } from "react";

/**
 * Shared form hook for service request and ticket submission forms.
 * Handles form state, validation, and submission with consistent patterns.
 */

export function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getPriorityOptions(subscription) {
  const plan = (subscription || "Free").toLowerCase();
  if (plan === "enterprise") return ["Low", "Normal", "High", "Urgent"];
  if (plan === "professional" || plan === "premium") return ["Low", "Normal", "High"];
  return ["Low", "Normal"];
}

export default function useServiceForm({ initialValues, submitFn, onSuccess, extraValidators = {} }) {
  const [form, setForm] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};

    // Contact person: no numbers
    if (form.contactPerson && /\d/.test(form.contactPerson)) {
      errs.contactPerson = "Name should not contain numbers.";
    }

    // Phone: only numbers and spaces
    if (form.phone && /[^\d\s]/.test(form.phone.replace(/\s/g, ""))) {
      errs.phone = "Phone should contain only numbers.";
    }

    // Description: minimum 3 words
    if (form.description !== undefined) {
      const wc = wordCount(form.description);
      if (wc < 3) {
        errs.description = `Description needs at least 3 words (currently ${wc}).`;
      }
    }

    // Extra validators from config
    Object.entries(extraValidators).forEach(([field, validator]) => {
      const fieldErr = validator(form[field], form);
      if (fieldErr) errs[field] = fieldErr;
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage("");

    try {
      const result = await submitFn(form);

      if (result.success) {
        setMessage("Submitted successfully!");
        setForm(initialValues);
        if (onSuccess) onSuccess(result);
      } else {
        setMessage(result.message || "Failed to submit.");
      }
    } catch {
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return {
    form,
    setForm,
    updateField,
    loading,
    message,
    setMessage,
    errors,
    setErrors,
    validate,
    submit,
  };
}
