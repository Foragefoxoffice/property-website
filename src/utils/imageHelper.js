export const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"; // Default placeholder

    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }

    const baseURL = import.meta.env.VITE_API_URL || 'https://dev.placetest.in/api/v1';
    // Remove /api/v1 to get the base server URL
    const serverURL = baseURL.replace('/api/v1', '');

    return `${serverURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
