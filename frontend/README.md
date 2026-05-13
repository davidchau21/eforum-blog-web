# 🎓 EduBlog Frontend — Student Forum Interface

This is the primary client-side application for the EduBlog System, designed for students to share knowledge, discuss academic topics, and interact with a community of learners.

## ✨ Key Features

- **📝 Rich Post Editor**: Full-featured editor (EditorJS) for creating beautiful academic posts with images, code blocks, and formatting.
- **🤖 AI Study Assistant**: Integrated Google Gemini AI to assist students with explanations and study support.
- **💬 Real-time Communication**: Instant messaging and notification system powered by Socket.io.
- **🔍 Content Discovery**: Advanced search and categorization to find relevant study materials easily.
- **🌐 Social Sharing**: Integrated sharing capabilities to spread knowledge across social platforms.
- **🔐 Secure Access**: Comprehensive authentication including Google Social Login via Firebase.

## 🛠️ Technology Stack

- **Core**: React 18 + Vite
- **Styling**: Tailwind CSS + DaisyUI
- **UI Components**: Material Tailwind + Radix UI
- **Animations**: Framer Motion
- **AI Integration**: Google Generative AI (Gemini)
- **State Management**: Redux Toolkit & Zustand
- **Form/Editor**: EditorJS
- **Icons**: Lucide React & React Icons

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```text
frontend/
├── src/
│   ├── api/            # API services and integration
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-based logic (Chat, Auth, Feed)
│   ├── redux/          # State management logic
│   ├── translations/   # Multi-language files
│   └── App.jsx         # Application root
├── public/             # Static assets
└── tailwind.config.js  # Styling configuration
```

## 📄 License
Part of the **EduBlog Graduation Thesis** project by **Group 75**.

---
*Empowering education through community and AI.*
