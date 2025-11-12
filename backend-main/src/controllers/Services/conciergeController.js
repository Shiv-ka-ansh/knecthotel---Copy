const ConciergeRequest = require("../../models/services/conciergeServiceRequests");
const ConciergeItem = require("../../models/services/conciergeItems");
const { groupItemsByServiceType } = require("../../utils/servicesHelper");
const { notifyNewServiceRequest } = require("../../service/notificationService");

// Add new concierge item
exports.addConciergeService = async (req, res) => {
  try {
    const { name, description, category, serviceType, distance, imageUrl } =
      req.body;

    // Validate service type
    const validServiceTypes = [
      "Nearby Attraction",
      "Nearby Cafe & Restaurant",
    ];
    if (!validServiceTypes.includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service type",
      });
    }

    const newItem = new ConciergeItem({
      name,
      description,
      category,
      serviceType,
      distance,
      imageUrl,
      HotelId: req.user.HotelId,
    });

    await newItem.save();
    
    return res.status(201).json({
      success: true,
      message: "Concierge item added successfully",
      data: newItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while adding concierge item",
      error: error.message,
    });
  }
};
exports.updateConciergeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await ConciergeItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Concierge item not found",
      });
    }

    // Validate hotel ownership
    if (item.HotelId.toString() !== req.user.HotelId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this item",
      });
    }

    // Validate service type if updating
    if (updates.serviceType) {
      const validServiceTypes = [
        "Nearby Attraction",
        "Nearby Cafe and Restaurants",
      ];
      if (!validServiceTypes.includes(updates.serviceType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service type",
        });
      }
    }

    Object.assign(item, updates);
    await item.save();

    return res.json({
      success: true,
      message: "Concierge item updated successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating concierge item",
      error: error.message,
    });
  }
};

// Delete concierge item
exports.deleteConciergeItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ConciergeItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Concierge item not found",
      });
    }

    // Validate hotel ownership
    if (item.HotelId.toString() !== req.user.HotelId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this item",
      });
    }

    await item.deleteOne();

    return res.json({
      success: true,
      message: "Concierge item deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting concierge item",
      error: error.message,
    });
  }
};
  
// Get items for ADMIN
exports.getConciergeItemsForAdmin = async (req, res) => {
  try {
    const HotelId = req.user.HotelId;
    if (!HotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel ID not found in user token",
      });
    }

    const items = await ConciergeItem.find({ HotelId });
    const groupedItems = groupItemsByServiceType(items);

    return res.json({
      success: true,
      data: groupedItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching concierge items",
      error: error.message,
    });
  }
};

// Get items for GUEST
exports.getConciergeItemsForGuest = async (req, res) => {
  try {
    const { HotelId } = req.params;
    if (!HotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel ID is required",
      });
    }

    const items = await ConciergeItem.find({ HotelId });
    const groupedItems = groupItemsByServiceType(items);

    return res.json({
      success: true,
      data: groupedItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching concierge items",
      error: error.message,
    });
  }
};

// Create concierge request
exports.createConciergeRequest = async (req, res) => {
  try {
    const { conciergeItem, requestDetail, HotelId, date, time, } = req.body;
    const guestId = req.guest._id;

  
    // Verify concierge item exists
    const itemExists = await ConciergeItem.findById(conciergeItem);
    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Concierge item not found",
      });
    }

    const serviceRequest = new ConciergeRequest({
      guest: guestId,
      requestType: itemExists.serviceType,
      conciergeItem,
      requestDetail,
      status: "pending",
      serviceType: "ConciergeRequest",
      HotelId,
      date:new Date(date),
      time 
    });

    await serviceRequest.save();
    // Notify about the new service request
    await notifyNewServiceRequest(serviceRequest);
    return res.status(201).json({
      success: true,
      message: "Concierge request created successfully",
      data: serviceRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while creating concierge request",
      error: error.message,
    });
  }
};

// Get all concierge requests
exports.getAllConciergeRequests = async (req, res) => {
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
      ConciergeRequest.countDocuments(query),
      ConciergeRequest.find(query)
        .populate("assignedTo", "firstName lastName mobileNumber")
        .populate("guest", "firstName lastName email phoneNumber")
        .populate("conciergeItem", "name description distance")
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

// Get concierge request by ID
exports.getConciergeRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ConciergeRequest.findOne({
      $or: [{ _id: id }, { id }],
    })
      .populate("guest", "name roomNo email phoneNumber")
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("conciergeItem", "name description distance imageUrl");

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

    return res.json({
      success: true,
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

// Update concierge request
exports.updateConciergeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const request = await ConciergeRequest.findOne({
      $or: [{ _id: id }, { id }],
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (req.guest && request.guest.toString() !== req.guest._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    // Validate request type if updating
    if (updates.requestType) {
      const validRequestTypes = [
        "Nearby Attraction",
        "Nearby Cafe and Restaurants",
      ];
      if (!validRequestTypes.includes(updates.requestType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request type",
        });
      }
    }

    // Verify concierge item if updating
    if (updates.conciergeItem) {
      const itemExists = await ConciergeItem.findById(updates.conciergeItem);
      if (!itemExists) {
        return res.status(404).json({
          success: false,
          message: "Concierge item not found",
        });
      }
    }

    Object.assign(request, updates);
    await request.save();

    return res.json({
      success: true,
      message: "Concierge request updated",
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

exports.createTaxiRequest = async (req, res) => {
  try {
    const HotelId = req.body.HotelId
    const guest = req.guest;
    const guestId = guest._id;
    const { date, time, location } = req.body
    if (!date || !time || !location) {
      return res.status(400).json({message:'Missing Required Fields!'})
    }
    
 
    const serviceRequest = new ConciergeRequest({
      guest: guestId,
      date: new Date(date),
      time,
      HotelId,
      location,
      requestType: "Taxi Service",
    });
    await serviceRequest.save()
    return res.status(200).json({success:true, message:'Taxi Request Done!'})
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};