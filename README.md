# ⭐ Store Rating App

A fullstack web application where users can submit ratings (1–5) for stores registered on the platform.

**Tech Stack:**
- Backend: Next.js (API Routes) — Plain JavaScript
- Database: MySQL
- Frontend: React (Next.js)

---

## 🚀 Setup — Step by Step

### Step 1: Prerequisites
- Install Node.js v18+ → https://nodejs.org
- Install MySQL → https://dev.mysql.com/downloads/installer/ (or use XAMPP/WAMP if you already have it)

### Step 2: Start MySQL
Make sure your MySQL server is running (start it via XAMPP/WAMP, or start the MySQL service directly).

### Step 3: Configure Database Connection

Open the file: `src/lib/db.js`

Enter your MySQL username/password:
```js
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',   // 👈 enter your MySQL password here
  database: 'store_rating_db',
}
```

> The database (`store_rating_db`) will be created automatically — no need to create it manually.

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Run the App

```bash
npm run dev
```

Open in browser: **http://localhost:3000**

Tables and the default admin account are created **automatically** on the first run.

---

## 🔑 Default Admin Login

| Email | Password |
|-------|----------|
| admin@storerating.com | Admin@123 |

---

## 👤 User Roles

| Role | Capabilities |
|------|---------------|
| **Admin** | View dashboard stats, add users/stores, filter and sort listings |
| **Normal User** | Sign up, browse stores, submit/modify ratings |
| **Store Owner** | View their store's dashboard and list of users who rated it |

---

## ✅ Form Validations

- **Name:** 20–60 characters
- **Address:** Max 400 characters
- **Password:** 8–16 characters, at least 1 uppercase letter and 1 special character
- **Email:** Standard email format

---

## 📁 Project Structure

```
src/
├── lib/
│   ├── db.js       → MySQL connection + table creation
│   └── auth.js     → JWT + validation helpers
├── app/
│   ├── api/        → Backend API routes (login, register, users, stores, ratings...)
│   ├── components/
│   │   └── Sidebar.js
│   ├── dashboard/
│   │   ├── admin/
│   │   └── store-owner/
│   ├── stores/     → Store browsing for normal users
│   ├── profile/    → Change password
│   ├── login/
│   └── register/
```

---

## 🐛 Common Issues

**"Access denied for user 'root'"**
→ Enter the correct MySQL password in `src/lib/db.js`

**"connect ECONNREFUSED"**
→ The MySQL server isn't running. Start it via XAMPP/WAMP or the MySQL service.

**PowerShell "running scripts is disabled"**
→ Open PowerShell as Administrator and run:
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## ✨ Features

### System Administrator
- Dashboard showing total users, total stores, and total ratings
- Add new users (admin / normal user / store owner)
- Add new stores with an optional store owner assignment
- View and filter users by Name, Email, Address, and Role
- View and filter stores by Name, Email, and Address
- Sortable tables (ascending/descending) on key fields
- View full user details (store owners also show their average rating)

### Normal User
- Self-registration with form validation
- Browse all registered stores with search by Name and Address
- View each store's overall rating and their own submitted rating
- Submit and modify ratings (1–5 stars)
- Change password

### Store Owner
- Dashboard showing store info and average rating
- List of all users who have rated their store
- Sortable rater table
- Change password
