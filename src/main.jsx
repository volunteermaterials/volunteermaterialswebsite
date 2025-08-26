import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import "./index.css";
import App from "./App.jsx";
import { ContentProvider } from "./content/ContentContext.jsx";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      // NOTE: For Auth0Provider, "domain" should be the plain domain (no https://)
      // e.g. dev-abc123.us.auth0.com
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE, // must exactly match server AUTH0_AUDIENCE
        scope: "openid profile email read:content write:content",
        redirect_uri: window.location.origin,
      }}
      cacheLocation="localstorage"
      // If you decide to use refresh tokens, uncomment the line below
      // and be sure your first login includes "offline_access" in scope.
      // useRefreshTokens
    >
      <BrowserRouter>
        <ContentProvider>
          <App />
        </ContentProvider>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
