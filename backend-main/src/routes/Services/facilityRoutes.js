const express = require("express");
const router = express.Router();
const {
  addFacilityService,
  createFacilityRequest,
  getAllFacilityItems,
  getAllFacilityRequests,
  updateFacilitySlot,
  getAvailableFacilities,
  deleteFacilitySlot,
  getFacilityRequestById,
  updateFacilityItem,
} = require("../../controllers/Services/facilityController");
const {
  validateToken,
  guestAuth,
} = require("../../middlewares/authMiddleware");
const permissionMiddleware = require("../../middlewares/permissionMiddleware");
const { setServiceType } = require("../../utils/servicesHelper");
const { getServiceRequests, getServiceRequestById } = require("../../controllers/Services/serviceRequestController");

router.put("/update-facility/:id", validateToken, updateFacilityItem);
// Hotel Admin Routes
router.post(
  "/items",
  validateToken,
  permissionMiddleware("gym", "write"),
  addFacilityService
);

router.put(
  "/items/:id",
  validateToken,
  permissionMiddleware("gym", "write"),
  updateFacilitySlot
);

router.get(
  "/items",
  validateToken,
  permissionMiddleware("gym", "read"),
  getAllFacilityItems
);
router.delete(
  "/items/:facilityId/:slotId",
  validateToken,
  permissionMiddleware("gym", "read"),
  deleteFacilitySlot
);

// router.get(
//   "/requests",
//   validateToken,
//   permissionMiddleware("gym", "read"),
//   getAllFacilityRequests
// );
router.get(
  "/requests",
  validateToken,
  permissionMiddleware("gym", "read"),
  setServiceType("FacilityRequest"),
  getServiceRequests
);

router.get(
  "/requests/:id",
  validateToken,
  permissionMiddleware("gym", "read"),
  setServiceType("FacilityRequest"), getServiceRequestById
);


// Guest Routes
router.post("/requests", guestAuth, createFacilityRequest);
// router.get("/guest/requests", guestAuth, getAllFacilityRequests);
router.get("/guest/requests", guestAuth, setServiceType('FacilityRequest'), getServiceRequests);
router.get("/guest/requests/:id", guestAuth, setServiceType("FacilityRequest"), getServiceRequestById);
router.get("/guests/items", guestAuth, getAvailableFacilities);


module.exports = router;
setServiceType('ConciergeRequest'),
  getServiceRequests