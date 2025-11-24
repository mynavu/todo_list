import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Trash, Square, SquareCheckBig } from "lucide-react";

const Todo = ({user, error}) => {

    const [content, setContent] = useState("");
    const [list, setList] = useState([]);

    useEffect(() => {
  if (!user) return;
  const fetchList = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/auth/list?username=${user.username}`);
      setList(res.data.list);
    } catch (err) {
      setList([]);
    }
  };
    fetchList();
    }, [user]);


    const addTodo = async () => {
        if (!user) return;
        const res = await axios.post("http://localhost:8080/api/auth/add_todo", {username: user.username, content: content});
        console.log('RESPONSE DATA:', res.data);

        setContent("");
        setList([...list, res.data.new_row])
    };

    const deleteTodo = async (todo_id) => {
        if (!user) return;
        await axios.post("http://localhost:8080/api/auth/delete_todo", {username: user.username, todo_id: todo_id});
        setList(prev => prev.filter(item => item.todo_id !== todo_id));
    };

    const toggleComplete = async (todo_id, completed) => {
       if (!user) return;
        await axios.post("http://localhost:8080/api/auth/toggle_todo", {username: user.username, todo_id: todo_id, completed: completed});
       setList(prev =>
        prev.map(item =>
            item.todo_id === todo_id
            ? { ...item, completed: !item.completed }
            : item
        )
        );
    }


    return (
  <div className="p-4 flex justify-center">
    <div className="w-full max-w-xl">
      {error && <p className="text-red-400">{error}</p>}

      {user ? (
        <>
          <h2 className="text-orange-300 m-4 text-center text-lg">
            Welcome, {user.username}
          </h2>
          <h2 className="text-emerald-200 m-2">Add todo:</h2>
          <div className="flex mb-4">
           
            <input
              className="text-black bg-white border border-gray-300 p-2 rounded flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={addTodo}
              className="bg-teal-600 text-white px-4 rounded"
            >
              Add
            </button>
          </div>

          <h3 className="m-2 text-emerald-200">Todo list:</h3>
          {list.length === 0 && <p className="text-gray-500">No todos yet.</p>}

          <ul className="space-y-2">
            {list.map((item) => {
              const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              return (
                <li
                  key={item.todo_id}
                  className="flex justify-between items-center p-3 bg-white border rounded shadow-sm text-black group hover:bg-gray-50 transition"
                >
                  <span
                    onClick={() => toggleComplete(item.todo_id, !item.completed)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <span className="transition-transform duration-150">
                      {!item.completed ? (
                        <span className="group-hover:hidden"><Square /></span>
                      ) : (
                        <span className="group-hover:inline"><SquareCheckBig /></span>
                      )}
                      {!item.completed && <span className="hidden group-hover:inline"><SquareCheckBig /></span>}
                    </span>

                    <span className={`${item.completed ? "line-through text-gray-400" : "text-black"} transition`}>
                      {item.content}
                    </span>
                  </span>

                  <span className="text-slate-500 text-sm">{formattedDate}</span>

                  <button
                    onClick={() => deleteTodo(item.todo_id)}
                    className="text-red-600 px-2 hover:text-red-800 transition"
                  >
                    <Trash />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <h2 className="text-emerald-200 mb-4 text-center">Please log in or register.</h2>
      )}
    </div>
  </div>
);

};

export default Todo;