import {useState} from 'react';
function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch("http://localhost:5000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log(data);
  };
  
  return (
    <div>
      <h1>Create an Account</h1>

      <form onSubmit={handleSubmit}>
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
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default App