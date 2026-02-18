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

**AuraSkin AI** is a full-stack web application that allows users to upload a facial photograph and receive an AI-powered skincare analysis. The system identifies the user's skin type (Oily, Dry, or Normal) and acne severity level (Clear to Very Severe), then generates a detailed, personalized skincare routine including:

- **Morning (AM) Routine** — Protection and prevention steps
- **Evening (PM) Routine** — Repair and treatment steps
- **Weekly Treatments** — Targeted masks and exfoliants with frequency guidance

The application also provides a rich **Skin Profile** section with characteristics, goals, clinical observations, and expert tips tailored to the user's specific skin condition.

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
| **@huggingface/inference** | v4.x | Hugging Face SDK (installed but using direct fetch) |

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
    ├── public/
    ├── src/
    │   ├── api/                # API call utilities
    │   ├── assets/             # Static assets
    │   ├── components/
    │   │   └── Upload.jsx      # Drag-and-drop image upload component
    │   ├── pages/
    │   │   ├── Home.jsx        # Landing page with upload trigger
    │   │   └── Results.jsx     # Results display page (routines, profile)
    │   ├── App.jsx             # Root component with routing
    │   ├── App.css             # Global app styles
    │   ├── index.css           # CSS variables and base styles
    │   └── main.jsx            # React entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🤖 AI Models Used

### 1. Skin Type Detection
- **Model**: `dima806/skin_types_image_detection`
- **Architecture**: Vision Transformer (ViT)
- **Labels**: `Dry`, `Normal`, `Oily`
- **API**: Hugging Face Router API (Image Classification)
- **Anti-Bias Logic**: If "Oily" is predicted with < 50% confidence, the system checks the second-best prediction and may use it instead to reduce over-prediction bias.

### 2. Acne Severity Detection
- **Model**: `imfarzanansari/skintelligent-acne`
- **Architecture**: CNN-based classifier
- **Labels**:
  | Raw Label | Decoded Severity |
  |---|---|
  | `level -1` | Clear Skin |
  | `level 0` | Occasional Spots |
  | `level 1` | Mild Acne |
  | `level 2` | Moderate Acne |
  | `level 3` | Severe Acne |
  | `level 4` | Very Severe Acne |
- **API**: Hugging Face Router API (Image Classification)

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
      { "step": "Cleanser", "product": "Salicylic Acid (BHA) Cleanser", "reason": "Deep cleans pores and removes excess oil." },
      { "step": "Treatment", "product": "Vitamin C Serum", "reason": "Brightens acne scars and protects skin." },
      { "step": "Moisturizer", "product": "Oil-Free Gel Moisturizer", "reason": "Hydrates without clogging pores." },
      { "step": "Sunscreen", "product": "SPF 50+ Broad Spectrum", "reason": "Essential UV protection." }
    ],
    "pm": [
      { "step": "Cleanser", "product": "Foaming Gel Cleanser", "reason": "Thoroughly removes sunscreen and impurities." },
      { "step": "Treatment", "product": "Salicylic Acid Spot Treatment", "reason": "Target specific spots as needed." },
      { "step": "Moisturizer", "product": "Lightweight Night Gel", "reason": "Repairs skin barrier overnight." }
    ],
    "weekly": [
      { "step": "Exfoliant", "product": "BHA (Salicylic Acid) Exfoliant", "frequency": "2-3x per week", "reason": "Unclogs pores." },
      { "step": "Clay Mask", "product": "Kaolin or Bentonite Clay Mask", "frequency": "1-2x per week", "reason": "Controls oil." }
    ]
  },
  "recommendations": [...],
  "fullResults": { "skinType": [...], "acne": [...] }
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

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Hugging Face API Key (required for AI model inference)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/skincare-ai

# Server Port (optional, defaults to 5000)
PORT=5000
```

### Getting a Hugging Face API Key:
1. Go to [huggingface.co](https://huggingface.co) and create a free account.
2. Navigate to **Settings → Access Tokens**.
3. Click **New Token**, give it a name, and select **Read** permission.
4. Copy the token and paste it as `HUGGINGFACE_API_KEY` in your `.env` file.

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js** v18 or higher — [Download here](https://nodejs.org)
- **MongoDB** running locally (or a MongoDB Atlas connection string)
- A **Hugging Face API Key** (free)

---

### Step 1: Clone / Download the Project

```bash
# If using git
git clone <your-repo-url>
cd Sindhu
```

---

### Step 2: Set Up the Backend

```bash
# Navigate to the backend folder
cd backend

# Install all dependencies
npm install

# Create the environment file
# Create a file named .env in the backend folder and add:
# HUGGINGFACE_API_KEY=hf_your_key_here
# MONGODB_URI=mongodb://localhost:27017/skincare-ai

# Start the backend server
npm start
```

The backend will start on **http://localhost:5000**

You should see:
```
MongoDB connected
Server running on port 5000
```

---

### Step 3: Set Up the Frontend

Open a **new terminal window** and run:

```bash
# Navigate to the frontend folder
cd frontend

# Install all dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will start on **http://localhost:5173**

---

### Step 4: Use the Application

1. Open your browser and go to **http://localhost:5173**
2. Click **"Analyze My Skin"** or drag and drop a clear facial photo
3. Wait for the AI to analyze your image (5–15 seconds)
4. View your personalized skin profile and routine!

---

### Running Both Servers Simultaneously

You need **two terminal windows** open at the same time:

