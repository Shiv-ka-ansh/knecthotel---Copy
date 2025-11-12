const SwimmingPoolDetails = require('../../models/services/SwimmingPoolSlots');
const ApiError = require('../../utils/ApiError');

// Create new swimming pool details
exports.createSwimmingPoolDetails = async (req, res, next) => {
    try {
        const HotelId = req.user.HotelId;
        if (!HotelId) {
            throw new ApiError(403, "Invalid Access");
        }
        // Check if details already exist for this hotel
        const existing = await SwimmingPoolDetails.findOne({ HotelId });
        if (existing) {
            // You can also choose to update instead of error
            throw new ApiError(400, "Swimming pool details already exist for this hotel." );
        }
        const details = req.body
        const swimmingPoolDetails = await SwimmingPoolDetails.create({ ...details, HotelId });
        res.status(201).json(swimmingPoolDetails);
    } catch (err) {
        return next(err)
    }
};

// Get swimming pool details by ID
exports.getSwimmingPoolDetailsByHotelId = async (req, res, next) => {
    try {
        let HotelId;
        if (req.user)
            HotelId = req.user.HotelId
        else if (req.guest)
            HotelId = req.guest.HotelId
        if (!HotelId) {
            throw new ApiError(403, 'Invalid Access')
        }
        const swimmingPoolDetails = await SwimmingPoolDetails.findOne({HotelId}).lean();
        if (!swimmingPoolDetails) throw new ApiError(404, 'SwimmingPool Details not found by HotelId')
        res.json(swimmingPoolDetails);
    } catch (err) {
        return next(err)
    }
};

// Update swimming pool details by ID
exports.updateSwimmingPoolDetails = async (req, res, next) => {
    try {
        const HotelId = req.user.HotelId;
        if (!HotelId) {
            throw new ApiError(403, "Invalid Access");
        }
        const { images, poolDetails, timeAndAccess, amenities, rulesAndRegulation } = req.body
        const details = await SwimmingPoolDetails.findOneAndUpdate(
            { HotelId },
            { images, poolDetails, timeAndAccess, amenities, rulesAndRegulation },
            { new: true }
        );
        if (!details) return res.status(404).json({ error: 'Not found' });
        res.json(details);
    } catch (err) {
        return next(err)
    }
};

// Add a slot to a swimming pool
exports.addSlot = async (req, res, next) => {
    try {
        const HotelId = req.user.HotelId;
        if (!HotelId) {
            throw new ApiError(403, "Invalid Access");
        }
        let { slots } = req.body;

        // Ensure slots is always an array
        if (!Array.isArray(slots)) {
            slots = [slots];
        }

        // Set currentCapacity = maxCapacity for each slot
        slots = slots.map(slot => ({
            ...slot,
            currentCapacity: slot.maxCapacity
        }));

        const details = await SwimmingPoolDetails.findOneAndUpdate(
            { HotelId },
            { $push: { slots: { $each: slots } } },
            { new: true }
        );
        if (!details) return res.status(404).json({ error: 'Not found, First Add Swimming Pool Details before slots' });
        res.json(details);
    } catch (err) {
        return next(err)
    }
};

// Update a slot
exports.updateSlot = async (req, res, next) => {
    try {
        const HotelId = req.user.HotelId;
        if (!HotelId) {
            throw new ApiError(403, "Invalid Access");
        }

        const { slotId } = req.params;
        const updateFields = {};

        // Only update fields provided in req.body
        for (const [key, value] of Object.entries(req.body)) {
            updateFields[`slots.$.${key}`] = value;
            // If updating maxCapacity, also set currentCapacity
            if (key === "maxCapacity") {
                updateFields[`slots.$.currentCapacity`] = value;
            }
        }

        const details = await SwimmingPoolDetails.findOneAndUpdate(
            { HotelId, "slots._id": slotId },
            { $set: updateFields },
            { new: true }
        );
        if (!details) return res.status(404).json({ error: 'Not found' });
        res.json(details);
    } catch (err) {
        return next(err)
    }
};

// Delete a slot
exports.deleteSlot = async (req, res, next) => {
    try {
        const HotelId = req.user.HotelId;
        if (!HotelId) {
            throw new ApiError(403, "Invalid Access");
        }
        const { slotId } = req.params;
        const details = await SwimmingPoolDetails.findOneAndUpdate(
            { HotelId },
            { $pull: { slots: { _id: slotId } } },
            { new: true }
        );
        if (!details) return res.status(404).json({ error: 'Not found' });
        res.json(details);
    } catch (err) {
        return next(err)
    }
};