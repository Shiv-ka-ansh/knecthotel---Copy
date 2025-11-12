const cron = require("node-cron")
const moment = require('moment-timezone')

const ApiError = require('../utils/ApiError')

const Hotel = require('../models/Hotel')



const updateServiceAvailability = async () => {
  try {
    const hotels = await Hotel.find({
      "serviceAvailability.0": { $exists: true },
    }).select("serviceAvailability servingDepartment timezone");

    const now = new Date();

    for (const hotel of hotels) {
      const timezone = hotel.timezone || "Asia/Kolkata";
      const currentDay = moment(now).tz(timezone).format("dddd");
      const currentTime = moment(now).tz(timezone).format("HH:mm");

      // Get list of managed services (those with schedules)
      const managedServices = hotel.serviceAvailability.map((s) => s.service);

      // Services without schedules (always available)
      const alwaysAvailableServices = (hotel.servingDepartment || []).filter(
        (service) => !managedServices.includes(service)
      );

      const activeServices = new Set(alwaysAvailableServices);

      // Process scheduled services
      hotel.serviceAvailability.forEach(({ service, schedules }) => {
        const todaysSchedule = schedules.filter((s) => s.day === currentDay);

        const isActive = todaysSchedule.some(({ startTime, endTime }) => {
          return currentTime >= startTime && currentTime <= endTime;
        });

        if (isActive) activeServices.add(service);
      });

      // Update if changed
      const newServices = Array.from(activeServices);

      // Helper function to compare arrays
      const arraysEqual = (a, b) => {
        if (a?.length !== b?.length) return false;
        const setA = new Set(a);
        return (
          b.every((item) => setA.has(item)) &&
          a.every((item) => new Set(b).has(item))
        );
      };

      if (!arraysEqual(hotel.servingDepartment, newServices)) {
        hotel.servingDepartment = newServices;
        await hotel.save();
        console.log(`Updated services for hotel ${hotel._id}:`, newServices);
      }
    }
    console.log("CronJob : Service availability update completed");
  } catch (error) {
    console.error("Service availability cron error:", error);
  }
};

const arraysEqual = (a, b) => {
  return a.length === b.length && new Set([...a, ...b]).size === a.length;
};

cron.schedule("*/3 * * * *", updateServiceAvailability);

module.exports = {updateServiceAvailability}