
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SKIN_MODEL = 'dima806/skin_types_image_detection';
const ACNE_MODEL = 'imfarzanansari/skintelligent-acne';
const CONDITION_MODEL = 'Tanishq77/skin-condition-classifier';
const API_URL_SKIN = `https://router.huggingface.co/hf-inference/models/${SKIN_MODEL}`;
const API_URL_ACNE = `https://router.huggingface.co/hf-inference/models/${ACNE_MODEL}`;
const API_URL_CONDITION = `https://router.huggingface.co/hf-inference/models/${CONDITION_MODEL}`;

async function query(url, data) {
    console.log(`Querying ${url}...`);
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/octet-stream",
            },
            method: "POST",
            body: data,
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        if (!response.ok) {
            const err = await response.text();
            console.log('Error Body:', err);
            return null;
        }
        const result = await response.json();
        return result;
    } catch (err) {
        console.error("Fetch error:", err.message);
        return null;
    }
}

// Create a dummy image buffer (1x1 pixel png) or read a file if exists
// Simple 1x1 TRANSPARENT PNG base64
const DUMMY_IMAGE_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const imageBuffer = Buffer.from(DUMMY_IMAGE_B64, 'base64');

async function test() {
    console.log("Testing Direct API Access...");

    console.log("\n--- Testing Skin Model ---");
    const skinRes = await query(API_URL_SKIN, imageBuffer);
    console.log("Skin Result:", JSON.stringify(skinRes, null, 2));

    console.log("\n--- Testing Acne Model ---");
    const acneRes = await query(API_URL_ACNE, imageBuffer);
    console.log("Acne Result:", JSON.stringify(acneRes, null, 2));

    console.log("\n--- Testing Condition Model (Tanishq77) ---");
    const conditionRes = await query(API_URL_CONDITION, imageBuffer);
    console.log("Condition Result:", JSON.stringify(conditionRes, null, 2));
}

test();
