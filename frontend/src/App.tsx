import {useState} from 'react';
function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    setLoading(true);
    
    try {
    const response = await fetch("http://localhost:5000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Registration failed.");
      setLoading(false);
      return;
    }

    const data = await response.json();
    console.log(data);
    setSuccess("Registration successful!");
    setLoading(false);  
  } catch (error) {
    console.error(error);
    setError("Something went wrong. Please try again.");
    setLoading(false);
  }
};

  
  return (
    <div>
      <h1>Create an Account</h1>

      <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}
        {success && <p>{success}</p>}

        <input 
          type="text" 
          placeholder="Name"
          value={formData.name}
          onChange={(e) => 
            setFormData({
              ...formData, 
              name: e.target.value
            })
          }
         />
        <input 
          type="email" 
          placeholder="Email"
          value={formData.email}
          onChange={(e) => 
            setFormData({
              ...formData, 
              email: e.target.value
            })
          }
         />
        <input 
          type="password" 
          placeholder="Password"
          value={formData.password}
          onChange={(e) => 
            setFormData({
              ...formData, 
              password: e.target.value
            })
          }
         />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  )
}

export default App