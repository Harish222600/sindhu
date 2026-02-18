
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const analyzeImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/analyze', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
