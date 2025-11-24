import axios from 'axios';
import './App.css';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Todo from './pages/Todo.js';

axios.defaults.withCredentials = true;


function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/auth/me")
        setUser(res.data.user);
        // console.log("USER", user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router className="App">
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path='/' element={<Home user={user} error={error} />} />
        <Route path='/:username/todo' element={user ? <Todo user={user} error={error} /> : <Navigate to="/" />} />
        <Route
          path="/login"
          element={user ? <Navigate to={`/${user.username}/todo`} /> : <Login setUser={setUser} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to={`/${user.username}/todo`} /> : <Register setUser={setUser} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
