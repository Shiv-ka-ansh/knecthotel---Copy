const mongoose = require("mongoose");
const ApiError = require("./ApiError");

function assertValidObjectId(id, msg = "Invalid id") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, msg);
    }
}

function formatTime(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

}

function sanitizeUpdates(updates, nonEditable) {
    if (!updates || typeof updates !== "object") return {};
    const safe = { ...updates };
    nonEditable.forEach((f) => { if (f in safe) delete safe[f]; });
    return safe;
}

module.exports = {
    assertValidObjectId,
    formatTime,
    sanitizeUpdates,
};
