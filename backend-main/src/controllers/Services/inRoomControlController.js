const InRoomControlRequest = require("../../models/services/InRoomControlRequest");
const { notifyNewServiceRequest } = require("../../service/notificationService");

/* Guest: Create Issue Request */
exports.createInRoomControlRequest = async (req, res) => {
  try {
    const { issueType, description, HotelId } = req.body;
    const guestId = req.guest._id;

    if (!issueType || !description) {
      return res.status(400).json({
        success: false,
        message: "issueType and description are required",
      });
    }

    const serviceRequest = new InRoomControlRequest({
      guest: guestId,
      issueType,
      description,
      status: "pending",
      serviceType: "InRoomControlRequest",
      HotelId,
    });

    await serviceRequest.save();
    // Notify about the new request
        await notifyNewServiceRequest(serviceRequest);

    
    return res.status(201).json({
      success: true,
      message: "Issue reported successfully",
      data: serviceRequest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/* Admin: List Requests */
exports.getAllInRoomControlRequests = async (req, res) => {
  try {
    const query = {};
    if (req.user?.HotelId) query.HotelId = req.user.HotelId;
    if (req.query.status) query.status = req.query.status;
    if (req.query.issueType) query.issueType = req.query.issueType;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      InRoomControlRequest.countDocuments(query),
      InRoomControlRequest.find(query)
        .populate("assignedTo", "firstName lastName mobileNumber")
        .populate("guest", "firstName lastName phoneNumber email")
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
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/* Admin/Guest: Get Request By ID */
exports.getInRoomControlRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await InRoomControlRequest.findOne({
      $or: [{ _id: id }, { id }],
    })
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("guest", "firstName lastName phoneNumber email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (
      req.guest &&
      request.guest._id.toString() !== req.guest._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return res.json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/* Admin/Guest: Update Request */
exports.updateInRoomControlRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const request = await InRoomControlRequest.findOne({
      $or: [{ _id: id }, { id }],
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (
      req.guest &&
      request.guest._id.toString() !== req.guest._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    Object.assign(request, updates);
    await request.save();

    return res.json({
      success: true,
      message: "Request updated",
      data: request,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
