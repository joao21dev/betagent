"use client";

import { gql, useQuery } from "@apollo/client";
import type { ReactElement } from "react";

const MATCHES_QUERY = gql`
  query Matches($input: GetMatchesArgs!) {
    matches(input: $input) {
      id
      kickoffAt
      status
      venueName
      league {
        id
        displayName
        slug
      }
      homeTeam {
        id
        name
        shortName
      }
      awayTeam {
        id
        name
        shortName
      }
    }
  }
`;

interface MatchesTeam {
  readonly id?: string | null;
  readonly name?: string | null;
  readonly shortName?: string | null;
}

interface MatchesLeague {
  readonly id?: string | null;
  readonly displayName?: string | null;
  readonly slug?: string | null;
}

interface MatchRow {
  readonly id: string;
  readonly kickoffAt: string;
  readonly status: string;
  readonly venueName?: string | null;
  readonly league: MatchesLeague;
  readonly homeTeam: MatchesTeam;
  readonly awayTeam: MatchesTeam;
}

interface MatchesQuery {
  matches: MatchRow[];
}

export function MatchesExplorer(): ReactElement {
  const { loading, error, data } = useQuery<MatchesQuery>(MATCHES_QUERY, {
    variables: { input: { skip: 0, take: 20 } },
  });

  if (loading) return <p>Loading matches...</p>;

  const message = error?.message ?? null;
  const rows = data?.matches ?? [];

  return (
    <section style={{ display: "grid", gap: "0.75rem" }}>
      {message ? <p role="alert">{message}</p> : null}
      {!message && rows.length === 0 ? <p>No matches found (run API seed).</p> : null}
      <ul style={{ paddingLeft: "1rem" }}>
        {!message
          ? rows.map((m) => {
              const leagueName =
                typeof m.league.displayName === "string" ? m.league.displayName : "unknown league";

              const homeName = typeof m.homeTeam.name === "string" ? m.homeTeam.name : "unknown";

              const awayName = typeof m.awayTeam.name === "string" ? m.awayTeam.name : "unknown";

              return (
                <li key={m.id} style={{ marginBottom: "0.75rem" }}>
                  <strong>
                    {homeName} vs {awayName}
                  </strong>
                  &nbsp;<span>&mdash;</span>
                  &nbsp;<span>{m.kickoffAt}</span>
                  <div style={{ opacity: 0.8 }}>
                    league: {leagueName}; status: {m.status}
                    {typeof m.venueName === "string" && m.venueName !== "" ? (
                      <>({m.venueName})</>
                    ) : (
                      ""
                    )}
                  </div>
                </li>
              );
            })
          : null}
      </ul>
    </section>
  );
}
