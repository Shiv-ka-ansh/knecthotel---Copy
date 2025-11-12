const express = require("express");
const router = express.Router();
const {
  assignEmployee,
  getGuestServiceRequests,
  changeStatus,
  getAllServingDepartments,
  toggleServices,
  searchServiceRequests,
  setGstPercentage,
  getGstPercentage,
  getGstPercentageByModule,
} = require("../../controllers/Services/serviceRequestController");
const {
  validateToken,
  guestAuth,
} = require("../../middlewares/authMiddleware");
const permissionMiddleware = require("../../middlewares/permissionMiddleware");
const {
  getAllServiceRequest,
  getServiceRequestById,
  orderDetails,
  giveFeedback,
} = require("../../controllers/Services/orderController");

//Assign Employee to a Service
router.put("/assignEmployee/:serviceId", validateToken, assignEmployee);


router.patch("/status/:id", validateToken, changeStatus);

router.get("/get-serving-departments", validateToken, getAllServingDepartments)

router.patch("/toggle-services/:service", validateToken, toggleServices)

router.get("/orders", validateToken, getAllServiceRequest)
router.get("/order/:id", validateToken, getServiceRequestById)
router.get("/search/:serviceType", validateToken, searchServiceRequests);
router.post("/gstPercentage/:serviceName", validateToken, setGstPercentage);
router.get("/gstPercentage", validateToken, getGstPercentage);
router.get("/gstPercentage/:module", guestAuth, getGstPercentageByModule);
router.get("/guest", guestAuth, getGuestServiceRequests);
router.post("/guest/feedback/:id", guestAuth, giveFeedback)
router.get("/guest/order/:id", guestAuth, orderDetails)
router.get("/guest/get-serving-department", guestAuth, getAllServingDepartments);

module.exports = router;