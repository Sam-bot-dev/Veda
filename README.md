
<p align="center">
  <img src="static/assets/logo.png" width="80" />
</p>

<h1 align="center">Veda</h1>

Smart Pharmacy Intelligence. Real-time tracking, AI-driven expiry alerts, and optimized inventory for the next generation of healthcare.

---

## 🚀 Overview

**Veda** is a next-generation **AI-powered hospital pharmacy management system** designed to eliminate drug wastage, prevent stockouts, and optimize inventory across government healthcare systems.

Built with real-world hospital workflows in mind, Veda ensures:

* **Zero expired medicines**
* **Smart inventory tracking**
* **Automated decision-making using data**

---

## 🎯 Problem Statement

Government hospital pharmacies often face:

* ❌ Drug expiry due to poor tracking
* ❌ Stockouts during critical demand
* ❌ Manual inventory management errors
* ❌ Lack of visibility across stores

**Veda solves all of these with precision, automation, and intelligence.**

---

## 🏥 Core Modules

### 👨‍⚕️ Pharmacist Dashboard

* Real-time inventory visibility (batch-level)
* **FEFO-based dispensing system**
* Smart billing with auto batch selection
* Expiry alerts + AI recommendations
* Low stock alerts with reorder triggers
* Location-aware stock navigation (Row / Shelf / Compartment)
* Quick query assistant (chat-style)

---

### 🧑‍💼 Store Manager Dashboard

* Multi-store inventory control
* Expiry timeline & waste analytics (₹)
* Smart **AI-powered reorder system**
* Batch-level stock receiving
* Order lifecycle tracking (Ordered → Delivered)
* Financial insights (procurement, waste, turnover)

---

### 🏛️ Admin Dashboard

* Centralized hospital-level monitoring
* Cross-store analytics & comparisons
* Emergency drug requisition system
* Procurement approval workflow
* Staff & role management
* Full audit logs for compliance

---

## 🤖 Intelligence Layer

### 🔬 Smart Recommendations (Pharmacist)

* Daily AI suggestions for dispensing priority
* Batch-level expiry risk detection

### 📦 Demand Forecasting (Manager)

* Linear regression-based consumption prediction
* Seasonal adjustments (monsoon, winter trends)
* Stockout prediction & overstock warnings

### 🧠 System Intelligence (Admin)

* Waste pattern analysis
* Store efficiency scoring
* Cross-store imbalance detection

---

## 🔔 Notification System

* Expiry alerts (color-coded urgency)
* Low stock warnings
* Reorder reminders (Pharmacist → Manager)
* Critical recall alerts
* Outbreak-based stock recommendations
* In-app notification center

---

## ⚙️ Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React + Vite + Tailwind + Framer Motion |
| Backend  | FastAPI (Python)                        |
| Database | Firebase Firestore                      |
| Auth     | Firebase Authentication                 |
| AI/ML    | Gemini 1.5 Flash + Linear Regression    |
| Charts   | Recharts                                |
| PDF      | jsPDF                                   |
| Hosting  | Firebase Hosting                        |

---

## 🧩 Architecture

```bash
User Action
   ↓
Frontend (React Dashboard)
   ↓
Firebase (Auth + Firestore Realtime)
   ↓
FastAPI Backend (ML + Logic + PDF)
   ↓
AI Layer (Forecasting + Recommendations)
   ↓
Notifications & UI Updates
```

---

## 📦 Key Features

* 🔁 **FEFO Engine** — First Expiry First Out compliance
* 📊 Real-time inventory analytics (₹ based)
* 🧾 Smart billing system
* 📉 Waste reduction tracking
* 📍 Physical storage mapping (Row/Shelf/Compartment)
* 🔔 Intelligent notification system
* 📄 Exportable reports (PDF/CSV)
* 🌐 Multi-language support (English + Gujarati)
* 📡 Offline mode with sync

---

## 🗂️ Database Structure (Firestore)

```bash
hospitals/
  stores/
    medicines/
    batches/
    dispense_logs/
    orders/
    alerts/
    staff/
users/
requisitions/
notifications/
ml_forecasts/
```

---

## 🎥 Demo (Coming Soon)

> UI previews and walkthrough will be added here.

---

## 🧠 Why Veda?

Unlike traditional systems, Veda is:

* **Predictive, not reactive**
* **Data-driven, not manual**
* **Batch-aware, not just stock-aware**
* **Designed for real hospital workflows**

---

## 📌 Future Enhancements

* 🛰️ Integration with government drug warehouses
* 📱 Mobile app for pharmacists
* 🧬 Advanced ML models (LSTM forecasting)
* 🔗 IoT-based smart shelf tracking

---

## 👨‍💻 Author

**Bhavesh Kumar**
B.Tech CSE | AI, Robotics & Systems Developer
📍 Gandhinagar, India

* GitHub: https://github.com/Sam-bot-dev
* LinkedIn: (Add your link)

---

## ⭐ Support

If you find this project impactful, consider giving it a ⭐
and contributing to make healthcare smarter.

---

> *“In healthcare, timing is everything — Veda ensures nothing is left to chance.”*
