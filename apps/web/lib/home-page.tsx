"use client";

import { ApolloProvider } from "@apollo/client";
import { type ReactElement, useMemo, useState } from "react";

import { createApolloClient } from "./create-apollo-client";
import { LoginForm } from "./login-form";
import { MatchesExplorer } from "./matches-explorer";
import { createBrowserSupabase } from "./supabase.browser";

export function HomePage(): ReactElement {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const supabase = useMemo(() => createBrowserSupabase(), []);
  const client = useMemo(
    () => (accessToken ? createApolloClient(accessToken) : null),
    [accessToken],
  );

  return (
    <main style={{ padding: "2rem", display: "grid", gap: "1rem" }}>
      <div>
        <h1>BetAgent</h1>
        <p>Signed-in GraphQL read slice (matches).</p>
      </div>

      {!supabase ? (
        <div>
          <p>
            Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in apps/web `.env.local`.
          </p>
        </div>
      ) : !accessToken ? (
        <>
          <h2 style={{ margin: 0 }}>Sign in</h2>
          <LoginForm
            supabase={supabase}
            onAuthed={(token) => {
              setAccessToken(token);
            }}
          />
        </>
      ) : client ? (
        <ApolloProvider client={client}>
          <h2 style={{ margin: 0 }}>Upcoming snapshot</h2>
          <MatchesExplorer />
        </ApolloProvider>
      ) : null}
    </main>
  );
}
