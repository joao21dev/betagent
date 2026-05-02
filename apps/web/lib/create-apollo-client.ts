import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export function createApolloClient(accessToken: string | null) {
  const uri = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),
  });
}
