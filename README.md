# 🚀 Recoup | AI Revenue Recovery Agent

![Recoup Banner](https://img.shields.io/badge/Razorpay-AI_Buildathon-00E5FF?style=for-the-badge&logo=razorpay)

Recoup is an autonomous, multi-surface AI agent built for the **Razorpay AI Revenue Recovery Buildathon**. It detects revenue at risk, intelligently determines the optimal intervention, and executes a strictly bounded recovery workflow for both payment failures and overdue receivables.

Instead of relying on unconstrained LLM text generation, Recoup calculates the **Expected Value (EV)** of every possible action and enforces strict policy guardrails to ensure compliance, safety, and maximum revenue retention.

---

## ✨ Key Features

- 🛡️ **Dual-Surface Recovery Architecture**
  - **Surface 1 (Payments):** Diagnoses real-time payment failures (e.g., `insufficient_funds`, `checkout_dropoff`, `mandate_failure`) and orchestrates retries or reauth nudges.
  - **Surface 2 (Promises):** Scores customer reliability for overdue B2B receivables and tracks promises to pay, escalating automatically if missed.

- 🧠 **Algorithmic Decision Engine**
  - Calculates the **Expected Value** `(Probability × Amount) - Cost` for every candidate action.
  - Features smart stopping rules (e.g., blocks retries after 3 attempts, limits high-friction outreach on low-value invoices).

- 🔒 **Enterprise Guardrails & Compliance**
  - Never goes rogue. Low-confidence inferences (<60%) or high-value anomalies are automatically escalated to manual review.
  - Strictly respects `do_not_contact` and `do_not_retry` compliance flags.

- 📊 **Real-Time Simulation & Audit Trail**
  - Bring your own data! Upload CSVs/Excel files and instantly map them to Recoup's internal schema.
  - Generates an immutable, cryptographic-style **Audit Trail** explaining exactly *why* an action was chosen, and *why* other actions were rejected by policy.
  - Visualizes measured money recovered (₹) across entire batches in a sleek React dashboard.

- 🗣️ **Hinglish Voice & Contextual Nudges**
  - Generates highly contextual, localized Hinglish nudges for maximum user engagement across voice and WhatsApp channels.

---

## 🛠️ Tech Stack

- **Backend:** FastAPI (Python), Pandas, NumPy, SQLite3
- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Architecture Design:** Deterministic Evaluation Pipeline, Expected Value Engine, Rule-based ML heuristics

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Bala-17-prog/recoup.git
cd recoup
```

### 2. Start the Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

---

*Built with 💙 for the Razorpay AI Buildathon.*
