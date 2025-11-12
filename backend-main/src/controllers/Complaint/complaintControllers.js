const { default: mongoose } = require("mongoose");
const Complaint = require("../../models/Complaint");
const Hotel = require("../../models/Hotel");
const Admin = require("../../models/SuperAdmin/Admin");
const { buildFilterForUser } = require("../../utils/complaints");
const { sendNotificationForServices } = require("../../../socket");
const Notifications = require("../../models/Notifications");
const { sendNotificationToDevice } = require("../../service/firebaseNotification");
const { sendComplaintRaisedEmail } = require("../../utils/mailService");

exports.fetchComplaintStats = async (req, res, next) => {
  try {
    let filter = {}
    if (req.user.scope==='Platform') {
      filter.scope = 'Platform'
    } else if (req.user.scope === 'Hotel') {
      filter.HotelId = req.user.HotelId;
      filter.scope = 'Hotel'
    }
    const aggregation = await Complaint.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform aggregation output into the desired shape
    const byStatus = aggregation.reduce(
      (acc, { _id, count }) => ({ ...acc, [_id]: count }),
      { Open: 0, Inprogress: 0, Resolved: 0 } // ensures zeroes if a bucket is empty
    );
    
    return res.status(200).json({success:true, message: 'Stats fetched Successfully!', data: byStatus})
  } catch (error) {
   return next(error)    
  }
};

exports.getAllComplaints = async (req, res) => {
  let filter;
  filter = buildFilterForUser(req.user || req.guest);

  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total documents for pagination metadata
    const total = await Complaint.countDocuments(filter);

    const complaints = await Complaint.find(filter)
      .populate("HotelId", "name HotelId email")
      .populate("raisedByGuest", "firstName lastName uniqueId email phoneNumber assignedRoomNumber")
      .populate("raisedByAdmin", "firstName lastName email phoneNo")
      .populate("assignedTo", "firstName lastName mobileNumber email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Fetch failed", error: err.message });
  }
};

