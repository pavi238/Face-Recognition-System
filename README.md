# 🔍 VisionVault — Enterprise Face Recognition & Attendance System

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

VisionVault is an enterprise-grade **Face Recognition & Attendance Management System** designed to automate employee authentication and attendance tracking using AI-powered facial recognition. The platform combines a high-performance **FastAPI** backend with a modern **React** frontend to deliver secure authentication, real-time attendance monitoring, analytics, and administrative controls.

---

# ✨ Key Features

### 📸 AI Face Recognition
- Real-time webcam face verification
- Multi-angle face enrollment for improved accuracy
- High-speed facial matching with confidence score
- Unknown face detection and verification logging

### 👤 Attendance Management
- Automated attendance marking
- Daily attendance history
- Employee directory with search
- Attendance status (On-Time / Late)
- CSV attendance report export

### 📊 Analytics Dashboard
- Attendance trends visualization
- Employee attendance statistics
- KPI cards
- Real-time activity logs
- Interactive charts using Recharts

### 🔐 Authentication & Security
- JWT Authentication
- Password & Face Login
- SHA-256 Password Hashing
- Secure API endpoints
- Audit logs for all recognition events

### ⚙️ Administration
- User Management
- Attendance Monitoring
- Face Registration
- Threshold Configuration
- Camera & System Settings

---

# 🛠 Technology Stack

| Category | Technologies |
|-----------|--------------|
| **Frontend** | React, Vite, Tailwind CSS, Axios, Lucide React, Recharts |
| **Backend** | Python, FastAPI |
| **Database** | SQLite / PostgreSQL |
| **ORM** | SQLAlchemy |
| **Computer Vision** | OpenCV |
| **Authentication** | JWT (python-jose) |
| **Password Security** | SHA-256 |
| **Development Tools** | Git, GitHub |

---

# 📂 Project Structure

```text
VisionVault/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── models/
│   ├── database/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── LICENSE
```

---

# 🚀 Installation & Setup

## Clone Repository

```bash
git clone https://github.com/pavi238/Face-Recognition-System.git

cd Face-Recognition-System
```

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Visit

```
http://localhost:3000
```

---

# 🔑 Default Admin Login

| Email | Password |
|--------|----------|
| admin@facerec.com | admin123 |

---

# 📌 Core Functionalities

- AI-powered Face Recognition
- Employee Registration
- Face Enrollment
- Attendance Tracking
- Attendance Analytics
- Secure Authentication
- Admin Dashboard
- Attendance Report Export
- Activity Logs
- User Management

---

# 🎓 Internship Details

This project was developed as part of my **Python Programming Internship** at **Codtech IT Solutions Private Limited**. During this internship, I gained practical experience in developing enterprise-level full-stack applications by integrating backend APIs, frontend development, database management, authentication, and computer vision technologies.

| Field | Details |
|--------|---------|
| **Organization** | Codtech IT Solutions Private Limited |
| **Internship Domain** | Python Programming |
| **Duration** | 4 Weeks |
| **Internship Period** | 04 July 2026 – 01 August 2026 |
| **Intern ID** | CITS6495 |

### Technologies & Skills Applied

- Python
- FastAPI
- React.js
- Tailwind CSS
- OpenCV
- SQLAlchemy
- SQLite / PostgreSQL
- JWT Authentication
- REST API Development
- Face Recognition
- Computer Vision
- Database Design
- Git & GitHub
- Full-Stack Web Development

---

# 📄 License

This project is licensed under the **MIT License** and is intended for educational and learning purposes.
