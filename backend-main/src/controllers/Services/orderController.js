const ServiceRequest = require("../../models/services/ServiceRequest")
const ApiError = require("../../utils/ApiError");

exports.getAllServiceRequest = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit ?? "20", 10));
    const skip = (page - 1) * limit;
    
    const [total, serviceRequests] = await Promise.all([
      ServiceRequest.countDocuments(),
      ServiceRequest.find({HotelId:req.user.HotelId})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("assignedTo", "firstName lastName mobileNumber")
        .populate(
          "guest",
          "firstName lastName email phoneNumber"
        ).lean()
    ]);

    const transformedData = serviceRequests.map((item) => {
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
      return res.status(200).json({
        success: true,
        message: "All Orders Fetched Successfully",
        page,
        pages: Math.ceil(total / limit),
        total,
        serviceRequests:transformedData,
      });
  } catch (error) {
        // console.log(error)
     return next(error)
    }
}

exports.getServiceRequestById = async (req, res) => {
  try {
    const  _id  = req.params.id    
    const serviceRequest = await ServiceRequest.findOne({
      _id,
      HotelId: req.user.HotelId,
    })
      .lean()
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("HotelId", "name HotelId")
      .sort({ createdAt: -1 })
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("guest", "firstName lastName email phoneNumber");
    
    if (!serviceRequest) {
      return res.status(400).json({message:'No Order Found'})
    }
    serviceRequest.guest.assignedRoomNumber = serviceRequest.roomNumber ? serviceRequest.roomNumber : "NA"
    return res.status(200).json({
      success: true,
      message: "Order Fetched SuccessFully",
      serviceRequests: serviceRequest,
    });
  } catch (error) {
    // console.log(error)
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.giveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const {
        serviceFeedback,
        serviceRating,
        agentFeedback,
        agentRating,
    } = req.body
    
    const feedbackData = {
        serviceFeedback,
        serviceRating,
        agentFeedback,
        agentRating,
    }
    const serviceRequest = await ServiceRequest.findOneAndUpdate(
      {
        _id: id,
        guest: req.guest._id,
      },
      { feedback: feedbackData },
      { new: true }
    );
    if (!serviceRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Service Request Not found" });
    }
    console.log(serviceRequest)
    return res.status(200).json({
      success: true,
      message: "Feed Submitted Successfully Successfully",
      feedback: serviceRequest.feedback,
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Internal Server Error", error);
  }
  
}

exports.orderDetails = async (req, res) => {
  try {
    const { id } = req.params
    const serviceRequest = await ServiceRequest.findOne({
      _id: id,
      guest: req.guest._id,
    })
      .populate("amount")
      .populate("transaction", "-gatewayResponse")
      .populate(
        "guest",
        "firstName lastName phoneNumber email assignedRoomNumber profilePicture"
      )
      .populate("assignedTo", "firstName lastName mobileNumber");

      ;
    if (!serviceRequest) {
      return res.status(404).json({success:false, message:'Service Request Not found!' })
    }
    // const transformedData = data.map((item) => {
    //   // Create a copy of the guest object to avoid mutating the original
    //   const guestCopy = item.guest ? { ...item.guest } : null;

    //   if (guestCopy) {
    //     guestCopy.assignedRoomNumber = item.roomNumber ? item.roomNumber : "NA";
    //   }

    //   return {
    //     ...item,
    //     guest: guestCopy
    //   };
    // });
    return res.status(200).json({
      success: true, message: 'Order Found Successfully', 
      order:serviceRequest
    })
    
  } catch (error) {
    console.log(error)
    throw new ApiError(500, 'Internal Server Error', error)
  }
}