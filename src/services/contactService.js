const OMEGA_CONTACT_STORAGE_KEY = "omegaLastContactMessage";

export const saveContactMessage = (message) => {
    const payload = {
        ...message,
        createdAt: new Date().toISOString()
    };

    localStorage.setItem(OMEGA_CONTACT_STORAGE_KEY, JSON.stringify(payload));
    return payload;
};

export const readLastContactMessage = () => {
    const rawMessage = localStorage.getItem(OMEGA_CONTACT_STORAGE_KEY);

    if (!rawMessage) {
        return null;
    }

    try {
        return JSON.parse(rawMessage);
    } catch (error) {
        localStorage.removeItem(OMEGA_CONTACT_STORAGE_KEY);
        return null;
    }
};
