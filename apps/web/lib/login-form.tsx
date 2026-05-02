"use client";

import { type FormEvent, type ReactElement, useState } from "react";

import type { SupabaseBrowserClient } from "./supabase.browser";

type LoginFormReceiveObject = Readonly<{
  supabase: SupabaseBrowserClient;
  onAuthed: (accessToken: string) => void;
}>;

export function LoginForm(ro: LoginFormReceiveObject): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setBusy(true);
    setLocalError(null);

    try {
      const { data, error } = await ro.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLocalError(error.message);
        return;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setLocalError("Missing access token after sign-in");
        return;
      }

      ro.onAuthed(accessToken);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem", maxWidth: 360 }}>
      <label style={{ display: "grid", gap: "0.25rem" }}>
        Email
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label style={{ display: "grid", gap: "0.25rem" }}>
        Password
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      <button disabled={busy} type="submit">
        {busy ? "Signing in" : "Sign in"}
      </button>

      {localError ? <p role="alert">{localError}</p> : null}
    </form>
  );
}
