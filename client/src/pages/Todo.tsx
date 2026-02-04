import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Trash, Square, SquareCheckBig } from "lucide-react";
import { User } from '../types.ts';


type Item = {
    todo_id: number;
    content: string;
    completed: boolean;
    date_created: string;
    date_completed: string | null;
}

type TodoListResponse = {
    list: Item[];
}

type TodoProps = {
    user: User | null;
    error: string;
}

type TodoResponse = {
    new_row: Item;
}

type TodoToggleResponse = {
    todo: Item;
}

const Todo = ({user, error}:TodoProps) => {

    const [content, setContent] = useState<string>("");
    const [list, setList] = useState<Item[]>([]);

    useEffect(() => {
      if (!user) return;
      const fetchList = async (): Promise<void> => {
        try {
          const res = await axios.get<TodoListResponse>(`http://localhost:8080/api/todo/list`, { withCredentials: true });
          setList(res.data.list);
        } catch (err) {
          setList([]);
        }
      };
        fetchList();
        }, [user]);


    const addTodo = async (): Promise<void> => {
        if (!user) return;
        if (content.trim() === "") return;
        try {
          const res = await axios.post<TodoResponse>("http://localhost:8080/api/todo/add_todo", {content: content}, { withCredentials: true });
          console.log('RESPONSE DATA:', res.data);

          setContent("");
          setList([...list, res.data.new_row])
        } catch (err) {
          console.error("Error adding todo:", err);
        }
    };

    const deleteTodo = async (todo_id: number): Promise<void> => {
      if (!user) return;
      try {
      const confirmed = window.confirm("Are you sure you want to delete this todo?");
      if (!confirmed) return;

      await axios.post("http://localhost:8080/api/todo/delete_todo", { todo_id });
      setList(prev => prev.filter(item => item.todo_id !== todo_id));
      } catch (err) {
        console.error("Error deleting todo:", err);
      }
};


    const toggleComplete = async (todo_id: number, completed: boolean): Promise<void> => {
      if (!user) return;

      try {

      const res = await axios.post<TodoToggleResponse>(
        "http://localhost:8080/api/todo/toggle_todo",
        { todo_id, completed },
        { withCredentials: true }
      );

      const updatedTodo = res.data.todo;

      setList(prev =>
        prev.map(item =>
          item.todo_id === todo_id ? updatedTodo : item
        )
      );
    } catch (err) {
      console.error("Error toggling todo:", err);
    }
    };



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
              const formattedDateCreated = new Date(item.date_created).toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              const formattedDateCompleted = item.date_completed ? new Date(item.date_completed).toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }) : null;

              return (
                <li
                  key={item.todo_id}
                  className="flex justify-between items-center p-3 bg-white border rounded shadow-sm text-black hover:bg-gray-50 transition"
                >
                  <span
                    onClick={() => toggleComplete(item.todo_id, !item.completed)}
                    className="group flex items-center space-x-2 cursor-pointer"
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

                  <span className="text-slate-500 text-xs">Created: {formattedDateCreated}</span>
                  {item.completed && (<span className="text-slate-500 text-xs">Completed: {formattedDateCompleted}</span>
                  )}

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