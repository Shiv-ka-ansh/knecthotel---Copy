exports.buildFilterForUser = function (user) {
  if (user) {
    // Platform staff
    if (user.scope === "Platform") {
      return { scope: "Platform" };
    }

    // Hotel admin
    if (user.scope === "Hotel") {
      return {  HotelId: user.HotelId.toString(), scope: "Hotel" };
    }
  }
  // Guest
  return { scope: "Hotel", raisedByGuest: user._id };
};
