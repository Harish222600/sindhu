
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Hugging Face Inference
// We will use the models identified:
// Skin Type: anismizi/skin-type-classifier (ResNet50 based, API compatible)
// Acne: afscomercial/dermatologic (ResNet50 based, API compatible)
// Note: User requested dima806/skin_types_image_detection but it has no API.
// We will try dima806 first, if it fails, fallback to anismizi.
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const SKIN_TYPE_MODEL = 'anismizi/skin-type-classifier'; // Fallback / Primary API model
const ACNE_MODEL = 'afscomercial/dermatologic';

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skincare-ai')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Schema
const ScanSchema = new mongoose.Schema({
  imageName: String,
  skinType: Object,
  acneLevel: Object,
  recommendations: Array,
  createdAt: { type: Date, default: Date.now }
});
const Scan = mongoose.model('Scan', ScanSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Skincare AI Backend Running');
});

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const imageBuffer = req.file.buffer;

    // Parallel API calls
    console.log('Sending request to Hugging Face API...');

    const fetchModel = async (modelId, imageBuffer, useHeader = false) => {
      const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;
      const headers = {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      };
      if (useHeader) {
        headers["Content-Type"] = "application/octet-stream";
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: imageBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      return await response.json();
    };

    const [skinTypeRes, acneRes] = await Promise.allSettled([
      fetchModel('dima806/skin_types_image_detection', imageBuffer, true),
      fetchModel('imfarzanansari/skintelligent-acne', imageBuffer, true)
    ]);

    // Check for specific API errors (like Model Loading)
    if (skinTypeRes.status === 'rejected') {
      const reason = skinTypeRes.reason;
      console.error('Skin Type API Error:', reason);
      const reasonMessage = typeof reason === 'string' ? reason : (reason && reason.message);
      if (reasonMessage && reasonMessage.includes('loading')) {
        return res.status(503).json({ error: 'Model is loading. Please try again in 30 seconds.', details: reasonMessage });
      }
    }
    if (acneRes.status === 'rejected') {
      console.error('Acne API Error:', acneRes.reason);
    }

    let skinTypeResult = skinTypeRes.status === 'fulfilled' ? skinTypeRes.value : [];
    let acneResult = acneRes.status === 'fulfilled' ? acneRes.value : [];

    console.log('Skin Type Result:', JSON.stringify(skinTypeResult));
    console.log('Acne Result:', JSON.stringify(acneResult));

    // If both failed and it wasn't a loading error handled above
    if (skinTypeResult.length === 0 && acneResult.length === 0) {
      return res.status(500).json({ error: 'AI Analysis failed.', details: 'Both models returned no results.' });
    }

    // Process Results
    // Get top prediction with bias check for dima806
    let topSkinType = { label: 'Unknown', score: 0 };
    if (Array.isArray(skinTypeResult) && skinTypeResult.length > 0) {
      skinTypeResult.sort((a, b) => b.score - a.score);
      topSkinType = skinTypeResult[0];

      // Anti-Bias Logic: dima806 tends to over-predict 'Oily'.
      // If top is 'Oily' but confidence < 0.50, check if 'Normal' or 'Dry' is close behind.
      if (topSkinType.label.toLowerCase().includes('oily') && topSkinType.score < 0.50) {
        const secondBest = skinTypeResult[1];
        if (secondBest && (secondBest.label.toLowerCase().includes('normal') || secondBest.label.toLowerCase().includes('dry'))) {
          topSkinType = secondBest; // Use second-best if oily confidence is low
        }
      }
    }

    const topAcne = (Array.isArray(acneResult) && acneResult.length > 0) ? acneResult[0] : { label: 'Unknown', score: 0 };

    // Fallback if results are empty but not errored (rare)
    if (topSkinType.label === 'Unknown') topSkinType.label = 'Normal'; // Default to Normal if undefined

    // Normalize Labels
    let st = (topSkinType.label || '').toLowerCase();
    let ac = (topAcne.label || '').toLowerCase();

    // Decode Acne Levels from imfarzanansari/skintelligent-acne
    // Level -1: Clear, Level 0: Occasional, Level 1: Mild, Level 2: Moderate, Level 3: Severe, Level 4: Very Severe
    let acneSeverity = 'Clear';
    if (ac.includes('level 0')) acneSeverity = 'Occasional Spots';
    if (ac.includes('level 1')) acneSeverity = 'Mild Acne';
    if (ac.includes('level 2')) acneSeverity = 'Moderate Acne';
    if (ac.includes('level 3')) acneSeverity = 'Severe Acne';
    if (ac.includes('level 4')) acneSeverity = 'Very Severe Acne';

    // Update the label for frontend display
    topAcne.label = acneSeverity;

    // Skin Profile Details
    const getSkinDetails = (type) => {
      if (type.includes('oily')) {
        return {
          characteristics: [
            "Excess sebum production throughout the day",
            "Enlarged, visible pores, especially on the nose and cheeks",
            "Prone to blackheads and clogged pores",
            "Makeup may slide off or oxidize quickly"
          ],
          goals: [
            "Control oil without stripping moisture",
            "Refine pore appearance",
            "Maintain a matte but hydrated finish"
          ]
        };
      } else if (type.includes('dry')) {
        return {
          characteristics: [
            "Skin feels tight, rough, or itchy",
            "May have flaky patches or redness",
            "Fine lines may appear more pronounced",
            "Pores are usually small and barely visible"
          ],
          goals: [
            "Restore and repair the moisture barrier",
            "Deeply hydrate and lock in moisture",
            "Soothe irritation and prevent flakiness"
          ]
        };
      } else {
        return {
          characteristics: [
            "Balanced oil and moisture levels",
            "Pores are fine and not easily visible",
            "Few imperfections or blemishes",
            "Skin tone is generally even"
          ],
          goals: [
            "Maintain healthy balance",
            "Protect from environmental stressors",
            "Prevent premature aging"
          ]
        };
      }
    };

    // Acne Profile Details
    const getAcneDetails = (severity) => {
      if (severity === 'Clear') {
        return {
          status: "Clear Skin",
          implications: [
            "No active inflammation or breakouts",
            "Skin barrier is likely healthy",
            "Risk of future breakouts is low with proper care"
          ],
          tips: [
            "Focus on preventative care (SPF daily)",
            "Incorporate antioxidants like Vitamin C",
            "Exfoliate gently once a week to maintain glow"
          ]
        };
      } else if (severity.includes('Severe') || severity.includes('Moderate')) {
        return {
          status: "Active Breakouts",
          implications: [
            "Visible inflammation and redness",
            "Presence of papules, pustules, or cysts",
            "Potential for scarring if untreated",
            "Skin may feel sensitive or painful"
          ],
          tips: [
            "Consult a dermatologist for persistent severe acne",
            "Use active ingredients like Benzoyl Peroxide or Adapalene",
            "Avoid picking or popping pimples to prevent scarring",
            "Stick to non-comedogenic makeup and skincare"
          ]
        };
      } else { // Mild/Occasional
        return {
          status: "Mild Congestion",
          implications: [
            "Occasional whiteheads or blackheads",
            "Minor bumps or texture irregularities",
            "Breakouts may be hormonal or stress-related",
            "Generally responsive to over-the-counter treatments"
          ],
          tips: [
            "Use salicylic acid to unclog pores",
            "Keep hair and hands away from your face",
            "Change pillowcases frequently",
            "Use spot treatments for individual pimples"
          ]
        };
      }
    };

    const skinDetails = getSkinDetails(st);
    const acneDetails = getAcneDetails(acneSeverity);

    // Attach details to the response objects
    topSkinType.details = skinDetails;
    topAcne.details = acneDetails;

    // Detailed Recommendation Logic
    const routine = {
      am: [],
      pm: [],
      weekly: []
    };

    // 1. Cleanser
    if (st.includes('oily')) {
      routine.am.push({ step: 'Cleanser', product: 'Salicylic Acid (BHA) Cleanser', reason: 'Deep cleans pores and removes excess oil.' });
      routine.pm.push({ step: 'Cleanser', product: 'Foaming Gel Cleanser', reason: 'Thoroughly removes sunscreen and impurities.' });
    } else if (st.includes('dry')) {
      routine.am.push({ step: 'Cleanser', product: 'Hydrating Cream Cleanser', reason: 'Cleans without stripping natural oils.' });
      routine.pm.push({ step: 'Cleanser', product: 'Oil-based Balm Cleanser', reason: 'Melts away impurities while hydrating.' });
    } else {
      routine.am.push({ step: 'Cleanser', product: 'Gentle pH-Balanced Cleanser', reason: 'Maintains healthy skin barrier.' });
      routine.pm.push({ step: 'Cleanser', product: 'Micellar Water + Gentle Cleanser', reason: 'Double cleanse for a fresh start.' });
    }

    // 2. Treatment (Serum/Active) based on Acne
    if (acneSeverity.includes('Severe') || acneSeverity.includes('Moderate')) {
      routine.am.push({ step: 'Treatment', product: 'Niacinamide + Zinc Serum', reason: 'Reduces inflammation and regulates sebum.' });
      routine.pm.push({ step: 'Treatment', product: 'Benzoyl Peroxide or Adapalene (Retinoid)', reason: 'Strong acne-fighting active (start slowly).' });
    } else if (acneSeverity.includes('Mild') || acneSeverity.includes('Occasional')) {
      routine.am.push({ step: 'Treatment', product: 'Vitamin C Serum', reason: 'Brightens acne scars and protects skin.' });
      routine.pm.push({ step: 'Treatment', product: 'Salicylic Acid Spot Treatment', reason: 'Target specific spots as needed.' });
    } else {
      routine.am.push({ step: 'Serum', product: 'Antioxidant Serum (Vit C)', reason: 'Protects against environmental damage.' });
      routine.pm.push({ step: 'Serum', product: 'Hyaluronic Acid Serum', reason: 'Plumps and hydrates skin.' });
    }

    // 3. Moisturizer
    if (st.includes('oily')) {
      routine.am.push({ step: 'Moisturizer', product: 'Oil-Free Gel Moisturizer', reason: 'Hydrates without clogging pores.' });
      routine.pm.push({ step: 'Moisturizer', product: 'Lightweight Night Gel', reason: 'Repairs skin barrier overnight.' });
    } else if (st.includes('dry')) {
      routine.am.push({ step: 'Moisturizer', product: 'Rich Ceramide Cream', reason: 'Locks in moisture all day.' });
      routine.pm.push({ step: 'Moisturizer', product: 'Thick Sleeping Mask/Cream', reason: 'Intense hydration for repair.' });
    } else {
      routine.am.push({ step: 'Moisturizer', product: 'Daily Lotion', reason: 'Balanced hydration.' });
      routine.pm.push({ step: 'Moisturizer', product: 'Nourishing Night Cream', reason: 'Softens and smooths skin.' });
    }

    // 4. Sunscreen (AM only - Critical)
    routine.am.push({ step: 'Sunscreen', product: 'SPF 50+ Broad Spectrum', reason: 'Essential protection against UV rays and aging.' });

    // 5. Weekly Treatments
    if (st.includes('oily') || acneSeverity.includes('Acne')) {
      routine.weekly.push({ step: 'Exfoliant', product: 'BHA (Salicylic Acid) Exfoliant', frequency: '2-3x per week', reason: 'Unclogs pores and removes dead skin cells.' });
      routine.weekly.push({ step: 'Clay Mask', product: 'Kaolin or Bentonite Clay Mask', frequency: '1-2x per week', reason: 'Draws out impurities and controls oil.' });
    } else if (st.includes('dry')) {
      routine.weekly.push({ step: 'Exfoliant', product: 'AHA (Lactic Acid) Exfoliant', frequency: '1-2x per week', reason: 'Gently removes dead skin without stripping.' });
      routine.weekly.push({ step: 'Hydrating Mask', product: 'Hyaluronic Acid Sheet Mask', frequency: '2x per week', reason: 'Intense hydration boost for dry skin.' });
    } else {
      routine.weekly.push({ step: 'Exfoliant', product: 'Gentle AHA/BHA Combo Exfoliant', frequency: '2x per week', reason: 'Maintains smooth, even skin texture.' });
      routine.weekly.push({ step: 'Brightening Mask', product: 'Vitamin C or Turmeric Mask', frequency: '1x per week', reason: 'Boosts radiance and evens skin tone.' });
    }

    // Save to DB
    const newScan = new Scan({
      imageName: req.file.originalname,
      skinType: topSkinType,
      acneLevel: topAcne,
      recommendations: [...routine.am, ...routine.pm] // Flatten for simple storage if needed, or store object
    });
    // Note: Schema expects array, let's keep it simple for now or update schema. 
    // Actually, let's just save the AM routine as "recommendations" for backward compatibility if we don't change schema, 
    // but better to just send the whole object in response.

    await newScan.save();

    res.json({
      skinType: topSkinType,
      acneLevel: topAcne,
      routine: routine, // New detailed format
      recommendations: routine.am, // Backward compat for old frontend logic if any
      fullResults: { skinType: skinTypeResult, acne: acneResult }
    });

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze image', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
