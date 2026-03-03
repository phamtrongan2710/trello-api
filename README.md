# 🛠 Trello Clone — Backend API (trello-api)

This project is the backend RESTful API powering the Trello clone frontend (`trello-web`).

It provides board, column, and card management with database persistence and business logic handling.

---

## ✨ Features

* 🗂 CRUD operations for boards
* 📋 CRUD operations for columns
* 📝 CRUD operations for cards
* 🔄 Update card positions
* 🔄 Update column positions
* 📦 Structured MongoDB data model
* 🧠 Business logic validation
* 🌐 RESTful API design

---

## 🧠 Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* REST API architecture

---

## 🗄 Database Design

Main collections:

* Boards
* Columns
* Cards

Relationships:

* A board contains multiple columns
* A column contains multiple cards
* Position fields are used for ordering

---

## 📂 Project Structure

```
src/
├── controllers/
├── models/
├── routes/
├── services/
├── validations/
├── config/
└── server.js
```

---

## 🔄 Request Lifecycle

```
Client Request
   ↓
Route
   ↓
Controller
   ↓
Service Layer
   ↓
Database (MongoDB)
   ↓
Response
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone repository

```bash
git clone https://github.com/phamtrongan2710/trello-api.git
cd trello-api
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure database

Update MongoDB connection string inside:

```
src/config/
```

Example:

```js
MONGODB_URI = 'mongodb://localhost:27017/trello-clone'
```

### 4️⃣ Start server

```bash
npm start
```

Server runs at:

```
http://localhost:8017
```

---

## 🛡 Future Improvements

* [ ] API rate limiting
* [ ] Request validation middleware
* [ ] Logging & monitoring
* [ ] Docker support
* [ ] CI/CD pipeline

---

## 📜 License

MIT
