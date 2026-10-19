"use client";

import { useState } from "react";

/**
 * Shared open/submit state for the feature dialogs: keeps the dialog open on
 * error and blocks closing while a request is in flight.
 */
export function useDialogSubmit<TArgs extends unknown[]>(
  action: (...args: TArgs) => void | Promise<void>,
  fallbackError: string,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setError(null);
      setIsOpen(true);
    } else if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const submit = async (...args: TArgs) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await action(...args);
      setIsSubmitting(false);
      setIsOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : fallbackError);
      setIsSubmitting(false);
    }
  };

  return { isOpen, handleOpenChange, isSubmitting, error, submit };
}
