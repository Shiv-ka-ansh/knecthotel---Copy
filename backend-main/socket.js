const ApiError = require("./src/utils/ApiError");
const jwt = require("jsonwebtoken");
const { generateMessage } = require("./src/utils/message");
const ChatRoom = require("./src/models/ChatRoom");
const ChatMessage = require("./src/models/ChatMessage");
const Guest = require("./src/models/Guest");
const Admin = require("./src/models/SuperAdmin/Admin");
const { handleSocketError, SocketError } = require("./src/utils/SocketError");
const { getEmployeesByModules } = require("./src/service/employeeService");
const Notifications = require("./src/models/Notifications");
let ios;
async function initializeSocket(io) {
  ios = io
  io.use((socket, next) => {
    try {
      const authHeader =
        socket.handshake.headers.authorization || socket.handshake.auth?.token;

      if (!authHeader) throw new SocketError("Authorization token missing", 401);

      const [bearer, raw] = authHeader.split(" ");
      const token = bearer === "Bearer" ? raw : bearer;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) throw new SocketError("Invalid or expired token", 401);
      socket.userId = decoded.id;
      socket.userType = decoded.userType;
      next();
    } catch (err) {
      next(err instanceof SocketError ? err : new SocketError(err.message, 401));
    }
  });

  io.on('connection', async (socket) => {
    try {
      const { userId, userType } = socket;
      const user =
        userType === "Guest"
          ? await Guest.findById(userId)
          : await Admin.findById(userId);

      if (!user)
        throw new SocketError(`No user found for id ${userId}`, 404);
      console.log(`User ${user.firstName} ${user.lastName} from ${user.HotelId ? user.HotelId : 'Platform'} ${user.HotelId ? 'Hotel' : ''} connected`);
      await socket.join(userId.toString());

      if (userType === "Admin" && user.HotelId) {
        const hotelRoomId = user.HotelId.toString(); // or dynamically based on hotel
        await socket.join(hotelRoomId);
      }

      socket.emit(
        "Connection",
        `${user.firstName + " " + user.lastName} Connected to server`
      );

      socket.on("guest:joinChat", async (data) => {
        try {
          if (!data || !data.roomId) {
            throw new SocketError("roomId is required", 400);
          }

          const chatRoom = await ChatRoom.findOne({
            guestId: userId,
            roomId: data.roomId,
          }).populate("guestId");

          if (!chatRoom) {
            throw new SocketError(
              "ChatRoom not found with that roomId",
              404
            );
          }

          await socket.join(data.roomId);

          socket.emit("chat:welcome-message", {
            roomId: data.roomId,
            senderId: null,
            senderType: "Agent",
            message: "A customer support agent is on his way to chat with you!",
          });

          io.to(data.roomId).emit("chat:guestJoined", {
            roomId: data.roomId,
            message: `${chatRoom.guestId.firstName} ${chatRoom.guestId.lastName} has joined the chat!`,
          });
        } catch (error) {
          handleSocketError(socket, error);
        }
      });

      socket.on("guest:rejoinChat", async (data) => {
        try {
          if (!data || !data.roomId) {
            throw new SocketError("roomId is required", 400);
          }
          const chatRoom = await ChatRoom.findOne({
            guestId: userId,
            roomId: data.roomId,
            status: "active",
          }).populate("guestId");

          if (!chatRoom) {
            throw new SocketError("roomId is required", 400);
          }

          const { roomId } = chatRoom;
          await socket.join(roomId);

          socket.emit("chat:welcome-message", {
            roomId,
            message: "Welcome back! You've been reconnected to the chat.",
          });

          socket.to(roomId).emit("chat:guestJoined", {
            roomId,
            message: `${chatRoom.guestId.firstName} ${chatRoom.guestId.lastName} rejoined the chat.`,
          });

        } catch (err) {
          handleSocketError(socket, err);
        }
      });


      socket.on("agent:joinChat", async (data) => {
        try {
          if (!data || !data.roomId) {
            throw new SocketError("roomId is required", 400);
          }

          let chatRoom = await ChatRoom.findOne(
            { roomId: data.roomId }
          ).lean();

          if (!chatRoom) {
            throw new SocketError(
              "ChatRoom not found with that roomId",
              404
            );
          }

          // Check if the current agent is assigned to this chat
          if (chatRoom.agentId && chatRoom.assignedTo.toString() !== userId.toString()) {
            throw new SocketError(
              "You are not assigned to this chat room",
              403
            );
          }

          // Update the chat room with new agent
          chatRoom = await ChatRoom.findOneAndUpdate(
            { roomId: data.roomId },
            { 
              status: "active", 
              agentId: userId, 
              startTime: chatRoom.startTime || new Date() 
            },
            { new: true }
          ).populate({
            path: "agentId assignedTo",
            select: "firstName lastName phoneNumber email uniqueId",
            populate: {
              path: "roleId",
              select: "name"
            },
          });
          await socket.emit("agent:joinSuccess", {
            roomId: data.roomId,
            message: "You have joined the chat!",
            chatRoom,
          });
          
          await socket.join(data.roomId);

          io.to(data.roomId).emit("chat:agentJoined", {
            roomId: data.roomId,
            message: `Your chat is now being connected to ${chatRoom.agentId.firstName} ${chatRoom.agentId.lastName} from ${chatRoom.agentId.roleId.name}`
          });

        } catch (error) {
          handleSocketError(socket, error);
        }
      });
      socket.on("chat:close", async (data) => {
        try {
          const roomId = data.roomId;
          if (!roomId) throw new SocketError("roomId is required", 400);

          const chatRoom = await ChatRoom.findOneAndUpdate(
            { roomId },
            { status: "closed", endTime: new Date() },
            { new: true }
          );
          if (!chatRoom) {
            throw new SocketError("Chat room not found", 404);
          }
          socket.to(roomId.toString()).emit("chat:closed", {
            message: "You have closed the chat!",
            chatRoom,
          });

          await socket.leave(roomId);
        } catch (error) {
          handleSocketError(socket, error);
        }
      });
      socket.on("message:send", async ({ roomId, message }) => {
        try {
          if (!roomId) throw new SocketError("roomId is required", 400);
          if (!message)
            throw new SocketError("message cannot be empty", 400);
          // check here if the user is part of the room
          const chatRoom = await ChatRoom.findOne({ roomId }).lean();
          if (!chatRoom) {
            throw new SocketError("Chat room not found", 404);
          }

          const userType = socket.userType;
          const userId = socket.userId;
          if (userType === "Admin" && chatRoom.agentId.toString() !== userId.toString()) {
            throw new SocketError(
              "You are not authorized to send messages in this room",
              403
            );
          }
          if (userType === "Guest" && chatRoom.guestId.toString() !== userId.toString()) {
            throw new SocketError(
              "You are not authorized to send messages in this room",
              403
            );
          }

          const newMsg = await ChatMessage.create({
            roomId,
            senderId: userId,
            senderType: userType,
            message,
          });

          socket.to(roomId).emit("message:receive", newMsg);
        } catch (error) {
          handleSocketError(socket, error);
        }
      });


      socket.on("disconnect", () => {
        const userId = socket.userId;
        console.log(`User ${userId} disconnected!`);
      });
    } catch (error) {
      handleSocketError(socket, error);
    }
  })

}
const sendNotificationForServices = async (
  moduleName,
  HotelId,
  eventName,
  message,
  link
) => {
  const employees = await getEmployeesByModules(moduleName, HotelId);
  for (const employee of employees) {
    ios.to(employee._id.toString()).emit(eventName, {
      moduleName,
      message,
      link,
    });

    await Notifications.create({
      adminId: employee._id,
      HotelId,
      title: `New Notification from ${moduleName}`,
      message,
      moduleName: moduleName,
      link,
    });
  }
};
module.exports = { initializeSocket, sendNotificationForServices };