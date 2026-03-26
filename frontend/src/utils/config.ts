// src/config.ts
export const getApiUrl = (): string => {
    const ip = localStorage.getItem('serverIP') || 'localhost';
    return `http://${ip}:5000/api`;
};

export const getSocketUrl = (): string => {
    const ip = localStorage.getItem('serverIP') || 'localhost';
    return `http://${ip}:5000`;
};

// da fare un js che regola il return dell'ip, durante testing uso localhost