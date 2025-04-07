
# 🛒 ShopEase – Full-Stack eCommerce Platform

Welcome to **ShopEase**, a feature-rich eCommerce platform built with Node.js, MongoDB, and Razorpay. This full-stack application supports both user-facing shopping functionality and a powerful admin dashboard.
### 🌐 **Live Site**  **🔗 [shop-ease.onrender.com](https://shop-ease-l798.onrender.com)** 
---



## 📦 **Deployment Pipeline**

<p align="center">
  <a href="https://render.com">
    <img src="https://img.shields.io/badge/🚀_Hosted_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render Badge" />
  </a>
  <a href="https://www.docker.com/">
    <img src="https://img.shields.io/badge/Containerized-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Badge" />
  </a>
  <a href="https://github.com/features/actions">
    <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions Badge" />
  </a>
</p>

---


## 🧰 Tech Stack

<p align="center">
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js Badge" />
  </a>
  <a href="https://expressjs.com/">
    <img src="https://img.shields.io/badge/API-Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js Badge" />
  </a>
  <a href="https://mongodb.com/">
    <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Badge" />
  </a>
  <a href="https://mongoosejs.com/">
    <img src="https://img.shields.io/badge/ODM-Mongoose-AA2929?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose Badge" />
  </a>
  <a href="https://handlebarsjs.com/">
    <img src="https://img.shields.io/badge/Templating-Handlebars.js-f0772b?style=for-the-badge&logo=handlebarsdotjs&logoColor=white" alt="Handlebars Badge" />
  </a>
  <a href="https://getbootstrap.com/">
    <img src="https://img.shields.io/badge/Styling-Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap Badge" />
  </a>
  <a href="https://razorpay.com/">
    <img src="https://img.shields.io/badge/Payments-Razorpay-003366?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay Badge" />
  </a>
  <a href="https://nodemon.io/">
    <img src="https://img.shields.io/badge/Dev_Tool-Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white" alt="Nodemon Badge" />
  </a>
</p>



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

<div align="center">
   
## 🖼 Screenshots

</div>



### 🏠 Homepage

<img src="https://github.com/user-attachments/assets/11742e3a-1a66-4350-a2b1-f43cf9803b47" alt="Homepage" width="700"/>

### 🛒 Product Listing
<img src="https://github.com/user-attachments/assets/f9f3cd81-c162-4f3a-887f-82f55771e3cc" alt="Product Listing" width="700"/>

### 📦 Cart & Checkout  
<img src="https://github.com/user-attachments/assets/63a53f6d-3c25-4b19-b38d-0f5bf7738754" width="500"/>
<img src="https://github.com/user-attachments/assets/ad8e6d11-3664-447b-aff3-056fd5ef034c" width="500"/>
<img src="https://github.com/user-attachments/assets/3b893db0-80e8-47c9-9ee3-577dfd6ca43c" width="500"/>

### 🛠 Admin Dashboard  
<img src="https://github.com/user-attachments/assets/90d9bee1-7edf-4496-8c85-13dae14b3e2d" width="500"/>
<img src="https://github.com/user-attachments/assets/4661dcd9-3cbd-4643-a3b3-55de285d65c4" width="500"/>


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

For questions or suggestions, feel free to open an issue or contact [alanto-manu](mailto:alantomanu501@gmail.com).


---

<div align="center">

© 2025 ShopEase. Built with ❤️ by Alanto Manu.

</div>