| Terminal | Directory | Command |
|---|---|---|
| Terminal 1 (Backend) | `Sindhu/backend` | `npm start` |
| Terminal 2 (Frontend) | `Sindhu/frontend` | `npm run dev` |

---

## ⚙️ How It Works

```
User uploads photo
        ↓
Frontend sends image to POST /api/analyze (multipart/form-data)
        ↓
Backend receives image buffer via Multer
        ↓
Two parallel API calls to Hugging Face Router:
  ├── dima806/skin_types_image_detection  → Oily / Dry / Normal
  └── imfarzanansari/skintelligent-acne  → Level -1 to Level 4
        ↓
Results processed:
  ├── Anti-bias check on skin type (if Oily < 50% confidence → use 2nd best)
  ├── Acne level decoded (e.g., "level 1" → "Mild Acne")
  ├── Structured profile details generated (characteristics, goals, tips)
  └── AM + PM + Weekly routine generated based on skin type + acne combo
        ↓
Scan saved to MongoDB
        ↓
JSON response sent to frontend
        ↓
Results.jsx renders:
  ├── Skin Profile (with confidence badges)
  ├── Morning Routine
  ├── Evening Routine
  └── Weekly Treatments
```

---

## 🧴 Recommendation Logic

The routine is generated by combining **skin type** and **acne severity**:

### Cleanser Selection
| Skin Type | AM Cleanser | PM Cleanser |
|---|---|---|
| Oily | Salicylic Acid (BHA) Cleanser | Foaming Gel Cleanser |
| Dry | Hydrating Cream Cleanser | Oil-based Balm Cleanser |
| Normal | Gentle pH-Balanced Cleanser | Micellar Water + Gentle Cleanser |

### Treatment/Serum Selection
| Acne Severity | AM Treatment | PM Treatment |
|---|---|---|
| Moderate / Severe | Niacinamide + Zinc Serum | Benzoyl Peroxide or Adapalene |
| Mild / Occasional | Vitamin C Serum | Salicylic Acid Spot Treatment |
| Clear | Antioxidant Serum (Vit C) | Hyaluronic Acid Serum |

### Moisturizer Selection
| Skin Type | AM Moisturizer | PM Moisturizer |
|---|---|---|
| Oily | Oil-Free Gel Moisturizer | Lightweight Night Gel |
| Dry | Rich Ceramide Cream | Thick Sleeping Mask/Cream |
| Normal | Daily Lotion | Nourishing Night Cream |

### Weekly Treatments
| Skin Type / Condition | Exfoliant | Mask |
|---|---|---|
| Oily or Acne-prone | BHA Exfoliant (2-3x/week) | Clay Mask (1-2x/week) |
| Dry | AHA Exfoliant (1-2x/week) | Hyaluronic Acid Sheet Mask (2x/week) |
| Normal | AHA/BHA Combo (2x/week) | Vitamin C or Turmeric Mask (1x/week) |

---

## 🗄 Database Schema

Scans are saved to MongoDB using the following Mongoose schema:

```javascript
const ScanSchema = new mongoose.Schema({
  imageName: String,        // Original filename of uploaded image
  skinType: Object,         // { label, score, details }
  acneLevel: Object,        // { label, score, details }
  recommendations: Array,   // Flattened AM + PM routine array
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

---

## 🖥 Frontend Pages

### `Home.jsx` — Landing Page
- Hero section with app title and description
- Upload trigger button
- Integrates the `Upload.jsx` component

### `Upload.jsx` — Upload Component
- Drag-and-drop image upload
- Image preview before submission
- Sends image to backend API
- Navigates to Results page with response data

### `Results.jsx` — Results Page
- **Left Column (Sticky)**:
  - Uploaded image preview
  - Skin Profile card with:
    - Skin Type + confidence badge
    - Characteristics list
    - Goals list
    - Acne Severity + confidence badge
    - Observations list
    - Expert Tips list
- **Right Column**:
  - Morning Routine (numbered steps)
  - Evening Routine (numbered steps)
  - Weekly Treatments (with frequency badges)

---

## ⚠️ Known Limitations

1. **Model Bias**: The `dima806` skin type model tends to over-predict "Oily". An anti-bias threshold has been implemented (< 50% confidence triggers fallback), but results may still lean oily.
2. **Model Loading Time**: Hugging Face free-tier models may take 20–30 seconds to "warm up" on the first request. If you get a 503 error, wait 30 seconds and try again.
3. **Image Quality**: The AI models perform best with clear, well-lit, front-facing facial photos. Blurry or side-profile images may give inaccurate results.
4. **No Authentication**: The app currently has no user login system. All scans are anonymous.
5. **Not Medical Advice**: This application is for cosmetic/educational purposes only and should not be used as a substitute for professional dermatological advice.

---

## 🔮 Future Improvements

- [ ] Add user authentication (login/signup) to track personal scan history
- [ ] Integrate a more accurate skin condition model (e.g., Rosacea, Eczema detection)
- [ ] Add product brand recommendations with affiliate links
- [ ] Implement a skin progress tracker (compare scans over time)
- [ ] Add a "Skin Quiz" fallback if the AI model is unavailable
- [ ] Mobile-responsive design improvements
- [ ] Deploy to cloud (Render for backend, Vercel for frontend)
- [ ] Add multi-language support

---

## 📄 License

This project is for educational purposes. All AI models are used via the Hugging Face Inference API under their respective licenses.

---

*Built with ❤️ using React, Node.js, Express, MongoDB, and Hugging Face AI*
#   s i n d h u  
 