import axios from 'axios';
import './App.css';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Todo from './pages/Todo.tsx';

import { User } from './types.ts';

axios.defaults.withCredentials = true;


function App() {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

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
    <div className="App">
      <Router>
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
    </div>
  );
}

export default App;
