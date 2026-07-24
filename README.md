# 🔍 VisionVault — Enterprise Face Recognition & Attendance System

VisionVault is a full-stack, enterprise-grade **Face Recognition & Attendance Intelligence Platform** built with **FastAPI**, **OpenCV**, **SQLAlchemy**, and **React (Vite + Tailwind CSS)**.

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.11-brightgreen)
![React](https://img.shields.io/badge/React-18-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688)

---

## ✨ Features

- 📸 **Real-Time Webcam Face Verification**: Instant identification via browser webcam stream with canvas bounding box rendering, confidence score, and audio chimes.
- 🎯 **Multi-Angle Face Enrollment**: Guided 3-angle wizard (Frontal, Left Angle, Right Angle) to extract 128D facial feature vectors for high matching precision.
- 🔐 **Authentication & Security**: Password login + Passwordless Face Login using JWT tokens and salted SHA-256 password hashing.
- 📊 **Analytics Dashboard**: Interactive Recharts attendance trend bar chart, KPI cards, punctuality rate breakdown, and real-time audit feed.
- 📋 **User & Attendance Management**: Searchable personnel directory, status badges (On Time, Late), date range pickers, and 1-click **CSV Report Export**.
- 🛡️ **Security Audit Logs**: Complete log of all verification events, confidence scores, vector distances, and unknown face snapshots.
- ⚙️ **System Parameters Tuning**: Adjustable vector matching distance threshold slider, workplace start time, audio chime toggle, and camera selector.

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11** + **FastAPI**
- **OpenCV** (Haar Cascade & Spatial Block Histogram 128D Embeddings)
- **SQLAlchemy ORM** + **SQLite / PostgreSQL**
- **JWT (python-jose)** authentication

### Frontend
- **React** (Vite)
- **Tailwind CSS** (Dark / Light Mode)
- **Lucide React Icons**
- **Recharts** (Analytics visualization)
- **Axios** HTTP client

---

## 🚀 Quick Start Guide

### 1. Clone Repository
```bash
git clone https://github.com/pavi238/Face-Recognition-System.git
cd Face-Recognition-System
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

**Default Admin Credentials:**
- **Email:** `admin@facerec.com`
- **Password:** `admin123`

---

## 📜 License

Distributed under the MIT License.
