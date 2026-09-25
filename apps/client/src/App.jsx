import { useState } from "react";
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
      {username && <button onClick={handleLogout}>logout</button>}
    </>
  );
}

export default App;