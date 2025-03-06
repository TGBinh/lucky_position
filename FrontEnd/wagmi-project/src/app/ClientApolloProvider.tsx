"use client";

import { ApolloProvider } from "@apollo/client";
import { ReactNode } from "react";
import client from "../apolloClient";

export default function ClientApolloProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
