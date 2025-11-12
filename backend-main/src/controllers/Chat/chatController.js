const ChatRoom = require('../../models/ChatRoom');
const ChatMessage = require("../../models/ChatMessage");
const ApiError = require('../../utils/ApiError');
const generateUniqueId = require('../../utils/idGenerator');
const Admin = require('../../models/SuperAdmin/Admin');
const { sendNotificationForServices } = require('../../../socket');
const { notifyNewServiceRequest } = require('../../service/notificationService');
const Notifications = require('../../models/Notifications');
exports.guestInitiatesChatRequest = async (req, res, next) => {
  try {
    const guest = req.guest; 
    const guestId = req.guest._id;
    const HotelId = guest.HotelId;
    const guestQuery = req.body.guestQuery;
    if (!guestQuery) {
      return res.status(400).json({ message: 'Please provide Query First'})
    }
    if (!HotelId)
      throw new ApiError(400, 'Guest is not CheckedIn at any Hotel!')
    const existingChat = await ChatRoom.findOne({
      guestId,
      $or: [{ status: "pending" }, { status: "active" }],
    });
    if (existingChat) {
      return res.status(200).json({
        success:true,
        roomId: existingChat.roomId,
        message: "Guest Already has an unresolved chat!",
      });
    }
    const roomId = await generateUniqueId("ChatRoom", "roomId", "CR");

    const chatRoom = new ChatRoom({
      roomId,
      guestId,
      HotelId,
      guestQuery
    });
    await chatRoom.save();
    sendNotificationForServices("chat", HotelId, 'notification:services', 'A new Chat raised by a Guest', `/hotel-panel/service-management/chatwithstaff/details/${chatRoom._id}`);
    
    return res.status(201).json({
      success:true,
      roomId,
      message: "Chat Request Sent to Customer Support Agents",
    });
  } catch (error) {
      console.log(error)
     return next(error)
  }
}

exports.getActiveChat = async (req, res, next) => {
  try {
    const guestId = req.guest._id;

    const chatRoom = await ChatRoom.findOne({
      guestId,
      $or: [{ status: "pending" }, { status: "active" }],
    }).lean();

    if (!chatRoom) {
      return res.status(200).json({
        success: false,
        message: "No active or pending chat found",
      });
    }

    const messages = await ChatMessage.find({ roomId: chatRoom.roomId })
      .sort({ createdAt: 1 }) // oldest to newest
      .lean();

    return res.status(200).json({
      success: true,
      roomId: chatRoom.roomId,
      chatRoom,
      messages,
    });
  } catch (error) {
   return next(error);
  }
};