exports.getHotelLoggedComplaints = async (req, res) => {
  try {
    if (req.user.scope !== "Hotel") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { raisedByAdmin: req.user._id, scope: "Platform" },
        {
          HotelId: req.user.HotelId,
          scope: "Platform",
          raisedByAdmin: { $exists: true },
        },
      ],
    };

    // Count total documents
    const total = await Complaint.countDocuments(filter);

    const complaints = await Complaint.find(filter)
      .populate("raisedByAdmin", "firstName lastName email phone")
      .populate("assignedTo", "firstName lastName mobileNumber email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create hotel complaint (by guest or platform staff)
exports.createHotelComplaint = async (req, res) => {
  try {
    const isGuest = req.guest ? true : false;
    const isPlatformStaff = req.user?.scope === "Platform";

    // Validate required fields
    if (!req.body.HotelId || !req.body.complaintType || !req.body.description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Platform staff must specify hotel ID
    if (isPlatformStaff && !req.body.HotelId) {
      return res.status(400).json({ message: "HotelId is required" });
    }

    const complaint = await Complaint.create({
      scope: "Hotel",
      HotelId: req.body.HotelId,
      raisedByGuest: isGuest ? req.guest._id : undefined,
      raisedByAdmin: !isGuest ? req.user._id : undefined,
      complaintType: req.body.complaintType,
      description: req.body.description,
      status: 'Open'
    });
     await sendNotificationForServices(
       "complaint-management",
       complaint.HotelId.toString(),
       "notification:services",
       `New complaint raised by ${isGuest ? req.guest.firstName : 'Knect'} ${isGuest ? req.guest.lastName : 'Platform'}`,
       `/hotel-panel/complaint-management/view/${complaint._id}`
     );
    return res.status(201).json({ message: "Created", complaint });
  } catch (err) {
    return res.status(400).json({ message: "Create failed", error: err.message });
  }
};
exports.createPlatformComplaint = async (req, res) => {
  try {
    const isHotelAdmin = req.user?.scope === "Hotel";
    if (!isHotelAdmin && !req.body.HotelId) {
      return res.status(404).json({
        message:'Hotel Id is Required'
      })
    }
    let HotelId
    let hotel
    if (req.body.HotelId) {
      hotel = await Hotel.findOne({ HotelId: req.body.HotelId }).lean()
      if (!hotel) {
        return res.status(404).json({message: 'Invalid Hotel Id!'})
      }
      HotelId = hotel._id
    }
    if (isHotelAdmin) {
      HotelId = req.user.HotelId
      hotel = await Hotel.findOne({ _id: HotelId }).lean()
      if (!hotel) {
        return res.status(404).json({ message: 'Invalid Hotel Id!' })
      }
    }
    const complaint = await Complaint.create({
      scope: "Platform",
      HotelId: hotel._id,
      raisedByAdmin: req.user._id,
      complaintType: req.body.complaintType,
      description: req.body.description,
      status: "Open",
    });

    await sendComplaintRaisedEmail(hotel.email, hotel.name, complaint)
    return res.status(201).json({ message: "Created", complaint });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Create failed", error: err.message });
  }
};


exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params; // Complaint ID from route params

    // Determine the correct filter for the user
    const filter = {}
    filter._id = id; // Add the complaint ID to the filter

    const complaint = await Complaint.findOne(filter)
      .populate("HotelId", "name HotelId email")
      .populate("assignedTo", "firstName lastName email mobileNumber")
      .populate("raisedByGuest", "firstName lastName phoneNumber email assignedRoomNumber")
      .populate("raisedByAdmin", "firstName lastName email");

    // If no complaint is found, return a 404
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Return the complaint if found
    return res.status(200).json({ complaint });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch complaint", error: err.message });
  }
};
exports.updateComplaint = async (req, res) => {
  const ios = req.app.get('io');

  try {
    const { id } = req.params; // Complaint ID from route params
    const updateData = req.body; // Data to update (status, assignedTo, etc.)
    const complaintDetails = await Complaint.findOne({ _id: id }).populate("raisedByGuest", "fcmToken").lean();
    if (!complaintDetails) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    if (updateData.assignedTo) {
        updateData.status = 'Inprogress'
      
      if (updateData.ETOD) {
        const estimatedDeliveryTime = new Date(Date.now() + (updateData.ETOD) * 60 * 1000);
        updateData.estimatedDeliveryTime = estimatedDeliveryTime
      }
      const assignedEmployeeId = updateData.assignedTo;
      const assignedEmployee = await Admin.findById(assignedEmployeeId).lean();
      
      if (!assignedEmployee) {
        return res.status(404).json({
          status: false,
          message: "Assigned Employee not found!",
        });
      }
      if (req.user.scope !== assignedEmployee.scope) {
        return res.status(403).json({
          status: false,
          message: "Employee Out of Scope!",
        });
      }

      if (
        assignedEmployee.scope === "Hotel" &&
        assignedEmployee.HotelId._id.toString() !== req.user.HotelId.toString()
      ) {
        return res.status(403).json({
          status: false,
          message: "Employee Out of Scope!",
        });
      }
      
      if (assignedEmployee.scope === "Hotel") {
        ios.to(assignedEmployee._id.toString()).emit('notification:services', {
          moduleName: 'complaint-management',
          message: 'A new Complaint has been Assigned to you',
          link: `/hotel-panel/complaint-management/view/${id}`,
        });

        await Notifications.create({
          adminId: assignedEmployee._id,
          HotelId: req.user.HotelId.toString(),
          title: `New Notification from complaint management`,
          message: "A new Complaint has been Assigned to you",
          moduleName: 'complaint-management',
          link: `/hotel-panel/complaint-management/view/${id}`,
        });
      }
      
      if (assignedEmployee && complaintDetails.raisedByGuest?.fcmToken) {
        let etodString;
        if (updateData.ETOD) {
          etodString = "Is Expected to be resolved in" + updateData.ETOD
        }
        await sendNotificationToDevice(complaintDetails.raisedByGuest.fcmToken, `Your complaint has been assigned to an Employee`, `Your complaint (${complaintDetails.uniqueId}) has been assigned to ${assignedEmployee.firstName} ${assignedEmployee.lastName} ${etodString}`,  {})
      }
      
      
    }
    if (complaintDetails.status !== "Resolved" && updateData.status === "Resolved") {
      updateData.resolvedAt = new Date();
    }
    
    // If feedback is being added, ensure status is 'Resolved'
    if (complaintDetails.status !== 'Resolved' && updateData.feedback) {
      return res.status(400).json({ message: "Feedback can only be added after complaint is Resolved" });
    }
    // Determine the correct filter for the user
    // const filter = buildFilterForUser(req.user || req.guest);
    // filter._id = id; // Add the complaint ID to the filter

    // Find and update the complaint
    const updatedComplaint = await Complaint.findByIdAndUpdate(id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation is applied
      }
    );

    // If no complaint is found to update, return a 404
    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    if (updateData.status && complaintDetails.raisedByGuest?.fcmToken) {
      await sendNotificationToDevice(complaintDetails.raisedByGuest.fcmToken, 'Your complaint status has been updated', `The status of your complaint (${complaintDetails.uniqueId}) is now: ${updateData.status}`,  {})
    }
    
    


    // Return the updated complaint
    return res
      .status(200)
      .json({ message: "Complaint updated successfully", updatedComplaint });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ message: "Failed to update complaint", error: err.message });
  }
};

exports.giveFeedback = async (req, res) => { 
  try {
    const { id } = req.params;
    const { 
      complaintFeedback,
      complaintRating,
      agentFeedback,
      agentRating, } = req.body;
    if (!complaintFeedback || 
      !complaintRating ||
      !agentFeedback ||
      !agentRating) {
      return res.status(400).json({
        message: "complaintFeedback, complaintRating, agentFeedback, agentRating, is required" });
    }
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: "Feedback can only be given for Resolved complaints" });
    }
    if (complaint.scope !== 'Hotel') {
      return res.status(403).json({ message: "Feedback can only be given for Hotel-scope complaints" });
    }
    if (complaint.raisedByGuest.toString() !== req.guest._id.toString()) {
      return res.status(403).json({ message: "You can only give feedback on your own complaints" });
    }

    complaint.feedback = {
      complaintFeedback,
      complaintRating,
      agentFeedback,
      agentRating,
    };
    await complaint.save();
    return res.status(200).json({ message: "Feedback submitted successfully", complaint });
  } catch (err) {
    return res.status(500).json({ message: "Failed to submit feedback", error: err.message });
  }
};