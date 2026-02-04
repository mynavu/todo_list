import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { LogIn, UserRoundPlus } from 'lucide-react';

import { User } from '../types.ts';

type NavbarProps = {
    user: User | null;
    setUser: (user: User | null) => void;
}

const Navbar = ({user, setUser}: NavbarProps) => {

    const navigate = useNavigate();
    
    const handleLogout = async (): Promise<void> => {
        await axios.post("http://localhost:8080/api/auth/logout");
        setUser(null);
        navigate('/');
    };


    return (
        <nav>
            <div className="flex justify-start gap-4 p-4 bg-teal-900">
                {user ? (
                    <button onClick={handleLogout}
                    className="text-purple-300 inline-flex items-center space-x-1 hover:text-purple-500"
                    >
                    <span>Logout</span>
                    <LogIn />
                    </button>
                ) : (
                    <>
                    <Link
                    className="text-purple-300 inline-flex items-center space-x-1 hover:text-purple-500"
                    to="/login"
                    >
                    <span>Login</span>
                    <LogIn />
                    </Link>

                    <Link
                    className="text-orange-300 inline-flex items-center space-x-1 hover:text-orange-500"
                    to="/register"
                    >
                    <span>Register</span>
                    <UserRoundPlus />
                    </Link>
                    </>
                    
                )}
            </div>
        </nav>
    )
}

export default Navbar;