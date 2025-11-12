const sos = require("../../models/sos");
const Hotel = require("../../models/Hotel");
const ApiError = require("../../utils/ApiError");
const Guest = require("../../models/Guest");


exports.createSos = async (req, res, next) => {
    const io = req.app.get("io");
  try {
    const guestId = req.guest._id;
    const guest = await Guest.findById(guestId).select(
      "firstName lastName HotelId assignedRoomNumber phoneNumber"
    );
    const HotelId = req.guest.HotelId;
    if (!HotelId) {
        throw new ApiError(400, 'Guest not checked In at any hotel!')
    }
    const { type } = req.body;
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Missing Required fields",
      });
    }
    const newSos = new sos({
      guestId,
      type,
      HotelId,
    });
    const savedSos = await newSos.save();
    const guestDetails = guest.toObject(); // convert mongoose doc to plain object

    await io.to(HotelId.toString()).emit("sos", {
      ...savedSos.toObject(),
      guest: guestDetails, // keep guest inside a separate object
    });

    return res.status(201).json({
      success: true,
      message: "SOS Created!",
      ...savedSos.toObject(),
      guest: guestDetails,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
exports.viewGuestsSos = async (req, res, next) => {
    try {
        const guestId = req.guest._id;
        if (!guestId) {
            throw new ApiError(400, 'No Guest found associated with account!')
        }
        const allSos = await sos.find({ guestId, HotelId: req.guest.HotelId }).sort({createdAt:-1});
        return res.status(200).json({message:'Sos Found', data: allSos})
    } catch (error) {
        return next(error)
    }
}
exports.viewAll = async (req, res, next) => {
    try {
        const HotelId = req.user.HotelId;
        if (!HotelId) 
            throw new ApiError(400, "No Hotel found associated with account!");    
      const allSos = await sos.find({ HotelId }).populate('guestId', "phoneNumber firstName lastName email assignedRoomNumber").sort({createdAt:-1});
        
        return res.status(200).json({message:'Sos Found', data: allSos})
      
    } catch (error) {
        return next(error)
  }
};

exports.viewById = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) {
            throw new ApiError(404, 'Sos ID is required!')
        }
        const HotelId = req.user.HotelId;
        if (!HotelId)
            throw new ApiError(400, "No Hotel found associated with account!");
        const s = await sos.findOne({ _id: id, HotelId });
        if (!s) {
            throw new ApiError(404, 'No Sos found with given Id')
        }
        return res.status(200).json({ message: "Sos Found", data: s });
    }  catch (error) {
        return next(error);
    }
};

exports.updateSos = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
          throw new ApiError(404, "Sos ID is required!");
        }
        const HotelId = req.user.HotelId;
        if (!HotelId)
            throw new ApiError(400, "No Hotel found associated with account!");
        const { status } = req.body
        const allowedStatuses = ['pending', 'in-progress', 'completed']
        if (!allowedStatuses.includes(status)) {
            throw new ApiError(400, 'Invalid Status')
        }
        const s = await sos.findOneAndUpdate({ _id: id, HotelId }, {status}, {new:true});
        if (!s) {
          throw new ApiError(404, "No Sos found with given Id");
      }
      
        return res.status(200).json({ message: "Sos updated", data: s });
    } catch (error) {
        return next(error)
    }
}