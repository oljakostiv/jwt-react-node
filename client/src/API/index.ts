import axios from 'axios';
import {AuthResponse} from "../models/response/AuthResponse";

export const API_URL = 'http://localhost:5000/api';

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
});

$api.interceptors.request.use((config: any) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
});

$api.interceptors.response.use((config: any) => {
    return config;
}, (async error => {
    const newRequest = error.config;

    if (error.response.status === 401 && error.config && !error._isRetry) {
        newRequest._isRetry = true;

        try {
            const response = await axios.get<AuthResponse>(
                `${API_URL}/refresh`, {withCredentials: true}
            );
            localStorage.setItem('token', response.data.accessToken);

            return $api.request(newRequest);
        } catch (e) {
            console.log(e);
        }
    }

    throw error;
}));

export default $api;
