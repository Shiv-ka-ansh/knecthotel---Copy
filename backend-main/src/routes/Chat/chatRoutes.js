const express = require('express');
const { guestAuth, validateToken } = require('../../middlewares/authMiddleware')
const permissionMiddleware = require("../../middlewares/permissionMiddleware")
const {
  guestInitiatesChatRequest,
  getChatRooms,
  getChatRoom,
  getActiveChat,
  assignEmployee,
  giveFeedback,
} = require("../../controllers/Chat/chatController");
const router = express.Router()

router.get("/guests/chat/active", guestAuth, getActiveChat);

router.post("/initiateChatRequest", guestAuth, guestInitiatesChatRequest);
router.get("/rooms",
    validateToken,
    permissionMiddleware('chat', 'read'),
    getChatRooms)
router.get(
  "/rooms/:id",
  validateToken,
  permissionMiddleware("chat", "read"),
  getChatRoom
);

router.put(
  "/rooms/assignEmployee/:chatId",
  validateToken,
  permissionMiddleware("chat", "write"),
  assignEmployee
);

router.get("/guests/rooms", guestAuth, getChatRooms);
router.get("/guests/rooms/:id", guestAuth, getChatRoom);
router.post("/guests/rooms/feedback/:roomId", guestAuth, giveFeedback);
module.exports = router