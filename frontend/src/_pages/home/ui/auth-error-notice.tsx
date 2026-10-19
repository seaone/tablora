"use client";

import { useEffect, useState } from "react";

/** Shows the message the auth callback leaves behind on failure. */
function AuthErrorNotice() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("authError")) return;

    setFailed(true);
    params.delete("authError");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, []);

  if (!failed) return null;

  return (
    <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      Не удалось войти через Яндекс. Попробуйте ещё раз.
    </p>
  );
}

export { AuthErrorNotice };
