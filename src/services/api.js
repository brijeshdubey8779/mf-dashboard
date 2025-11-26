import axios from 'axios';

const BASE_URL = 'https://api.mfapi.in/mf';

export const searchMutualFunds = async (query) => {
    try {
        const response = await axios.get(`${BASE_URL}/search?q=${query}`);
        return response.data;
    } catch (error) {
        console.error('Error searching mutual funds:', error);
        return [];
    }
};

export const getMutualFundDetails = async (code) => {
    try {
        const response = await axios.get(`${BASE_URL}/${code}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching mutual fund details:', error);
        return null;
    }
};
