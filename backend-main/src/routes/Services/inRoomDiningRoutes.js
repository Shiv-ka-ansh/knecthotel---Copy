const express = require("express");
const router = express.Router();

const {
  addProduct,
  updateProduct,
  getAllProducts,
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCart,
  calculateCartPrice,
  bulkUploadProducts,
} = require("../../controllers/Services/inRoomDiningController");

const {
  validateToken,
  guestAuth,
} = require("../../middlewares/authMiddleware");
const { changeStatus, getServiceRequests, getServiceRequestById } = require("../../controllers/Services/serviceRequestController");
const permissionMiddleware = require("../../middlewares/permissionMiddleware");
const { setServiceType } = require("../../utils/servicesHelper");

/* Admin */
router.post(
  "/products",
  validateToken,
  permissionMiddleware("inroomdining", "write"),
  addProduct
);
router.post(
  "/products/bulk-upload",
  validateToken,
  permissionMiddleware("inroomdining", "write"),
  bulkUploadProducts
);
router.get(
  "/products",
  validateToken,
  permissionMiddleware("inroomdining", "read"),
  getAllProducts
);
router.put(
  "/products/:id",
  validateToken,
  permissionMiddleware("inroomdining", "write"),
  updateProduct
);
router.patch(
  "/status/:id",
  validateToken,
  permissionMiddleware("inroomdining", "write"),
  changeStatus
);
// router.get(
//   "/bookings",
//   validateToken,
//   permissionMiddleware("inroomdining", "write"),
//   getBookings
// );

router.get(
  "/bookings",
  validateToken,
  permissionMiddleware("inroomdining", "write"),
  setServiceType("InRoomDiningBooking"),
  getServiceRequests
);

router.get(
  "/bookings/:id",
  validateToken,
  permissionMiddleware("inroomdining", "write"),
    setServiceType("InRoomDiningBooking"), getServiceRequestById
);
router.put(
  "/bookings/:id",
  validateToken,
  permissionMiddleware("inroomdining", "write"),
  updateBooking
);

/* Guest */
router.get("/guest/products", guestAuth, getAllProducts);
router.post("/guest/bookings", guestAuth, createBooking);
// router.get("/guest/bookings", guestAuth, getBookings);
router.get(
  "/guest/bookings",
  guestAuth,
  setServiceType("InRoomDiningBooking"),
  getServiceRequests
);
router.get("/guest/bookings/:id", guestAuth,   setServiceType("InRoomDiningBooking"), getServiceRequestById);
router.get("/guest/cart", guestAuth, getCart);
router.post("/guest/cart/add", guestAuth, addToCart);
router.put("/guest/cart/update", guestAuth, updateCartItem);
router.delete("/guest/cart/remove/:productId", guestAuth, removeFromCart);
router.delete("/guest/cart/clear", guestAuth, clearCart);
router.post("/guest/cart/pricing", guestAuth, calculateCartPrice);


module.exports = router;
