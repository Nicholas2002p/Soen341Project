function App() {
  async function RegisterApi() {
    try {
      const email = `test-${Date.now()}@example.com`;
      const password = "CorrectHorseBatteryStaple1!";

      const response = await fetch("https://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Status:", response.status);
      const data = await response.json();

      if (!response.ok) {
        console.error("Error Message:", data.message || data.msg);
      } else {
        console.log("Registered user:", data.user);
        console.log("Session token:", data.sessionToken);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button onClick={RegisterApi}>
      Register
    </button>
  );
}

export default App;