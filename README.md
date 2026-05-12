# 🎓 EduBlog System — Academic Forum & Management Ecosystem

[![Vercel](https://img.shields.io/badge/Frontend-Live-emerald)](https://eforum.vercel.app)
[![Vercel](https://img.shields.io/badge/Admin-Live-blue)](https://eforum-admin.vercel.app)
[![Node.js](https://img.shields.io/badge/Backend-Express-lightgrey)](https://render.com)
[![License-MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**EduBlog** is a modern academic forum platform designed for middle and high school students. It facilitates knowledge exchange, lesson discussions, and real-time social interaction. The ecosystem includes a comprehensive **Premium Admin Dashboard** for system-wide content and user management.

---

## 🏗️ System Architecture

The project is structured as a coordinated ecosystem (Monorepo style) consisting of three core modules:

1.  **`backend/`**: A robust RESTful API Server handling business logic, data persistence, and security.
2.  **`frontend/`**: The primary client-side application for students and general users.
3.  **`admin-web/`**: A high-fidelity Management Portal for staff and system administrators.

---

## 🚀 Key Features

### 👤 Member Interface (Client)

- **Knowledge Exchange**: Create posts, leave comments, and engage with content (Like, Share, Report).
- **Real-time Chat**: Instant messaging between members powered by Socket.io.
- **AI Study Assistant**: Integrated AI Chatbot to help answer academic questions.
- **Resource Search**: Powerful search engine to find documents and study materials from multiple sources.
- **Secure Authentication**: Traditional Email login and Social Login (Google via Firebase).

### 🛡️ Management Portal (Admin — Premium UI)

- **Intelligent Dashboard**: Real-time analytics for engagement metrics (Likes, Comments, Posts) with ApexCharts.
- **Content Moderation**: Comprehensive tools to review new posts and handle reported content.
- **Category Management**: Flexible organization of tags and academic categories.
- **Multi-language Support (i18n)**: Instant switching between **English** and **Vietnamese**.
- **High-Craft Design**: Luminous Glassmorphism aesthetic with fluid animations via Framer Motion.

---

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Authentication**: JWT (JSON Web Token), Firebase Auth
- **Real-time**: Socket.io
- **Cloud Storage**: AWS S3 (for secure image and document hosting)
- **Integrations**: Google Cloud APIs, AI Integration Engine

### Frontend (Client & Admin)

- **Framework**: React.js + Vite (Admin), React.js (Frontend)
- **UI Design**: Tailwind CSS + Ant Design 5.x
- **Animations**: Framer Motion (State-of-the-art UI experience)
- **State Management**: Redux Toolkit
- **Localization**: i18next & react-i18next
- **Data Viz**: ApexCharts

---

## 💻 Installation & Setup

### 1. Backend Server

```bash
cd backend
npm install
npm run dev
```

### 2. Admin Management Portal

```bash
cd admin-web
npm install
npm run dev
```

### 3. Frontend Client Website

```bash
cd frontend
npm install
npm start
```

---

## 🔐 Demo Credentials

| Role                     | Email                | Password             |
| :----------------------- | :------------------- | :------------------- |
| **System Administrator** | `adminm@gmail.com`   | `Admin11`            |
| **Registered Member**    | `Gow29292@inohm.com` | `Gow29292@inohm.com` |

---

## 📁 Directory Structure

```text
Edu_Blog_Website/
├── admin-web/         # Admin Management Portal (React + Vite)
├── backend/           # RESTful API Server (Node.js + Express)
├── frontend/          # Client Website (ReactJS)
├── README.md          # Global Project Documentation
└── edu-blog.workspace # VSCode Workspace configuration
```

---

## 📄 License & Attribution

This project was developed as a **Senior Graduation Thesis**. All rights reserved by **Group 75 (KLTN 2024-2025)**. For reproduction or reference, please credit the original authors.

---

_Developed with ❤️ by Group 75 - Graduation Thesis 2024-2025_
