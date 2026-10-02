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
  const [isLogin, setIsLogin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    
    try {
    const response = await fetch(`http://localhost:5000/api/v1/auth/${isLogin ? "login" : "register"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        isLogin ? {
          email: formData.email,
          password: formData.password,
        }
      : formData
    ),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || (isLogin ? "Login failed." : "Registration failed."));
      setLoading(false);
      return;
    }

    const data = await response.json();
    console.log("Authentication response:", data);

    if (data.data?.token) {
      localStorage.setItem("token", data.data.token);
    }

    if (data.data?.user) {
  localStorage.setItem("user", JSON.stringify(data.data.user));
    }

    setSuccess(isLogin ? "Login successful!" : "Registration successful!");

    if (!isLogin) {
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    }

    setLoading(false);  
  } catch (error) {
    console.error(error);
    setError("Something went wrong. Please try again.");
    setLoading(false);
  }
};

  
  return (
    <div>
      <h1>{isLogin ? "Login" : "Create an Account"}</h1>

      <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}
        {success && <p>{success}</p>}

      {!isLogin && (
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
      )}
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
          {loading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
        </button>
      </form>

      <p>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            setSuccess("");
          }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  )
}

export default App