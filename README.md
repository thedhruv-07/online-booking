# 📦 Online Booking & Inspection Platform

A modern, full-stack application for managing product inspections and factory bookings. Built with **React**, **Node.js**, **Express**, and **MongoDB**.

## 🚀 Live Demo
- **Frontend**: [https://bookingapp0.netlify.app/](https://bookingapp0.netlify.app/)
- **Backend API**: [https://online-booking-a6ux.onrender.com](https://online-booking-a6ux.onrender.com)

---

## ✨ Key Features

### 🔍 Advanced Search & UI
- **Searchable Country Codes**: Custom searchable dropdown for international phone prefixes, supporting fuzzy search by country name or ISO code.
- **Dynamic AQL Inspection**: Real-time calculation of inspection sample sizes and acceptance/rejection limits based on ANSI/ASQ Z1.4 standards.
- **Multi-step Booking Flow**: Intuitive wizard for capturing Factory, Product, and Service details.

### 💼 Dashboard & Management
- **Interactive Booking Overview**: Detailed view of all bookings with status tracking and dynamic data rendering.
- **User Authentication**: Secure JWT-based authentication for inspectors and clients.
- **Email Notifications**: Automated email updates for booking status and reports.

### 🎨 Modern Design System
- **Premium Light Mode**: Sleek, professional interface with glassmorphism elements and smooth transitions.
- **Lucide Icons**: High-quality iconography throughout the app.
- **Responsive Layout**: Optimized for desktop and mobile devices.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Nodemailer.
- **Deployment**: Netlify (Frontend) & Render (Backend).

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/thedhruv-07/online-booking.git
cd online-booking
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file based on .env.example
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create a .env file based on .env.example
npm run dev
```

---

## 🌐 Deployment Configuration

This project is configured for **split deployment**:

- **Frontend (Netlify)**: Set `VITE_API_URL` to your backend endpoint (including `/api`).
- **Backend (Render)**: Set `FRONTEND_URL` to your Netlify domain and configure `MONGODB_URI` and `JWT_SECRET`.

---

## 📄 License
MIT License. Created by [Dhruv Singh](https://github.com/thedhruv-07).
