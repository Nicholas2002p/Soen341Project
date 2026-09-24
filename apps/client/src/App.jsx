import { useState } from "react";
import GoogleSignIn from "./GoogleSignIn.jsx";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");

  const handleLogout = async () => {
    await fetch("/api/logout");
    setUsername("");
  };

  return (
    <>
      <h1>
        Hello, would you like to register to our website?{" "}
        {username ? username : "Anonymous"}
      </h1>
      {!username && <GoogleSignIn setUsername={setUsername} />}
      {username && <button onClick={handleLogout}>logout</button>}
    </>
  );
}

export default App;