# 💰 Finance Dashboard – Zorvyn

## 🔗 Live Demo

👉 https://your-vercel-link.vercel.app

---

# 📌 Overview

This project is a **Finance Dashboard UI** built using React and Tailwind CSS.
It allows users to track financial activity, analyze spending patterns, and manage transactions through an intuitive interface.

The application focuses on **clean UI design, structured state management, and meaningful data insights**, rather than backend complexity.

---

# ⚙️ Setup Instructions

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Financial-Dashboard-Zorvyn.git
cd Financial-Dashboard-Zorvyn
```

## 2. Install dependencies

```bash
npm install
```

## 3. Run the development server

```bash
npm run dev
```

## 4. Build for production

```bash
npm run build
```

---

# 🧠 Approach

The application is designed using a **component-based architecture** with a focus on:

### 1. Data-driven UI

* All charts and insights are derived from the same transactions dataset
* No hardcoded chart values

### 2. Derived state pattern

* Raw data → filtered → searched → sorted → paginated
* Avoids redundant state and keeps logic predictable

### 3. Separation of concerns

* Components handle UI
* Logic (filtering, grouping, aggregation) is handled inside components cleanly

### 4. Reusability

* Shared Tailwind class constants for inputs/buttons
* Modular components for scalability

---

# 🚀 Features

## 📊 1. Dashboard Overview

* Current Balance card (Income vs Expense)
* Category-wise expenditure (Pie Chart)
* Income vs Expense Trend (Line Chart – time-based visualization)
* Upcoming Bills section

---

## 💳 2. Transactions Section

* Displays all transactions with:

  * Date
  * Amount
  * Category
  * Type (Income / Expense)

### Functionalities:

* 🔍 Search (category + description)
* 🎯 Filters (amount, category, type, date range)
* 🔃 Sorting (date & amount)
* 📄 Pagination (7 rows per page)

---

## 🔐 3. Role-Based UI (Frontend Simulation)

* **Admin**

  * Add transactions
  * Edit transactions
  * Delete transactions

* **User**

  * View-only access

Role switching is handled via UI for demonstration.

---

## 📈 4. Insights Section

Data-driven insights generated from transactions:

* Highest spending category
* Monthly comparison (increase/decrease)
* Savings rate (Income vs Expense)
* Most frequent category
* Biggest transaction
* Average daily spending

All insights are dynamically calculated using JavaScript methods like `reduce`, `filter`, and `map`.

---

## 🧮 5. State Management

Handled using React state:

* Transactions stored in **localStorage**
* Filters, search, sorting managed via component state
* Derived data pipeline:

```text
Filter → Search → Sort → Pagination
```

---

## 🎨 6. UI & UX

* Dark-themed modern dashboard
* Fully responsive (mobile, tablet, desktop)
* Clean spacing and consistent design system
* Handles empty states gracefully

---

# 🧩 Optional Enhancements Implemented

* ✅ LocalStorage persistence
* ✅ Responsive layout
* ✅ Dynamic charts (ApexCharts)
* ✅ Inline editing
* ✅ Modal confirmation (delete)

---

# 🛠️ Tech Stack

* React (Vite)
* Tailwind CSS
* ApexCharts
* JavaScript (ES6+)

---

# 📸 Screenshots

(Add screenshots here)

---

# 📌 Conclusion

This project demonstrates:

* Strong understanding of frontend architecture
* Clean UI design and responsiveness
* Real-world data handling and transformations
* Thoughtful UX decisions and edge case handling

---

# 🙌 Author

Ayush
