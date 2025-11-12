// src/config/modules.js
module.exports = {
  modules: [
    {
      name: "dashboard",
      permissions: ["read", "write", "delete"],
    },
    // Admin / Employee - management
    {
      name: "admin-management",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "roles-and-permissions",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "coupons-management",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "refund-management",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "hotel-management",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "complaint-management",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "subscription-management",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "payment-management",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "guest-management",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "analytics-reports",
      permissions: ["read", "write", "delete"],
    },
    
    // service - management
    {
      name: "reception",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "housekeeping",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "inroomdining",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "gym",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "spa",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "swimmingpool",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "conciergeservice",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "in_room_control",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "ordermanagement",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "payment-management",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "sos",
      permissions: ["read", "write", "delete"],
    },
    {
      name: "chat",
      permissions: ["read", "write", "delete"],
    },
  ],
};