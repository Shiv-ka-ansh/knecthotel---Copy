const { sendNotificationForServices } = require("../../socket");
const { service_Modal_Module_Map } = require("../config/modal_module");

exports.notifyNewServiceRequest = async (serviceRequest) => {
  try {
    const serviceType = serviceRequest.constructor.modelName; // Gets discriminator name
    const moduleName = service_Modal_Module_Map[serviceType];

    if (!moduleName) {
      console.warn(`No module mapping for ${serviceType}`);
      return;
    }

    await sendNotificationForServices(
      moduleName,
      serviceRequest.HotelId,
      `notification:services`,
      `New ${serviceType} request`,
      `/hotel-panel/service-management/${moduleName}/details/${serviceRequest._id}`
    );
  } catch (error) {
    console.error("Notification failed:", error);
  }
};
