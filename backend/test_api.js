
require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const SKIN_TYPE_MODEL = 'anismizi/skin-type-classifier';

async function testConnection() {
    console.log('Testing Hugging Face API Connection...');
    console.log('API Key present:', !!process.env.HUGGINGFACE_API_KEY);
    if (process.env.HUGGINGFACE_API_KEY) {
        console.log('API Key length:', process.env.HUGGINGFACE_API_KEY.length);
        console.log('API Key start:', process.env.HUGGINGFACE_API_KEY.substring(0, 5));
    }

    try {
        // We'll try to fetch the model info or just run inference with dummy data
        // Running with empty data might throw 400, but confirms connection.
        // Actually, let's try to get model info if possible? HfInference doesn't have explicit getModelInfo.
        // We will send a fetch request to the model's info page to check if it exists/is accessible.

        const response = await fetch(`https://huggingface.co/api/models/${SKIN_TYPE_MODEL}`, {
            headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Model Info Fetch: SUCCESS');
            console.log('Model ID:', data.modelId);
            console.log('Pipeline Tag:', data.pipeline_tag);
        } else {
            console.error('Model Info Fetch Failed:', response.status, response.statusText);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testConnection();
