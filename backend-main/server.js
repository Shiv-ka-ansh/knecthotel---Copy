const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

const connectDB = require("./src/config/db");
const errorHandler = require("./src/middlewares/errorHandler");
const { initializeSocket } = require("./socket");
const { updateServiceAvailability } = require("./src/cron-jobs/servingDepartments");
const { registerCrons } = require("./src/cron-jobs/updateFacilityCapacity");
const stayflexiPartnerRoutes = require("./src/routes/partners.stayflexi");

// Load environment variables
dotenv.config();
["PORT", "MONGO_URI"].forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing ${varName} environment variable`);
    process.exit(1);
  }
});

(async () => {
  // Initialize Express app and HTTP server
  const app = express();
  const server = http.createServer(app);
  
  // Connect to MongoDB
  connectDB().catch((err) => console.error("DB connection failed", err));


  // Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(morgan("dev"));
  // updateServiceAvailability()

  // Webhook route (needs raw body)
  const webhookRoutes = require("./src/routes/Payment/webhookRoutes");
  app.use(
    "/api/webhooks",
    express.raw({ type: "application/json" }),
    webhookRoutes
  );

  app.use(express.json());

  // API Routes
  app.get("/", (req, res) => res.send("KnectHotel Backend Running"));

  app.use(
    "/api/superAdmin",
    require("./src/routes/SuperAdmin/superAdminRoutes")
  );
  app.use("/api/role", require("./src/routes/Roles/roleRoutes"));
  app.use("/api/hotel", require("./src/routes/Hotel/hotelRoutes"));
  app.use("/api/employee", require("./src/routes/Employee/employeeRoutes"));
  app.use("/api/guest", require("./src/routes/Guests/guestRoues"));
  app.use("/api/saved-guests", require("./src/routes/Guests/savedGuests"));
  app.use(
    "/api/subscription",
    require("./src/routes/Subscription/subscriptionRoutes")
  );
  app.use("/api/booking", require("./src/routes/Bookings/bookingRoutes"));
  app.use("/api/complaint", require("./src/routes/Complaints/complaintRoutes"));
  app.use("/api/coupon", require("./src/routes/Coupons/couponsRoutes"));
  app.use("/api/services", require("./src/routes/Services/serviceRoutes"));
  app.use(
    "/api/services/housekeeping",
    require("./src/routes/Services/housekeepingRoutes")
  );
  app.use(
    "/api/services/reception",
    require("./src/routes/Services/receptionRoutes")
  );
  app.use(
    "/api/services/facility",
    require("./src/routes/Services/facilityRoutes")
  );
  app.use(
    "/api/services/swimming-pool",
    require("./src/routes/Services/swimmingPoolRoutes")
  );
  app.use(
    "/api/services/swimming-pool-details",
    require("./src/routes/Services/swimmingPoolDetailsRoutes")
  );
  app.use(
    "/api/services/spasalon",
    require("./src/routes/Services/spaSalonRoutes")
  );
  app.use('/api/services/spa-salon-slots', require('./src/routes/Services/spaSalonSlotRoutes'));

  app.use(
    "/api/services/inroomcontrol",
    require("./src/routes/Services/inRoomControlRoutes")
  );
  app.use(
    "/api/services/inroomdining",
    require("./src/routes/Services/inRoomDiningRoutes")
  );
  app.use(
    "/api/services/concierge",
    require("./src/routes/Services/conciergeRoutes")
  );
  app.use(
    "/api/transactions",
    require("./src/routes/Transaction/transactionRoutes")
  );
  app.use("/api/upload", require("./src/routes/Upload/uploadRoutes"));

  app.use("/api/chat", require("./src/routes/Chat/chatRoutes"));

  app.use("/api/sos", require("./src/routes/Sos/sosRoutes"));

  app.use("/api/refund", require("./src/routes/Refund/refundRoutes"));

  app.use("/api/dashboard", require("./src/routes/Dashboard/dashboard"));
  
  app.use("/api/notification", require("./src/routes/Notification/notificationRoutes"));
  
  app.use("/api/reports", require("./src/routes/Reports/reportsRoutes"));
  
  app.use("/api/invoice", require("./src/routes/Invoice/invoiceRoutes"));

  
// Mount the Stayflexi partner routes
   app.use("/", stayflexiPartnerRoutes);


  // Error handler
  app.use(errorHandler);

  // Start the server
  const PORT = process.env.PORT;
   server.listen(PORT, () => {
     console.log(`Server started on port ${PORT}`);

     // Initialize non-critical services AFTER startup
     const io = socketIO(server, { cors: { origin: "*" } });
     initializeSocket(io);
     app.set("io", io);
     updateServiceAvailability();
     registerCrons();
   });
})();