/**
* @route   GET /api/chatrooms
* @desc    Retrieve a paginated list of chat rooms
* @query   page   - Page number (default 1)
*          limit  - Docs per page (default 20, max 100)
*          status - (optional) Filter by status: pending | active | closed
*          guestId|agentId|hotelId - (optional) Exact-match filters
*          search - (optional) Case-insensitive regex on roomId
* @access  Admin / Agent dashboard (auth handled in route-level middleware)
*/
exports.getChatRooms = async (req, res, next) => {
  try {
    
  let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 20, 1), 100); // cap at 100

  const filter = {};
  if (req.guest) {
    filter.guestId = req.guest._id;
    filter.HotelId = req.guest.HotelId;
  } else if (req.user) {
    filter.HotelId = req.user.HotelId;
  } else throw new ApiError(400, "Invalid UserType!");

  const [totalDocs, chatRooms] = await Promise.all([
    ChatRoom.countDocuments(filter),
    ChatRoom.find(filter)
      .populate(
        "guestId",
        "firstName firstName phoneNumber assignedRoomNumber uniqueId"
      )
      .populate({
        path: "agentId assignedTo",
        select: "firstName lastName phoneNumber email uniqueId roleId",
        populate: {
          path: "roleId",
          select: "name", // whatever fields you want from Roles
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  const totalPages = Math.ceil(totalDocs / limit);

  return res.status(200).json({
    success: true,
    data: chatRooms,
    meta: {
      pagination: {
        totalDocs,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    },
  });
  } catch (error) {
   return next(error)
  }
};

/**
 * @route   GET /api/chatrooms/:id
 * @desc    Retrieve a single chat room (by Mongo _id *or* roomId string)
 *          and its entire message transcript (chronologically sorted).
 *          Optional message pagination is provided for future scalability
 *          but returns full transcript by default.
 * @param   id   - Mongo ObjectId OR the `roomId` value
 * @query   msgPage / msgLimit (optional) – to page messages, if needed
 * @access  Admin, Agent, or Guest (auth / ACL handled in router middleware)
 */
exports.getChatRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = { _id: id };
    if (req.guest) {
      filter.guestId = req.guest._id;
      filter.HotelId = req.guest.HotelId;
    } else if (req.user) {
      filter.HotelId = req.user.HotelId;
    }

    const chatRoom = await ChatRoom.findOne(filter)
      .populate(
        "guestId",
        "firstName firstName phoneNumber assignedRoomNumber uniqueId"
      )
      .populate({
        path: "agentId assignedTo",
        select: "firstName lastName phoneNumber email uniqueId roleId",
        populate: {
          path: "roleId",
          select: "name", // whatever fields you want from Roles
        },
      })
      .lean();

    if (!chatRoom) {
      throw new ApiError(404, "Chat room not found");
    }

    const messageFilter = { roomId: chatRoom.roomId };
    const messageQuery = ChatMessage.find(messageFilter).sort({ createdAt: 1 });

    const messages = await messageQuery.lean();
    
    let activeDuration = null;
        // Assuming you have a ChatRoom document called chatRoom
    if (chatRoom.startTime && chatRoom.endTime) {
      const durationMs = chatRoom.endTime - chatRoom.startTime;
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      activeDuration = `${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''}`;
    } 
    return res.status(200).json({
      success: true,
      data: {
        chatRoom,
        messages,
        activeDuration: chatRoom.startTime && chatRoom.endTime ? activeDuration : null  
      },
    });
  } catch (error) {
   return next(error)
  }
}

exports.assignEmployee = async (req, res, next) => {
  const ios = req.app.get('io');

  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      throw new ApiError(404, "employeeId is missing");
    }
    const chatId = req.params.chatId
    if (!chatId) {
      throw new ApiError(404, 'chatId is missing!')
    }
    const chat = await ChatRoom.findById (chatId);
    if (!chat) {
      throw new ApiError(404, 'chat not found!')
    }
    if (chat.status === 'closed') {
      throw new ApiError(400, 'Cannot assign Employee to a closed chat')
    }
   
    const employee = await Admin.findById(employeeId)
    if (employee.scope !== req.user.scope) {
      throw new ApiError(403, 'Assigned Employee Out of Scope!')
    }
    if (req.user.scope === 'Hotel' && req.user.HotelId.toString() !== employee.HotelId.toString()) {
       throw new ApiError(403, "Assigned Employee Out of Scope!");
    }
    chat.assignedTo = employeeId;
    ios.to(employee._id.toString()).emit('notification:services', {
      moduleName:'chat',
      message:'A Chat has been Assigned to you',
      link:`/hotel-panel/service-management/chatwithstaff/${chat._id}`,
    });
    
    await Notifications.create({
      adminId: employee._id,
      HotelId: req.user.HotelId.toString(),
      title: `New Notification from chat`,
      message:"A Chat has been Assigned to you",
      moduleName: 'chat',
      link: `/hotel-panel/service-management/chatwithstaff/${chat._id}`,
    });
    await chat.save()
    return res.status(200).json({
      message: 'Employee Assigned To chat',
      chat
  })
  } catch (error) {
   return next(error)
  }
}

exports.giveFeedback = async (req, res, next) => {
  try {
    const guestId = req.guest._id;
    const { roomId } = req.params;
    const { chatFeedback, chatRating, agentFeedback, agentRating } = req.body;

    if (!roomId) {
      throw new ApiError(400, "roomId is required");
    }

    const chatRoom = await ChatRoom.findOne({ roomId, guestId });

    if (!chatRoom) {
      throw new ApiError(404, "Chat room not found");
    }
    if (chatRoom.guestId.toString() !== guestId.toString()) {
      throw new ApiError(403, "You are not authorized to give feedback for this chat");
    }
    
    if (chatRoom.status !== "closed") {
      throw new ApiError(400, "Feedback can only be given for closed chats");
    }
    
    // Update feedback fields
    chatRoom.feedback.chatFeedback = chatFeedback || chatRoom.feedback.chatFeedback;
    chatRoom.feedback.chatRating = chatRating || chatRoom.feedback.chatRating;
    chatRoom.feedback.agentFeedback = agentFeedback || chatRoom.feedback.agentFeedback;
    chatRoom.feedback.agentRating = agentRating || chatRoom.feedback.agentRating;

    
    await chatRoom.save();

    return res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: chatRoom.feedback,
    });
  } catch (error) {
   return next(error);
  }
}