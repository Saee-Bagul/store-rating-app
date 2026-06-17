# ⭐ Store Rating App

Fullstack web app jisme users stores ko 1-5 rating de sakte hain.

**Tech Stack:**
- Backend: Next.js (API Routes) — Plain JavaScript
- Database: MySQL
- Frontend: React (Next.js)

---

## 🚀 Setup — Step by Step

### Step 1: Prerequisites
- Node.js v18+ install karo → https://nodejs.org
- MySQL install karo → https://dev.mysql.com/downloads/installer/ (ya XAMPP/WAMP use karo agar already hai)

### Step 2: MySQL Start Karo
MySQL server chal raha hona chahiye (XAMPP/WAMP se start karo, ya MySQL service start karo).

### Step 3: Database Config Set Karo

File kholo: `src/lib/db.js`

Apna MySQL username/password daalo:
```js
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',   // 👈 yahan apna MySQL password daalo
  database: 'store_rating_db',
}
```

> Database (`store_rating_db`) khud ban jaayega — manually banane ki zaroorat nahi.

### Step 4: Dependencies Install Karo

```bash
npm install
```

### Step 5: App Run Karo

```bash
npm run dev
```

Browser mein kholo: **http://localhost:3000**

Tables aur default admin **automatically** ban jaayenge first run par.

---

## 🔑 Default Admin Login
| Email | Password |
|-------|----------|
| admin@storerating.com | Admin@123 |

---

## 👤 Roles

| Role | Kya kar sakta hai |
|------|---------------------|
| **Admin** | Dashboard stats, users/stores add karna, filter/sort karna |
| **Normal User** | Signup, stores browse karna, rating dena/modify karna |
| **Store Owner** | Apna store dashboard dekhna, raters ki list dekhna |

---

## ✅ Form Validations
- **Name:** 20–60 characters
- **Address:** Max 400 characters
- **Password:** 8–16 chars, 1 uppercase, 1 special character
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
│   ├── stores/     → Normal user store browsing
│   ├── profile/    → Change password
│   ├── login/
│   └── register/
```

---

## 🐛 Common Issues

**"Access denied for user 'root'"**
→ `src/lib/db.js` mein apna correct MySQL password daalo

**"connect ECONNREFUSED"**
→ MySQL server start nahi hai. XAMPP/WAMP open karo aur MySQL start karo.

**PowerShell "running scripts is disabled"**
→ PowerShell ko Admin mode mein kholo aur run karo:
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
