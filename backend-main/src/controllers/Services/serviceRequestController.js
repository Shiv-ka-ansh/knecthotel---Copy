const ServiceRequest = require("../../models/services/ServiceRequest");
const Admin = require("../../models/SuperAdmin/Admin");
const Hotel = require("../../models/Hotel");
const { default: mongoose } = require("mongoose");
const ApiError = require("../../utils/ApiError");
const Role = require("../../models/Role");
const Guest = require("../../models/Guest");
const GstPercentage = require("../../models/gstPercentageServices");
const { sendNotificationToDevice } = require("../../service/firebaseNotification");
const Notifications = require("../../models/Notifications");
const { service_Modal_Module_Map } = require("../../config/modal_module");

const POPULATES = {
  FacilityRequest: [{ path: "facility", select: "facilityType name" }],
  ReceptionRequest: [],
  InRoomDiningBooking: [{ path: "orderedItems.product" }],
  ConciergeRequest: [{ path: "conciergeItem" }],
  SwimmingPoolBooking: [],
  SpaSalonBooking: [{ path: "spaSalonProduct" }],
  InRoomControlRequest: [],
  HousekeepingRequest: [{ path: "items.item" }],

  // add more types here as you create new discriminators
};

exports.POPULATES = POPULATES;

exports.getServiceRequests = async (req, res, next) => {
  try {
    const { serviceType } = req;
    if (!serviceType)
      return res
        .status(400)
        .json({ success: false, message: "Missing service type" });

    /* ----------------- filter ----------------- */
    const filter = { __t: serviceType };
    if (req.guest?._id) {
      filter.HotelId = req.guest.HotelId,
      filter.bookingId = req.guest.currentBooking
      filter.guest = req.guest._id;
    } else {
      filter.HotelId = req.user.HotelId;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.requestType) filter.requestType = req.query.requestType; // for reception/concierge

    /* --------------- pagination --------------- */
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit ?? "20", 10));
    const skip = (page - 1) * limit;

    /* --------------- query & count ------------ */
    let query = ServiceRequest.find(filter)
      .sort({ requestTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate([
        {
          path: "guest",
          select: "firstName lastName email phoneNumber",
        },
        { path: "assignedTo", select: "firstName lastName mobileNumber" },
        ...POPULATES[serviceType], // service-specific populates
      ])
      .lean(); // performance boost

    let [total, data] = await Promise.all([
      ServiceRequest.countDocuments(filter),
      query,
    ]);
      
    const transformedData = data.map((item) => {
      // Create a copy of the guest object to avoid mutating the original
      const guestCopy = item.guest ? { ...item.guest } : null;

      if (guestCopy) {
        guestCopy.assignedRoomNumber = item.roomNumber ? item.roomNumber : "NA";
      }

      return {
        ...item,
        guest: guestCopy
      };
    });
    return res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      data: transformedData,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getServiceRequestById = async (req, res, next) => {
  try {
    const { serviceType } = req;
    if (!serviceType)
      return res
        .status(400)
        .json({ success: false, message: "Missing service type" });
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Missing service Id" });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ApiError(400, "Invalid ID format");
    }
    /* ----------------- filter ----------------- */
    const filter = { _id: id };
    if (req.user?.HotelId) filter.HotelId = req.user.HotelId;
    if (req.guest?._id) filter.guest = req.guest._id;

    let query = ServiceRequest.findOne(filter)
      .populate([
        {
          path: "guest",
          select: "firstName lastName email phoneNumber assignedRoomNumber",
        },
        { path: "assignedTo", select: "firstName lastName mobileNumber" },
        ...POPULATES[serviceType], // service-specific populates
      ])
      .lean();
    let data = await query.lean();
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    // the same I want above 
    data.guest.assignedRoomNumber = data.roomNumber
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.assignEmployee = async (req, res) => {
  const ios = req.app.get('io');

  try {
    const { adminId, ETOD } = req.body;
    const { serviceId } = req.params;
    const service = await ServiceRequest.findById(serviceId);
    const guestId = service.guest._id.toString();
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service Not found for given ID!",
      });
    }
    if(service.status === 'completed'){
      return res.status(400).json({
        success: false,
        message: "Cannot assign Employee to a completed service request",
      });
    }
    // The Employee should be from the working in the same Hotel
    const assignedEmployee = await Admin.findOne({
      _id: adminId,
      scope: "Hotel",
      HotelId: req.user.HotelId,
    });
    if (!assignedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee Not Found!",
      });
    }

    service.assignedTo = assignedEmployee._id;
    const estimatedDeliveryTime = new Date(Date.now() + ETOD * 60 * 1000);
    service.estimatedDeliveryTime = estimatedDeliveryTime;
    service.status = "in-progress";
    await service.save();
    
    const guest = await Guest.findById(service.guest._id).lean();
    // Notify guest via socket if available
    if (guest && guest.fcmToken) {
      await sendNotificationToDevice(
        guest.fcmToken,
        "Service Request Assigned",
        `Your ${service.__t} request has been assigned to ${assignedEmployee.firstName} ${assignedEmployee.lastName}. Estimated delivery time is ${ETOD} minutes.`,
        null
      );
    }
    const moduleName = service_Modal_Module_Map[service.__t] || 'services';
    
    ios.to(assignedEmployee._id.toString()).emit('notification:services', {
      moduleName,
      message: 'A new task has been Assigned to you',
      link: `/hotel-panel/service-management/${moduleName}/details/${service._id} `,
    });

    await Notifications.create({
      adminId: assignedEmployee._id,
      HotelId: req.user.HotelId.toString(),
      title: `Task Assigned!` ,
      message: "A new Task has been Assigned to you from " + moduleName,
      moduleName,
      link: `/hotel-panel/service-management/${moduleName}/details/${service._id}`,
    });
    return res.status(200).json({
      success: true,
      message: "Employee Assigned Successfully",
      data: {
        service,
        assignedTo: {
          adminId: assignedEmployee._id,
          adminName: assignedEmployee.firstName + assignedEmployee.lastName,
        },
        estimatedDeliveryTime,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getGuestServiceRequests = async (req, res) => {
  try {
    
    const guestId = req.guest._id;
    const guest = await Guest.findById(guestId).lean();
    if (!guest.HotelId || !guest.currentBooking) {
      throw new ApiError(400, "Guest not checkedIn at a Hotel!");
    }
    const bookingId = guest.currentBooking;
    // Optional filters (status, serviceType, date range)
    const { status, serviceType } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { guest: guestId, HotelId: guest.HotelId, bookingId };
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, data] = await Promise.all([
      ServiceRequest.countDocuments(filter),
      ServiceRequest.find(filter)
        .populate("assignedTo", "firstName lastName mobileNumber")
        .populate("HotelId", "name HotelId")
        .sort({ createdAt: -1 })
        .populate("guest", "firstName lastName email phoneNumber")
        .skip(skip)
        .limit(parseInt(limit)),
    ]);

    return res.json({
      success: true,
      page: parseInt(page),
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

exports.changeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "in-progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid Status" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ApiError(400, "Invalid ID format");
    }
    const updates = {}
    updates.status = status
    if (status === "completed") {
      updates.completedAt = new Date()
    }
    const service = await ServiceRequest.findOneAndUpdate(
      { _id: id, HotelId: req.user.HotelId },
      updates,
      { new: true }
    );
    if (!service) {
      throw new ApiError(404, "Service request not found");
    }
    const guestId = service.guest._id.toString();

    const guest = await Guest.findById(guestId).lean();
    if (guest && guest.fcmToken) {
      await sendNotificationToDevice(
        guest.fcmToken,
        "Service Request Status Updated",
        `Status updated to ${status} for your ${service.__t} request.`,
        null
      );
    }
    return res.json({
      success: true,
      message: "Status updated to " + status,
      serviceRequest: service,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAllServingDepartments = async (req, res) => {
  try {
    let HotelId;
    if (req.user) {
      HotelId = req.user.HotelId;
    } else if (req.guest) {
      HotelId = req.guest.HotelId;
    }
    if (!HotelId) {
      throw new ApiError(400, "HotelId Not Found!");
    }
    const hotel = await Hotel.findById(HotelId);
    if (!hotel) {
      throw new ApiError(400, "Invalid HotelId!");
    }
    let servingDepartments = hotel.servingDepartment;

    return res.status(200).json({ success: true, servingDepartments });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error?.message || error,
      });
  }
};

exports.toggleServices = async (req, res) => {
  try {
    const { service } = req.params;

    if (!service) {
      return res
        .status(400)
        .json({ success: false, message: "service is required!" });
    }
    const validServices = [
      "reception",
      "housekeeping",
      "inroomdining",
      "gym",
      "spa",
      "swimmingpool",
      "conciergeservice",
      "in_room_control",
      "ordermanagement",
      "payment",
      "sos",
      "chat",
    ];
    if (!validServices.includes(service)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Service!" });
    }
    const role = await Role.findById(req.user.roleId)
      .select("permissions.module") // only need module field
      .lean(); // returns plain JS object

    if (!role)
      return res
        .status(403)
        .json({ success: false, message: "Role not found" });

    const hasModulePermission = role.permissions?.some(
      (perm) => perm.module === service
    );

    if (!hasModulePermission) {
      return res.status(403).json({
        success: false,
        message: `You lack permission to manage “${service}”.`,
      });
    }
    const hotel = await Hotel.findById(req.user.HotelId).select(
      "servingDepartment"
    );
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "No Hotel Found!" });
    }
    const servingDepartments = hotel.servingDepartment;
    if (servingDepartments.includes(service)) {

      hotel.servingDepartment = servingDepartments.filter(
        (item) => item !== service
      );
      await hotel.save();
      return res.status(200).json({
        success: true,
        message: "Removed the Service from serving departments.",
        updatedServingDepartments: hotel.servingDepartment,
      });
    } else {
      hotel.servingDepartment.push(service);
      await hotel.save();

      return res.status(200).json({
        success: true,
        message: "Added the Service to serving departments.",
        updatedServingDepartments: hotel.servingDepartment,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error?.message || error,
      });
  }
};

exports.searchServiceRequests = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const { serviceType } = req.params;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    // Map frontend service types to discriminator models
    const serviceTypeMap = {
      reception: "ReceptionRequest",
      housekeeping: "HousekeepingRequest",
      inroomdining: "InRoomDiningBooking",
      gym: "FacilityRequest",
      spa: "SpaSalonBooking",
      swimmingpool: "SwimmingPoolBooking",
      conciergeservice: "ConciergeRequest",
      in_room_control: "InRoomControlRequest",
    };

    // Escape regex special characters
    const escapedTerm = searchTerm
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedTerm, "i");

    // Build base pipeline
    const pipeline = [
      {
        $lookup: {
          from: "guests",
          localField: "guest",
          foreignField: "_id",
          as: "guest",
        },
      },
      { $unwind: "$guest" },
      {
        $match: {
          $or: [
            { uniqueId: regex },
            { "guest.firstName": regex },
            { "guest.lastName": regex },
            { "guest.phoneNumber": regex },
            { "guest.email": regex },
          ],
        },
      },
    ];

    // Add service type filter if not "ordermanagement"
    if (serviceType !== "ordermanagement" && serviceTypeMap[serviceType]) {
      pipeline[2].$match.__t = serviceTypeMap[serviceType];
    }

    // Add pagination using $facet
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: { requestTime: -1 } }, // Sort by newest first
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              // Include only necessary fields
              uniqueId: 1,
              requestTime: 1,
              status: 1,
              requestDetail: 1,
              responseDetail: 1,
              estimatedDeliveryTime: 1,
              paymentStatus: 1,
              "guest._id": 1,
              "guest.firstName": 1,
              "guest.lastName": 1,
              "guest.phoneNumber": 1,
              "guest.email": 1,
              __t: 1,
            },
          },
        ],
      },
    });

    const results = await ServiceRequest.aggregate(pipeline);

    // Extract metadata and data
    const metadata = results[0]?.metadata[0] || { total: 0 };
    const data = results[0]?.data || [];
    const total = metadata.total;

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.setGstPercentage = async (req, res, next) => {
  try {
    const { serviceName } = req.params;
    const { gstPercentage } = req.body;
    const HotelId = req.user.HotelId;

    if (!serviceName || gstPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: "Service name and GST percentage are required",
      });
    }
    if (gstPercentage < 0 || gstPercentage > 100) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid GST percentage" });
    }

    // Find GST document for the hotel
    let gstData = await GstPercentage.findOne({ HotelId });

    if (gstData) {
      // Check if service already exists
      const serviceIndex = gstData.gstPercentageForServices.findIndex(
        (s) => s.serviceName === serviceName
      );
      if (serviceIndex > -1) {
        // Update GST percentage for existing service
        gstData.gstPercentageForServices[serviceIndex].gstPercentage =
          gstPercentage;
      } else {
        // Add new service GST percentage
        gstData.gstPercentageForServices.push({ serviceName, gstPercentage });
      }
      await gstData.save();
      return res.status(200).json({
        success: true,
        message: "GST percentage set/updated",
        data: gstData,
      });
    } else {
      // Create new GST document for hotel
      gstData = await GstPercentage.create({
        HotelId,
        gstPercentageForServices: [{ serviceName, gstPercentage }],
      });
      return res.status(201).json({
        success: true,
        message: "GST percentage set",
        data: gstData,
      });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getGstPercentage = async (req, res, next) => {
  try {
    const gstData = await GstPercentage.find({
      HotelId: req.user.HotelId,
    }).select("gstPercentageForServices");

    if (!gstData) {
      return res
        .status(404)
        .json({
          success: false,
          message: "GST data not found for this service",
        });
    }

    return res.status(200).json({ success: true, data: gstData });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getGstPercentageByModule = async (req, res, next) => {
  try {
    const { module } = req.params;
    if (!module) {
      return res
        .status(400)
        .json({ success: false, message: "Module is required" });
    } 

    // Accept comma-separated modules or a single module
    const modules = module.split(",").map((m) => m.trim());

    const gstData = await GstPercentage.findOne({
      HotelId: req.guest.HotelId,
    }).select("gstPercentageForServices");

    if (!gstData) {
      return res.status(404).json({
        success: false,
        message: "GST data not found for this service",
      });
    }

    // Filter only requested modules
    const filtered = gstData.gstPercentageForServices.filter((s) =>
      modules.includes(s.serviceName)
    );

    return res.status(200).json({ success: true, data: filtered });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};