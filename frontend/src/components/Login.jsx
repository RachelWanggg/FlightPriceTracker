import { useState } from "react";
import { useAuth } from "../context/authContext";

export function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-form">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn primary" type="submit">
          {isLogin ? "Login" : "Register"}
        </button>
        <button 
          type="button" 
          className="btn ghost" 
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Need an account?" : "Already have an account?"}
        </button>
      </form>
    </div>
  );
}