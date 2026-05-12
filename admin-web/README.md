# 🛡️ EduBlog Admin Portal — Management Interface

This is the central management dashboard for the EduBlog System, designed with a premium, high-craft UI/UX focusing on performance, aesthetics, and ease of use.

## ✨ Key Features

- **📊 Advanced Analytics**: Interactive data visualization using ApexCharts for tracking engagement (likes, comments, etc.).
- **🌐 Global Reach (i18n)**: Full multi-language support (English & Vietnamese) with real-time switching using `react-i18next`.
- **✨ Premium UI/UX**: Luminous Glassmorphism aesthetic with smooth Entrance & Page transitions powered by `framer-motion`.
- **🔐 Secure Access**: Comprehensive authentication flow with protected routes and enterprise-grade UI tokens.
- **📱 Responsive Management**: Fully optimized table views and forms for managing Blogs, Staff, Categories, and Notifications.

## 🛠️ Technology Stack

- **Core**: React 18 + Vite (ESM)
- **Styling**: Tailwind CSS + Ant Design 5.x
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Internationalization**: i18next & react-i18next
- **State Management**: Redux Toolkit
- **Charts**: React ApexCharts

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Navigate to the admin directory:
   ```bash
   cd admin-web
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
admin-web/
├── src/
│   ├── api/            # API integration services
│   ├── assets/         # Visual assets and images
│   ├── components/     # Reusable UI components (Common, Layout, Table)
│   ├── config/         # i18n and global configurations
│   ├── features/       # Feature-based pages (Dashboard, Blogs, Login, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── redux/          # Global state management
│   └── main.jsx        # Entry point
└── package.json        # Project metadata & dependencies
```

## 👤 Credentials (Demo)
- **Role**: Super Admin
- **Email**: `adminm@gmail.com`
- **Password**: `Admin11`

---
*Built with ❤️ for EduBlog System by Nhóm 75*
