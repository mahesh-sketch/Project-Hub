# ProjectHub Pro

A modern project and task management system built with the MERN stack (MongoDB, Express, React, Node.js).

---

##  Features

- User authentication (Admin & Member roles)
- Project management (CRUD, assign users)
- Task management (CRUD, assign to users, subtasks, priorities)
- Dashboard with project/task stats
- Activity logs (admin only)
- Responsive, modern UI (Material UI + Tailwind CSS)
- Protected routes (role-based access)
- Toast notifications for feedback

---

##  Tech Stack

- **Frontend:** React, Vite, Material UI, Tailwind CSS, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Token)

---

##  Local Setup

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies:**

   - Backend:
     ```bash
     cd backend
     npm install
     ```
   - Frontend:
     ```bash
     cd ../frontend
     npm install
     ```

3. **Configure environment variables:**

   - In `backend/.env`, set:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```

4. **Run the app locally:**
   - Start backend:
     ```bash
     cd backend
     npm run dev
     # or: node server.js
     ```
   - Start frontend:
     ```bash
     cd ../frontend
     npm run dev
     ```
   - Visit [http://localhost:5173](http://localhost:5173) (or the port shown) for the frontend.

---

##  Deployment

- **Frontend:** Deploy the `frontend/dist` folder to Vercel, Netlify, or any static host.
- **Backend:** Deploy the `backend` folder to Render, Railway, Heroku, or a VPS.
- **Update API URLs** in the frontend to point to your deployed backend.

---

##  Environment Variables

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT signing
- `PORT` — Backend server port (default: 5000)

---

##  License

MIT License

---

##  Credits

Built by [Your Name].
