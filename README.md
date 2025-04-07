
# 🛒 ShopEase – Full-Stack eCommerce Platform

Welcome to **ShopEase**, a feature-rich eCommerce platform built with Node.js, MongoDB, and Razorpay. This full-stack application supports both user-facing shopping functionality and a powerful admin dashboard.

---

## 🚀 Live Demo

👉 **[Click here to view the live site](https://shop-ease-l798.onrender.com/)**  
🖥️ Deployed on [Render](https://render.com) using a Docker image from [Docker Hub](https://hub.docker.com/), with automated CI/CD via [GitHub Actions](https://github.com/features/actions).

---

## 📦 Features

### 👤 User Features
- User authentication and session management
- Product browsing with dynamic pages
- Add to cart, update quantity, remove items
- Place orders with payment integration via Razorpay
- View order history and track order status

### 🔧 Admin Features
- Secure admin login
- Dashboard to manage all products, users, and orders
- Add/edit/delete products
- Update order status (e.g., shipped, delivered)

---

## ⚙️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Templating**: Handlebars (Express Handlebars)
- **Frontend Styling**: Bootstrap
- **Payment Gateway**: Razorpay
- **Dev Tools**: Nodemon, dotenv

---

## 📦 DevOps & Deployment

- 🐳 **Dockerized**: App is containerized using a custom Dockerfile and published to Docker Hub
- 🚀 **CI/CD**: Automated deployment with GitHub Actions
- ☁️ **Hosted on Render**: Deployed as a web service with environment variables and persistent MongoDB connection

---

## 🛠️ Installation Guide (Local Setup)

### ✅ Prerequisites
- Node.js v14+  
- MongoDB v4+ (installed or use MongoDB Atlas)

---

### 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/alanto-manu/shop-ease.git
   cd shop-ease
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the root**
   ```env
   MONGODB_URL=mongodb://127.0.0.1:27017/
   DB_NAME=shopping
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

---

## 🐳 Docker Setup (Optional)

1. **Build Docker image**
   ```bash
   docker build -t shopease-app .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 shopease-app
   ```

---

## 🔄 Continuous Deployment

Every push to the main branch:
- Builds Docker image
- Publishes it to Docker Hub
- Triggers deployment to Render using GitHub Actions

---

## 📬 Contact

For questions or suggestions, feel free to open an issue or contact [@alanto-manu](https://github.com/alanto-manu).

---

> © 2025 ShopEase. Built with ❤️ and lots of coffee.
```
