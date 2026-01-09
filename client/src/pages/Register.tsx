import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const Register = ({ setUser }) => {
    const [form, setForm] = useState({username: "", password: ""});
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(form);
        try {
            const res = await axios.post("http://localhost:8080/api/auth/register", form);
            setUser(res.data.user);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    }


    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <form className="flex flex-col bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
                <h2 className="text-2xl text-center text-teal-900">Register</h2>
                <input placeholder="Username" className="text-black bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500" type="text" value={form.username} onChange={(e) => {setForm({...form, username: e.target.value})}}/>
                <input placeholder="Password" className="text-black bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500" type="password" value={form.password} onChange={(e) => {setForm({...form, password: e.target.value})}}/>
                <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition">Register</button>
                {error && <p className="text-red-500">{error}</p>}
            </form>
        </div>
    )
}

export default Register;