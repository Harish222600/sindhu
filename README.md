# 🌿 AuraSkin AI — AI-Powered Skincare Suggestion Website

> An intelligent skincare analysis web application that uses AI models to detect your skin type and acne severity from a facial photo, then generates a fully personalized AM/PM/Weekly skincare routine.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [AI Models Used](#-ai-models-used)
6. [API Endpoints](#-api-endpoints)
7. [Environment Variables](#-environment-variables)
8. [How to Run the Project](#-how-to-run-the-project)
9. [How It Works](#-how-it-works)
10. [Recommendation Logic](#-recommendation-logic)
11. [Database Schema](#-database-schema)
12. [Frontend Pages](#-frontend-pages)
13. [Known Limitations](#-known-limitations)
14. [Future Improvements](#-future-improvements)

---

## 🌟 Project Overview

**AuraSkin AI** is a full-stack web application that allows users to upload a facial photograph and receive an AI-powered skincare analysis.

The system identifies the user's:
- **Skin Type** — Oily, Dry, or Normal
- **Acne Severity** — Clear to Very Severe

Then generates a detailed, personalized skincare routine:
- ☀️ **Morning (AM) Routine** — Protection and prevention steps
- 🌙 **Evening (PM) Routine** — Repair and treatment steps
- 📅 **Weekly Treatments** — Targeted masks and exfoliants with frequency guidance

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 **Photo Upload** | Drag-and-drop or click-to-upload facial image |
| 🤖 **AI Skin Analysis** | Dual AI model analysis for skin type and acne severity |
| 🧴 **AM Routine** | Personalized morning skincare steps with product recommendations |
| 🌙 **PM Routine** | Personalized evening skincare steps with treatment actives |
| 📅 **Weekly Treatments** | Masks and exfoliants with frequency tags (e.g., "2-3x per week") |
| 📊 **Confidence Badges** | Color-coded confidence scores (green/yellow/red) for each prediction |
| 📝 **Skin Profile Details** | Characteristics, goals, observations, and expert tips |
| 💾 **Scan History** | All scans saved to MongoDB for future reference |
| 🎨 **Premium Dark UI** | Glassmorphism design with gradient accents |

---

## 🛠 Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | v18+ | JavaScript runtime |
| **Express.js** | v5.x | Web server framework |
| **MongoDB** | — | Database for storing scan results |
| **Mongoose** | v9.x | MongoDB ODM |
| **Multer** | v2.x | Image upload handling (memory storage) |
| **dotenv** | v17.x | Environment variable management |
| **cors** | v2.x | Cross-Origin Resource Sharing |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | v18+ | UI framework |
| **Vite** | v5+ | Build tool and dev server |
| **React Router DOM** | v6+ | Client-side routing |
| **Lucide React** | — | Icon library |
| **Vanilla CSS** | — | Styling with glassmorphism design |

### External APIs

| Service | Purpose |
|---|---|
| **Hugging Face Router API** | AI model inference via `router.huggingface.co` |

---

## 📁 Project Structure

```
Sindhu/
├── backend/
│   ├── .env                    # Environment variables (API keys, DB URI)
│   ├── package.json            # Node.js dependencies and scripts
│   ├── server.js               # Main Express server with all API logic
│   ├── test_api.js             # API test utility
│   └── test_direct_api.js      # Direct HF Router API test utility
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Upload.jsx      # Drag-and-drop image upload component
    │   ├── pages/
    │   │   ├── Home.jsx        # Landing page with upload trigger
    │   │   └── Results.jsx     # Results display page (routines, profile)
    │   ├── App.jsx             # Root component with routing
    │   ├── index.css           # CSS variables and base styles
    │   └── main.jsx            # React entry point
    ├── index.html
    └── package.json
```

---

## 🤖 AI Models Used

### 1. Skin Type Detection

- **Model**: `dima806/skin_types_image_detection`
- **Architecture**: Vision Transformer (ViT)
- **Labels**: `Dry`, `Normal`, `Oily`
- **Anti-Bias Logic**: If "Oily" is predicted with < 50% confidence, the system checks the second-best prediction to reduce over-prediction bias.

### 2. Acne Severity Detection

- **Model**: `imfarzanansari/skintelligent-acne`
- **Architecture**: CNN-based classifier

| Raw Label | Decoded Severity |
|---|---|
| `level -1` | Clear Skin |
| `level 0` | Occasional Spots |
| `level 1` | Mild Acne |
| `level 2` | Moderate Acne |
| `level 3` | Severe Acne |
| `level 4` | Very Severe Acne |

Both models are called **in parallel** using `Promise.allSettled()` to minimize response time.

---

## 🔌 API Endpoints

### `POST /api/analyze`

Analyzes an uploaded facial image and returns a full skincare profile.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `image` (file field)

**Response (200 OK):**

```json
{
  "skinType": {
    "label": "Oily",
    "score": 0.82,
    "details": {
      "characteristics": ["Excess sebum production", "..."],
      "goals": ["Control oil without stripping moisture", "..."]
    }
  },
  "acneLevel": {
    "label": "Mild Acne",
    "score": 0.71,
    "details": {
      "status": "Mild Congestion",
      "implications": ["Occasional whiteheads", "..."],
      "tips": ["Use salicylic acid", "..."]
    }
  },
  "routine": {
    "am": [
      { "step": "Cleanser", "product": "Salicylic Acid (BHA) Cleanser", "reason": "Deep cleans pores." }
    ],
    "pm": [
      { "step": "Cleanser", "product": "Foaming Gel Cleanser", "reason": "Removes sunscreen and impurities." }
    ],
    "weekly": [
      { "step": "Exfoliant", "product": "BHA Exfoliant", "frequency": "2-3x per week", "reason": "Unclogs pores." }
    ]
  }
}
```

**Error Responses:**

| Status | Meaning |
|---|---|
| `400` | No image uploaded |
| `500` | AI analysis failed |
| `503` | Model is loading — retry in 30 seconds |

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
# Hugging Face API Key (required for AI model inference)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/skincare-ai

# Server Port (optional, defaults to 5000)
PORT=5000
```

### Getting a Hugging Face API Key

1. Go to [huggingface.co](https://huggingface.co) and create a free account
2. Navigate to **Settings → Access Tokens**
3. Click **New Token**, select **Read** permission
4. Copy the token and paste it as `HUGGINGFACE_API_KEY`

---

## 🚀 How to Run the Project

### Prerequisites

- **Node.js** v18 or higher — [Download here](https://nodejs.org)
- **MongoDB** running locally (or a MongoDB Atlas URI)
- A **Hugging Face API Key** (free)

---

### Step 1 — Set Up the Backend

```bash
cd backend
npm install
npm start
```

The backend will start on **http://localhost:5000**

You should see:
```
MongoDB connected
Server running on port 5000
```

---

### Step 2 — Set Up the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

---

### Step 3 — Use the Application

1. Open **http://localhost:5173** in your browser
2. Upload a clear, front-facing facial photo
3. Wait 5–15 seconds for AI analysis
4. View your personalized skin profile and routine!

---

> ⚠️ You need **two terminals** running simultaneously — one for backend, one for frontend.

---

## ⚙️ How It Works

```
User uploads photo
        ↓
Frontend sends image to POST /api/analyze
        ↓
Backend receives image buffer via Multer
        ↓
Two parallel API calls to Hugging Face:
  ├── dima806/skin_types_image_detection  →  Oily / Dry / Normal
  └── imfarzanansari/skintelligent-acne  →  Level -1 to Level 4
        ↓
Results processed:
  ├── Anti-bias check on skin type
  ├── Acne level decoded (e.g., "level 1" → "Mild Acne")
  ├── Structured profile details generated
  └── AM + PM + Weekly routine generated
        ↓
Scan saved to MongoDB
        ↓
JSON response sent to frontend → Results page rendered
```

---

## 🧴 Recommendation Logic

### Cleanser

| Skin Type | AM Cleanser | PM Cleanser |
|---|---|---|
| Oily | Salicylic Acid (BHA) Cleanser | Foaming Gel Cleanser |
| Dry | Hydrating Cream Cleanser | Oil-based Balm Cleanser |
| Normal | Gentle pH-Balanced Cleanser | Micellar Water + Gentle Cleanser |

### Treatment / Serum

| Acne Severity | AM Treatment | PM Treatment |
|---|---|---|
| Moderate / Severe | Niacinamide + Zinc Serum | Benzoyl Peroxide or Adapalene |
| Mild / Occasional | Vitamin C Serum | Salicylic Acid Spot Treatment |
| Clear | Antioxidant Serum (Vit C) | Hyaluronic Acid Serum |

### Weekly Treatments

| Skin Type | Exfoliant | Mask |
|---|---|---|
| Oily / Acne-prone | BHA Exfoliant (2-3x/week) | Clay Mask (1-2x/week) |
| Dry | AHA Exfoliant (1-2x/week) | Hyaluronic Acid Sheet Mask (2x/week) |
| Normal | AHA/BHA Combo (2x/week) | Vitamin C or Turmeric Mask (1x/week) |

---

## 🗄 Database Schema

```javascript
const ScanSchema = new mongoose.Schema({
  imageName: String,        // Original filename of uploaded image
  skinType: Object,         // { label, score, details }
  acneLevel: Object,        // { label, score, details }
  recommendations: Array,   // AM + PM routine array
  createdAt: { type: Date, default: Date.now }
});
```

---

## 🖥 Frontend Pages

### `Home.jsx` — Landing Page
- Hero section with app title and description
- Upload trigger button

### `Upload.jsx` — Upload Component
- Drag-and-drop image upload with preview
- Sends image to backend API
- Navigates to Results page with response data

### `Results.jsx` — Results Page

**Left Column (Sticky):**
- Uploaded image preview
- Skin Type with confidence badge, characteristics, and goals
- Acne Severity with confidence badge, observations, and expert tips

**Right Column:**
- ☀️ Morning Routine (numbered steps)
- 🌙 Evening Routine (numbered steps)
- 📅 Weekly Treatments (with frequency pill badges)

---

## ⚠️ Known Limitations

1. **Model Bias** — `dima806` tends to over-predict "Oily". An anti-bias threshold (< 50% confidence) has been implemented as a workaround.
2. **Model Loading Time** — Free-tier HF models may take 20–30 seconds to warm up on first request. If you get a 503 error, wait 30 seconds and retry.
3. **Image Quality** — Best results with clear, well-lit, front-facing photos.
4. **No Authentication** — All scans are currently anonymous (no user login).
5. **Not Medical Advice** — For cosmetic/educational purposes only.

---

## 🔮 Future Improvements

- [ ] User authentication to track personal scan history
- [ ] Integrate skin condition model (Rosacea, Eczema detection)
- [ ] Product brand recommendations with links
- [ ] Skin progress tracker (compare scans over time)
- [ ] Mobile-responsive design improvements
- [ ] Deploy to cloud (Render + Vercel)

---

*Built with ❤️ using React, Node.js, Express, MongoDB, and Hugging Face AI*