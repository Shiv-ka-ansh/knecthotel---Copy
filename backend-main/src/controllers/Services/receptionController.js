// controllers/Services/receptionController.js
const ReceptionRequest = require("../../models/services/ReceptionRequest");
const ServiceRequest = require("../../models/services/ServiceRequest");
const Admin = require("../../models/SuperAdmin/Admin");
const { notifyNewServiceRequest } = require("../../service/notificationService");

/* ────────────────────────── Create ────────────────────────── */
exports.createReceptionRequest = async (req, res) => {
  try {
    const { requestType, requestDetail, wakeUpTime, upgradeCategory, HotelId } =
      req.body;
    const guestId = req.guest._id;

    //-- basic validation for special request types
    if (
      ["WakeUpCallReminder", "WakeUpCallScheduling"].includes(requestType) &&
      !wakeUpTime
    ) {
      return res
        .status(400)
        .json({ success: false, message: "wakeUpTime is required" });
    }

    const newRequest = await ReceptionRequest.create({
      guest: guestId,
      requestType,
      requestDetail,
      wakeUpTime,
      upgradeCategory,
      status: "pending",
      serviceType: "ReceptionRequest",
      HotelId,
    });
    await notifyNewServiceRequest(newRequest);

    return res.status(201).json({
      success: true,
      message: "Reception request created successfully",
      data: newRequest,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ────────────────────────── Read (all) ────────────────────────── */
exports.getAllReceptionRequests = async (req, res) => {
  try {
    const query = {};
    if (req.guest) query.guest = req.guest._id;
    if (req.user?.HotelId) query.HotelId = req.user.HotelId;

    if (req.query.guest) query.guest = req.query.guest;
    if (req.query.status) query.status = req.query.status;
    if (req.query.requestType) query.requestType = req.query.requestType;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      ReceptionRequest.countDocuments(query),
      ReceptionRequest.find(query)
        .populate("guest", "firstName lastName email phoneNumber")
        .sort({ requestTime: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      data,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ────────────────────────── Read (single) ────────────────────────── */
exports.getReceptionRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ReceptionRequest.findOne({
      $or: [{ _id: id }, { id }],
    })
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("guest", "firstName lastName email phoneNumber");

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    if (req.guest && request.guest._id.toString() !== req.guest._id.toString())
      return res.status(403).json({ success: false, message: "Forbidden" });

    return res.json({ success: true, data: request });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ────────────────────────── Update ────────────────────────── */
exports.updateReceptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const request = await ReceptionRequest.findOne({
      $or: [{ _id: id }, { id }],
    });
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    if (req.guest && request.guest.toString() !== req.guest._id.toString())
      return res.status(403).json({ success: false, message: "Forbidden" });

    // extra validation for Wake-Up calls
    if (
      updates.requestType &&
      ["WakeUpCallReminder", "WakeUpCallScheduling"].includes(
        updates.requestType
      ) &&
      !updates.wakeUpTime &&
      !request.wakeUpTime
    ) {
      return res
        .status(400)
        .json({ success: false, message: "wakeUpTime is required" });
    }

    Object.assign(request, updates);
    await request.save();

    return res.json({
      success: true,
      message: "Reception request updated",
      data: request,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
