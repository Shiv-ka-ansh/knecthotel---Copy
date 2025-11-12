// controllers/appBookingGuests.js
const Bookings = require("../../models/Bookings");
const { sanitizeGuest, countByType, validateCountsNotExceeding, sanitizeIdProof } = require("../../service/guestService");
const ApiError = require("../../utils/ApiError");
// const {
//   sanitizeGuest,
//   countByType,
//   validateCountsNotExceeding,
//   sanitizeIdProof,
// } = require("./helpers/guestPayload");

const assertAccess = async (req, bookingId) => {
  const booking = await Bookings.findById(bookingId);
  if (!booking) return { status: 404, error: "Booking not found" };
  // If you want to ensure hotel scoping:
  if (
    req.guest.phoneNumber &&
    String(booking.phoneNumber) !== String(req.guest.phoneNumber)
  ) {
    return { status: 403, error: "Forbidden: booking not in your number" };
  }
  return { booking };
};

exports.getGuests = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const check = await assertAccess(req, bookingId);
      if (check.error)
        throw new ApiError(
            check.status,
            check.error
        );
    return res.status(200).json({ success: true, guests: check.booking.guests || [] });
  } catch (e) {
    console.error("Error fetching guests:", e);
    return next(e);
  }
};

// POST /bookings/:bookingId/guests:replace
exports.addOrReplaceGuests = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const check = await assertAccess(req, bookingId);
    if (check.error) throw new ApiError(check.status, check.error);
    const booking = check.booking;
    const incoming = Array.isArray(req.body.guests)
      ? req.body.guests.map(sanitizeGuest)
      : [];

    // include primary account holder as first adult if you want (optional); here we just trust client payload

    // validate counts
    const counts = countByType(incoming);
    const errs = validateCountsNotExceeding(booking, counts);
    if (errs.length)
      return res.status(400).json({ success: false, message: errs.join(", ") });

    // derive idProofs for top-level booking.idProofs
    const idProofsArr = incoming
      .filter((g) => g.idProof && g.idProof.url)
      .map((g) => sanitizeIdProof(g.idProof));

    booking.guests = incoming;
    booking.idProofs = idProofsArr;
    await booking.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Guests replaced",
        guests: booking.guests,
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

// POST /bookings/:bookingId/guests  (append mode)
exports.appendGuests = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const check = await assertAccess(req, bookingId);
    if (check.error)
      return res
        .status(check.status)
        .json({ success: false, message: check.error });

    const booking = check.booking;
    const incoming = Array.isArray(req.body.guests)
      ? req.body.guests.map(sanitizeGuest)
      : [];
    const merged = [...(booking.guests || []), ...incoming];

    const counts = countByType(merged);
    const errs = validateCountsNotExceeding(booking, counts);
    if (errs.length)
      return res.status(400).json({ success: false, message: errs.join(", ") });

    // merge idProofs too
    const idProofsArr = merged
      .filter((g) => g.idProof && g.idProof.url)
      .map((g) => sanitizeIdProof(g.idProof));
    booking.guests = merged;
    booking.idProofs = idProofsArr;
    await booking.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Guests appended",
        guests: booking.guests,
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

// PATCH /bookings/:bookingId/guests/:guestId
exports.updateGuest = async (req, res) => {
  try {
    const { bookingId, guestId } = req.params;
    const check = await assertAccess(req, bookingId);
    if (check.error)
      return res
        .status(check.status)
        .json({ success: false, message: check.error });

    const booking = check.booking;
    const g = booking.guests.id(guestId);
    if (!g)
      return res
        .status(404)
        .json({ success: false, message: "Guest not found" });

    // apply allowed fields
    const payload = sanitizeGuest({ ...g.toObject(), ...req.body });
    Object.assign(g, payload);

    // validate counts after update
    const counts = countByType(booking.guests);
    const errs = validateCountsNotExceeding(booking, counts);
    if (errs.length)
      return res.status(400).json({ success: false, message: errs.join(", ") });

    // recompute idProofs
    const idProofsArr = booking.guests
      .filter((x) => x.idProof && x.idProof.url)
      .map((x) => sanitizeIdProof(x.idProof));
    booking.idProofs = idProofsArr;

    await booking.save();
    return res.json({ success: true, message: "Guest updated", guest: g });
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

// DELETE /bookings/:bookingId/guests/:guestId
exports.deleteGuest = async (req, res) => {
  try {
    const { bookingId, guestId } = req.params;
    const check = await assertAccess(req, bookingId);
    if (check.error)
      return res
        .status(check.status)
        .json({ success: false, message: check.error });

    const booking = check.booking;
    const g = booking.guests.id(guestId);
    if (!g)
      return res
        .status(404)
        .json({ success: false, message: "Guest not found" });

    g.remove();

    // validate counts after removal (removal can’t exceed max anyway, so it’s safe)
    // recompute idProofs
    const idProofsArr = booking.guests
      .filter((x) => x.idProof && x.idProof.url)
      .map((x) => sanitizeIdProof(x.idProof));
    booking.idProofs = idProofsArr;

    await booking.save();
    return res.json({ success: true, message: "Guest removed" });
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
