/**
 * Utility to map backend error strings to their respective translation keys.
 * This helps in localizing errors that are returned as plain strings 
 * from the backend while keeping the frontend code clean.
 */

export const translateError = (errorMsg, t) => {
    if (!errorMsg) return null;

    // Mapping of dynamic backend strings to translation keys in translations.jsx
    const errorMapping = {
        // Projects / Communities
        "Cannot delete project. It is used in existing Property Listings.": t.errorProjectUsed,
        "Cannot delete project because Zone & Block exist.": t.errorProjectHasZones,
        "A Project with this name already exists.": t.errorProjectExists,
        "Cannot delete this master data because it is present in a created property. Delete the property first.": t.errorMasterDataUsed,

        // Roles
        "Role is assigned to users. Cannot delete.": t.errorRoleAssigned,
        "A role with this name already exists.": t.errorRoleExists,

        // Categories
        "A category with this name already exists.": t.errorCategoryExists,
        "Category is assigned to blogs. Cannot delete.": t.errorCategoryUsed,
        "Cannot delete category because it has posts assigned to it.": t.errorCategoryUsed,

        // Common Validations
        "All fields are required": t.allFieldsRequired,
        "Email already exists": t.errorEmailExists,
        "Staff not found": t.errorStaffNotFound,
        "Cannot update Super Admin staff": t.errorCannotUpdateSuperAdmin,
        "Cannot delete Super Admin staff": t.errorCannotDeleteSuperAdmin,
        "Required fields missing": t.requiredFieldsMissing,
    };

    // Return the translated string if a match is found
    if (errorMapping[errorMsg]) return errorMapping[errorMsg];

    // Handle dynamic messages (e.g., messages with counts)
    if (errorMsg.includes("Cannot delete role") && errorMsg.includes("assigned to this role")) {
        return t.errorRoleAssigned;
    }

    // Fallback to original message
    return errorMsg;
};
