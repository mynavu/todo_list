import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User } from '../types.ts';

type LoginProps = {
    setUser: (user: User) => void;
}

type LoginForm = {
    username: string;
    password: string;
}

const Login = ({ setUser }: LoginProps) => {
    const [form, setForm] = useState<LoginForm>({username: "", password: ""});
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = async (e): Promise<void> => {
        e.preventDefault();
        console.log(form);
        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", form);
            setUser(res.data.user);
            console.log(res.data.user);
            navigate("/");
        } catch (err) {
            setError("Inavlid username or password");
        }
    }


    return (
        <div className="flex items-center justify-center min-h-screen p-4">
  <form 
    className="flex flex-col bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
    onSubmit={handleSubmit}
  >
    <h2 className="text-2xl text-center text-teal-900">Login</h2>

    <input
      className="text-black bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
      type="text"
      placeholder="Username"
      value={form.username}
      onChange={(e) => setForm({ ...form, username: e.target.value })}
    />

    <input
      className="text-black bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
      type="password"
      placeholder="Password"
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
    />

    <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition">
      Login
    </button>

    {error && <p className="text-red-500 text-center">{error}</p>}
  </form>
</div>

    )
}

export default Login;