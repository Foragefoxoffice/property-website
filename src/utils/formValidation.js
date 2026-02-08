import { CommonToaster } from '../Common/CommonToaster';

export const validateVietnameseFields = (values) => {
    const isVietnameseField = (key) => key.endsWith('_vn');

    // Helper to recursively check for empty Vietnamese fields
    const hasEmptyVietnamese = (obj) => {
        if (!obj) return false;

        if (Array.isArray(obj)) {
            return obj.some(item => hasEmptyVietnamese(item));
        }

        if (typeof obj === 'object') {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (isVietnameseField(key)) {
                        const value = obj[key];
                        // Check if value is empty string or null/undefined (allow 0)
                        if (value === '' || value === null || value === undefined) {
                            return true;
                        }
                    }
                    // Recursive check for nested objects/arrays
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        if (hasEmptyVietnamese(obj[key])) return true;
                    }
                }
            }
        }
        return false;
    };

    if (hasEmptyVietnamese(values)) {
        CommonToaster('Please fill in all Vietnamese fields', 'error');
        return false;
    }
    return true;
};

export const onFormFinishFailed = ({ errorFields }) => {
    const isVietnameseError = errorFields.some(field =>
        field.name.some(namePart => typeof namePart === 'string' && namePart.endsWith('_vn'))
    );

    if (isVietnameseError) {
        CommonToaster('Please fill in all Vietnamese fields', 'error');
    }
};
