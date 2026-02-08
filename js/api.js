// API Client for Journal Backend
const API_BASE_URL = 'https://adamcarrilloxyz-production-1ec2.up.railway.app/api';

/**
 * Get JWT token from localStorage
 */
function getToken() {
    return localStorage.getItem('jwt_token');
}

/**
 * Get current username from localStorage
 */
function getUsername() {
    return localStorage.getItem('username');
}

/**
 * Save authentication data
 */
function saveAuth(token, username) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('username', username);
}

/**
 * Clear authentication data
 */
function clearAuth() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!getToken();
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            // Handle 401 Unauthorized
            if (response.status === 401) {
                clearAuth();
                window.location.href = '/index.html';
            }
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Auth API
const AuthAPI = {
    register: async (username, password) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            skipAuth: true
        });
    },

    login: async (username, password) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            skipAuth: true
        });
        if (data.token) {
            saveAuth(data.token, data.username);
        }
        return data;
    },

    logout: () => {
        clearAuth();
        window.location.href = '/index.html';
    }
};

// Entries API
const EntriesAPI = {
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/entries${queryString ? '?' + queryString : ''}`);
    },

    getById: async (id) => {
        return apiRequest(`/entries/${id}`);
    },

    create: async (title, content, tags = []) => {
        return apiRequest('/entries', {
            method: 'POST',
            body: JSON.stringify({ title, content, tags })
        });
    },

    update: async (id, title, content, tags = []) => {
        return apiRequest(`/entries/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, content, tags })
        });
    },

    delete: async (id) => {
        return apiRequest(`/entries/${id}`, {
            method: 'DELETE'
        });
    }
};

// Tags API
const TagsAPI = {
    getAll: async () => {
        return apiRequest('/tags');
    }
};
