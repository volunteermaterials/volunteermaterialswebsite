// src/components/ProtectedRoute.jsx
import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";

export default function ProtectedRoute({ children }) {
  // Wrap a tiny component so we can protect any JSX passed as children
  const Child = () => <>{children}</>;
  const Guard = withAuthenticationRequired(Child, {
    onRedirecting: () => (
      <div className="p-8 text-center">Checking access…</div>
    ),
  });
  return <Guard />;
}
