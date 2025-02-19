//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import React, { useState, useEffect } from "react";
import {
  login,
  logout,
  handleIncomingRedirect,
  ISessionInfo,
} from "@inrupt/solid-client-authn-browser";
import AuthenticatedFetch from "../authenticatedFetch";

const REDIRECT_URL = "http://localhost:3001";
const APP_NAME = "Authn browser-based tests app";
const DEFAULT_ISSUER = "https://login.inrupt.com/";

export default function AppContainer() {
  const [sessionInfo, setSessionInfo] = useState<ISessionInfo>();
  const [issuer, setIssuer] = useState<string>(DEFAULT_ISSUER);
  const [errorMessage, setErrorMessage] = useState<string>();

  const onError = (error: string) => {
    setErrorMessage(error);
  };

  useEffect(() => {
    handleIncomingRedirect({ restorePreviousSession: true })
      .then(setSessionInfo)
      .catch((e) => {
        onError(`Incoming redirect issue ${e.toString()}`);
      });
  }, []);

  const handleLogin = async () => {
    try {
      // Login will redirect the user away so that they can log in the OIDC issuer,
      // and back to the provided redirect URL (which should be controlled by your app).
      await login({
        redirectUrl: REDIRECT_URL,
        oidcIssuer: issuer,
        clientName: APP_NAME,
      });
    } catch (err) {
      onError((err as Error).toString());
    }
  };

  const handleLogout = async () => {
    await logout();
    setSessionInfo(undefined);
  };

  return (
    <div>
      <h1>{APP_NAME}</h1>
      <p>
        {sessionInfo?.isLoggedIn ? (
          <span data-testid="loggedInStatus">
            Logged in as {sessionInfo.webId}
          </span>
        ) : (
          <span data-testid="loggedOutStatus">Not logged in yet</span>
        )}
      </p>
      <form>
        <input
          data-testid="identityProviderInput"
          type="text"
          value={issuer}
          onChange={(e) => {
            setIssuer(e.target.value);
          }}
        />
        <button
          data-testid="loginButton"
          onClick={async (e) => {
            e.preventDefault();
            await handleLogin();
          }}
        >
          Log In
        </button>
        <button
          data-testid="logoutButton"
          onClick={async (e) => {
            e.preventDefault();
            await handleLogout();
          }}
        >
          Log Out
        </button>
      </form>
      <p data-testid="errorMessage">
        <strong>{errorMessage}</strong>
      </p>
      <br />
      <AuthenticatedFetch onError={onError} />
    </div>
  );
}
