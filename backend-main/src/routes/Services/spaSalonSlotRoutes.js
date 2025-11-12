const express = require('express');
const router = express.Router();
const spaSalonSlotController = require('../../controllers/Services/spaSalonSlotController');
const { validateToken, guestAuth } = require('../../middlewares/authMiddleware');
const permissionMiddleware = require('../../middlewares/permissionMiddleware');

// Add slots (admin)
router.post('/add', validateToken, permissionMiddleware('spa', 'write'), spaSalonSlotController.addSlot);

// Update slot (admin)
router.put('/:slotId', validateToken, permissionMiddleware('spa', 'write'), spaSalonSlotController.updateSlot);

// Delete slot (admin)
router.delete('/:slotId', validateToken, permissionMiddleware('spa', 'write'), spaSalonSlotController.deleteSlot);

// View all slots (admin/guest)
router.get('/', validateToken, permissionMiddleware('spa', 'write'), spaSalonSlotController.getAllSlots);
router.get('/guests', guestAuth, spaSalonSlotController.getAllSlots);

module.exports = router;