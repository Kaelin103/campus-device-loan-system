import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-bs8f6ioqhkbhfd04.us.auth0.com"
      clientId="pEpexV5RHMwsdX85a9hl2aOYV6vKqh6r"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://cdls-api"
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
