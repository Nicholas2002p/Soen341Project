import { useState } from "react";
import GoogleSignIn from "./components/google.jsx";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");

  const handleLogout = async () => {
    await fetch("/api/logout");
    setUsername("");
  };

  return (
    <>
      <h1 style={{ fontSize: "2rem", lineHeight: "1.5" }}>
  Hello, would you like to register to our website?
  <br />
  {username ? username : "Anonymous"}
</h1>
      {!username && <GoogleSignIn setUsername={setUsername} />}
      {username && <button onClick={handleLogout}>logout</button>}
    </>
  );
}

export default App;