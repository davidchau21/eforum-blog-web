# ⚙️ EduBlog Backend — RESTful API Server

This is the core engine of the EduBlog System, providing secure APIs, database management, and real-time communication capabilities for both the Student Forum and the Admin Portal.

## ✨ Key Features

- **🛡️ Secure Authentication**: Robust JWT-based authentication system with password hashing (Bcrypt).
- **📡 Real-time Engine**: Live communication for messaging and notifications using Socket.io.
- **📁 Cloud Asset Management**: Seamless integration with AWS S3 for hosting user-generated content and documents.
- **✉️ Automated Mailing**: System-wide email notifications and OTP delivery via Nodemailer.
- **🔍 Academic Integrations**: Integration with Google APIs and external data scraping (duck-duck-scrape) for resource discovery.
- **🔐 Security First**: Implementation of rate limiting, CORS policies, and secure environment configuration.
- **🔥 Firebase Integration**: Server-side support for Google Social Login and Firebase Admin tasks.

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Security**: JSON Web Token (JWT), Bcrypt, Express Rate Limit
- **Storage**: AWS SDK (S3), Multer
- **Mail**: Nodemailer & OTP Generator
- **Cloud/Services**: Firebase Admin SDK, Google APIs, Supabase

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- AWS S3 Credentials (optional for local testing)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   - Create a `.env` file based on the provided configuration.
   - Ensure your MongoDB URI and API keys are set correctly.
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```text
backend/
├── config/         # Database and service configurations
├── controller/     # Business logic and request handling
├── middleware/     # Auth and security middlewares
├── router/         # API endpoint definitions
├── service/        # Reusable business services
├── socket/         # Real-time event handling
├── Schema/         # Mongoose models and schemas
├── Mail/           # Email templates and logic
└── server.js       # Main entry point
```

## 📄 License
Part of the **EduBlog Graduation Thesis** project by **Group 75**.

---
*Powering academic collaboration with a robust and secure API.*
