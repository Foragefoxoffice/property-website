const ErrorResponse = require("./errorResponse");

exports.protectedDelete = async ({
    item,
    linkedCollections = [],
}) => {
    if (!item) throw new ErrorResponse("Record not found", 404);

    for (const link of linkedCollections) {
        const count = await link.model.countDocuments(link.where);

        if (count > 0) {
            throw new ErrorResponse(
                link.errorMsg ||
                "Cannot delete this item because related records exist.",
                400
            );
        }
    }
};
