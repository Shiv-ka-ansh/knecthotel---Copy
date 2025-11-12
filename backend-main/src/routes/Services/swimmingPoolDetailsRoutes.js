const express = require("express");
const router = express.Router();
const swimmingPoolDetailsController = require("../../controllers/Services/swimmingPoolDetailsController");
const { validateToken, guestAuth } = require("../../middlewares/authMiddleware");
const permissionMiddleware = require("../../middlewares/permissionMiddleware");

// CRUD for swimming pool details
router.post(
    "/",
    validateToken,
    permissionMiddleware("swimmingpool", "write"),
    swimmingPoolDetailsController.createSwimmingPoolDetails
);
router.get(
    "/",
    validateToken,
    permissionMiddleware("swimmingpool", "read"),
    swimmingPoolDetailsController.getSwimmingPoolDetailsByHotelId
);
router.put(
    "/",
    validateToken,
    permissionMiddleware("swimmingpool", "write"),
    swimmingPoolDetailsController.updateSwimmingPoolDetails
);

// Slot management
router.post(
    "/slots",
    validateToken,
    permissionMiddleware("swimmingpool", "write"),
    swimmingPoolDetailsController.addSlot
);
router.put(
    "/slots/:slotId",
    validateToken,
    permissionMiddleware("swimmingpool", "write"),
    swimmingPoolDetailsController.updateSlot
);
router.delete(
    "/slots/:slotId",
    validateToken,
    permissionMiddleware("swimmingpool", "write"),
    swimmingPoolDetailsController.deleteSlot
);

router.get(
    "/guests",
    guestAuth,
    swimmingPoolDetailsController.getSwimmingPoolDetailsByHotelId
)

module.exports = router;
