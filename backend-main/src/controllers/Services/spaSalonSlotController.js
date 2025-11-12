const SpaSalonSlot = require('../../models/services/SpaSalonSlot');
const SpaSalonProduct = require('../../models/services/SpaSalonProduct');
const ApiError = require('../../utils/ApiError');

// Add slots to a Spa/Salon Product
exports.addSlot = async (req, res, next) => {
    try {
        const HotelId = req.user.HotelId;
        if (!HotelId) throw new ApiError(403, "Invalid Access");

        let { slots } = req.body;
        if (!slots) throw new ApiError(400, "slots is required");

        // Ensure slots is always an array
        if (!Array.isArray(slots)) slots = [slots];

        // Set currentCapacity = maxCapacity for each slot and price to 0
        slots = slots.map(slot => ({
            ...slot,
            HotelId,
            currentCapacity: slot.maxCapacity
        }));

        const createdSlots = await SpaSalonSlot.insertMany(slots);

        // Optionally, add slot references to product
       
        res.status(201).json(createdSlots);
    } catch (err) {
        return next(err);
    }
};

// Update a slot
exports.updateSlot = async (req, res, next) => {
    try {
        const HotelId = req.user.HotelId;
        if (!HotelId) throw new ApiError(403, "Invalid Access");

        const { slotId } = req.params;
        const updateFields = { ...req.body };

        // If updating maxCapacity, also set currentCapacity
        if (updateFields.maxCapacity) {
            updateFields.currentCapacity = updateFields.maxCapacity;
        }

        const slot = await SpaSalonSlot.findOneAndUpdate(
            { _id: slotId, HotelId },
            updateFields,
            { new: true }
        );
        if (!slot) return res.status(404).json({ error: 'Slot not found' });
        res.json(slot);
    } catch (err) {
        return next(err);
    }
};

// Delete a slot
exports.deleteSlot = async (req, res, next) => {
    try {
        const HotelId = req.user.HotelId;
        if (!HotelId) throw new ApiError(403, "Invalid Access");

        const { slotId } = req.params;
        const slot = await SpaSalonSlot.findOneAndDelete({ _id: slotId, HotelId });
        if (!slot) return res.status(404).json({ error: 'Slot not found' });

        // Optionally, remove slot reference from product
        await SpaSalonProduct.updateMany(
            { slots: slotId },
            { $pull: { slots: slotId } }
        );

        res.json({ success: true });
    } catch (err) {
        return next(err);
    }
};

// View all slots for a hotel (optionally filter by product)
exports.getAllSlots = async (req, res, next) => {
    try {
        const HotelId = req.user?.HotelId || req.guest?.HotelId;
        if (!HotelId) throw new ApiError(403, "Invalid Access");

        const { spaSalonProduct } = req.query;
        const filter = { HotelId };
        if (spaSalonProduct) filter.spaSalonProduct = spaSalonProduct;

        const slots = await SpaSalonSlot.find(filter).lean();
        res.json(slots);
    } catch (err) {
        return next(err);
    }
};