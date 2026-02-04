# Todo List
Minimalistic task tracker for activities and events with completion and starring functionality.

## Tech Stack
- React
- TypeScript
- Tailwind CSS
- TypeORM
- Node.js
- Express.js

## Project Structure
```
demoapp/
├── server/ # Backend (Express + TypeORM)
└── client/ # Frontend (React + TypeScript)
```

## Installation
Clone the repository and start the backend:
```bash
git clone https://github.com/mynavu/todo_list.git
cd ./demoapp/server
npm install
node index.js
```
In a separate terminal, start the frontend:
```bash
cd ./demoapp/client
npm install
npm start
```

## Note
Create a `.env` file in the server directory and add `JWT_SECRET` if required.

## Usage
Open the app at: http://localhost:3000/