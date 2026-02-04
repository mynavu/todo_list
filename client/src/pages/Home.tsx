import React from "react";
import { ListCheck } from 'lucide-react';

type HomeProps = {
    user: any;
    error: string;
}

const Home = ({user, error}: HomeProps) => {


    return (
        <div className="flex flex-col items-center justify-center gap-5 min-h-screen p-4">
            <div className="text-emerald-200 text-2xl inline-flex items-center space-x-3"><span>Todo List</span> <ListCheck /></div>
          <h2 className="text-emerald-200 mb-4">Please log in or register.</h2>
        </div>
  );
};

export default Home;