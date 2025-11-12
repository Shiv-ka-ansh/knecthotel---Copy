// controllers/savedGuests.js
const Guest = require("../../models/Guest");
const { sanitizeGuest } = require("../../service/guestService");

const loadSelf = async (req) => {
  const guestId = req.guest._id; // adapt to your auth payload
  if (!guestId) return { status: 401, error: "Unauthorized" };
  const me = await Guest.findById(guestId);
  if (!me) return { status: 404, error: "Guest not found" };
  return { me };
};

exports.listSavedGuests = async (req, res) => {
  try {
    const check = await loadSelf(req);
    if (check.error)
      return res
        .status(check.status)
        .json({ success: false, message: check.error });
    return res.json({ success: true, savedGuests: check.me.savedGuests || [] });
  } catch (e) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: e.message,
      });
  }
};

exports.addSavedGuest = async (req, res) => {
  try {
    const check = await loadSelf(req);
    if (check.error)
      return res
        .status(check.status)
        .json({ success: false, message: check.error });

    const companion = sanitizeGuest(req.body);
    // savedGuests accept adult/children/infant; you can ignore guestType here if you want
    check.me.savedGuests = check.me.savedGuests || [];
    check.me.savedGuests.push(companion);
    await check.me.save();

    return res
      .status(201)
      .json({
        success: true,
        message: "Saved guest added",
        savedGuests: check.me.savedGuests,
      });
  } catch (e) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: e.message,
      });
  }
};

exports.updateSavedGuest = async (req, res) => {
  try {
    const check = await loadSelf(req);
    if (check.error)
      return res
        .status(check.status)
        .json({ success: false, message: check.error });

    const { savedId } = req.params;
    const item = check.me.savedGuests.id(savedId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Saved guest not found" });

    Object.assign(item, sanitizeGuest({ ...item.toObject(), ...req.body }));
    await check.me.save();

    return res.json({ success: true, message: "Saved guest updated", item });
  } catch (e) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: e.message,
      });
  }
};

exports.deleteSavedGuest = async (req, res) => {
  try {
    const check = await loadSelf(req);
    if (check.error)
      return res
        .status(check.status)
        .json({ success: false, message: check.error });

    const { savedId } = req.params;
    const item = check.me.savedGuests.id(savedId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Saved guest not found" });

    item.remove();
    await check.me.save();

    return res.json({ success: true, message: "Saved guest removed" });
  } catch (e) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: e.message,
      });
  }
};
