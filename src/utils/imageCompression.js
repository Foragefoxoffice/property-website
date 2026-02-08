/**
 * Compress an image file to reduce its size while maintaining quality
 * @param {File} file - The image file to compress
 * @param {number} maxSizeKB - Maximum size in KB (default: 500KB)
 * @param {number} quality - Compression quality 0-1 (default: 0.8)
 * @returns {Promise<string>} - Base64 encoded compressed image
 */
export async function compressImage(file, maxSizeKB = 500, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Calculate new dimensions to maintain aspect ratio
                const maxDimension = 1920; // Max width or height
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Try to compress to target size
                let currentQuality = quality;
                let compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality);

                // If still too large, reduce quality further
                while (compressedBase64.length > maxSizeKB * 1024 * 1.37 && currentQuality > 0.1) {
                    currentQuality -= 0.1;
                    compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality);
                }

                resolve(compressedBase64);
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Calculate the size of a base64 string in bytes
 * @param {string} base64String - The base64 encoded string
 * @returns {number} - Size in bytes
 */
export function getBase64Size(base64String) {
    const base64Length = base64String.length - (base64String.indexOf(',') + 1);
    const padding = (base64String.charAt(base64String.length - 2) === '=') ? 2 : ((base64String.charAt(base64String.length - 1) === '=') ? 1 : 0);
    return base64Length * 0.75 - padding;
}

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
