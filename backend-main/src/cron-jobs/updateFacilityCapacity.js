const cron = require("node-cron");
const Hotel = require("../models/Hotel");
const FacilityItem = require("../models/services/FacilityItem");
const SpaSalonSlot = require("../models/services/SpaSalonSlot");

// IMPORTANT: Make sure this import matches the ACTUAL model export.
// If your schema file exports `mongoose.model("SwimmingPoolDetails", ...)` then
// require that file and name it accordingly:
const SwimmingPoolDetails = require("../models/services/SwimmingPoolSlots");
const Notifications = require("../models/Notifications");
const {  updateCouponsStatus } = require("../utils/couponUtils");
// ^ If your file actually exports SwimmingPoolDetails model, rename the require path or variable
// to the real file. Otherwise queries will never match.


let capacityTask;
let notificationTask;
let couponsExpirationTask
// keep a reference so GC won't collect it & to prevent double-registers

const updateAllCapacities = async () => {
  const today = new Date();
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = daysOfWeek[today.getDay()];

  try {
    // 1) FacilityItem (embedded slots[])
    const hotels = await Hotel.find({}, { _id: 1 }).lean();
    let facilityDocsTouched = 0;

    for (const hotel of hotels) {
      const facilities = await FacilityItem.find({ HotelId: hotel._id }).select("slots");
      for (const facility of facilities) {
        let modified = false;
        facility.slots.forEach((slot) => {
          if (slot.dayOfWeek === dayName) {
            slot.currentCapacity = slot.maxCapacity;
            modified = true;
          }
        });
        if (modified) {
          facility.markModified("slots");
          await facility.save();
          facilityDocsTouched++;
        }
      }
    }

    // 2) SpaSalonSlot (one doc per slot) -> pipeline update (MongoDB 4.2+)
    const spaUpdateResult = await SpaSalonSlot.updateMany(
      { dayOfWeek: dayName },
      [{ $set: { currentCapacity: "$maxCapacity" } }]
    );

    // 3) SwimmingPoolDetails (embedded slots[])
    const pools = await SwimmingPoolDetails.find(
      { "slots.dayOfWeek": dayName },
      { slots: 1 }
    );
  
    let poolDocsTouched = 0;
    for (const pool of pools) {
      let modified = false;
      pool.slots.forEach((slot) => {
        if (slot.dayOfWeek === dayName) {
          slot.currentCapacity = slot.maxCapacity;
          modified = true;
        }
      });
      if (modified) {
        pool.markModified("slots");
        await pool.save();
        poolDocsTouched++;
      }
    }

    console.log(
      `[${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}] Capacities reset for ${dayName} → ` +
      `FacilityItem docs: ${facilityDocsTouched}, ` +
      `SpaSalonSlot matched: ${spaUpdateResult.matchedCount ?? spaUpdateResult.n}, modified: ${spaUpdateResult.modifiedCount ?? spaUpdateResult.nModified}, ` +
      `SwimmingPoolDetails docs: ${poolDocsTouched}`
    );
  } catch (error) {
    console.error("Capacity reset cron error:", error);
  }
};
const deleteNotifications = async () => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // midnight today

    const result = await Notifications.deleteMany({
      createdAt: { $lt: todayStart }
    });
    console.log(`Deleted ${result.deletedCount} notifications.`);
  } catch (error) {
    console.error("Error deleting notifications:", error);
  }
};

/**
 * Register the cron task ONCE. It won’t run immediately—only at the scheduled time.
 */
function registerCrons() {
  if (!capacityTask) {
    capacityTask = cron.schedule("0 3 * * *", updateAllCapacities, {
      timezone: "Asia/Kolkata",
    });
    console.log("[CRON] Capacity cron registered to run daily at 3:00 AM IST.");
  }

  if (!notificationTask) {
    notificationTask = cron.schedule("10 3 * * *", deleteNotifications, {
      timezone: "Asia/Kolkata",
    });
    console.log("[CRON] Notifications cron registered to run daily at 3:00 AM IST.");
  }
  
  if (!couponsExpirationTask) {
    couponsExpirationTask = cron.schedule("1 0 * * *"
      , updateCouponsStatus, {
      timezone: "Asia/Kolkata",
    });
    console.log("[CRON] Coupons cron registered to run daily at 12:01 AM IST.");
  }
}


module.exports = { registerCrons, updateAllCapacities };
