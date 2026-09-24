import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function GoogleSignIn({ setUsername }) {
  const [error, setError] = useState(null);

  const handleLogin = async (googleData) => {
    setError(null);
    let data;

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({
          token: googleData.credential,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to connect - HTTP status " + response.status);
      }

      data = await response.json();
      setUsername(data.user.name);
    } catch (err) {
      console.error("failed to sign in to google", err);
      setError("La connexion a échoué. Vérifie que le serveur tourne.");
      return;
    }
  };

  const handleError = (error) => {
    console.error("Error logging in with google:", error);
    setError("Erreur lors de la connexion Google.");
  };

  return (
    <div>
      <GoogleLogin onSuccess={handleLogin} onError={handleError} />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}