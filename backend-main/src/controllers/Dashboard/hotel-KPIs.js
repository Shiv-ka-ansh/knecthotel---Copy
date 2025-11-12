// controllers/dashboardController.ts
const {
  startOfDay,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  differenceInCalendarDays,
  format,
} = require("date-fns"); ;
const Admin = require('../../models/SuperAdmin/Admin');
const Booking       =  require('../../models/Bookings');
const ServiceRequest = require('../../models/services/ServiceRequest');

const pad = (n) => n.toString().padStart(2, "0");

/**
 * GET /api/dashboard/cases?type=employee&range=lastYear
 */
exports.getEscalationCounts = async (req, res) => {
  try {
    const { type, range } = req.query;

    if (!["employee", "booking", "service"].includes(type))
      return res.status(400).json({ message: "invalid type param" });

    // ──────────────────────────────────────────────────────────────────────
    // 1) pick the Mongoose model
    // ──────────────────────────────────────────────────────────────────────
    const Model = {
      employee: Admin,
      booking: Booking,
      service: ServiceRequest,
    }[type];

    // ──────────────────────────────────────────────────────────────────────
    // 2) build [start,end] window + bucket  ➜  labels[]
    // ──────────────────────────────────────────────────────────────────────
    const tz = "Asia/Kolkata";
    const today = startOfDay(new Date());

    let start, end, mongoFmt, labels;

    switch (range) {
      // -------------------------------------------------------------------
      case "today": {
        start = today;
        end = new Date(); // now
        mongoFmt = "%H"; // 00‑23
        labels = Array.from({ length: 24 }, (_, h) => `${pad(h)}:00`);
        break;
      }

      // -------------------------------------------------------------------
      case "lastWeek": {
        start = subDays(today, 6); // today – 6  = 7 days incl. today
        end = new Date();
        mongoFmt = "%d-%b"; // e.g. 15-Jul
        labels = eachDayOfInterval({ start, end }).map((d) =>
          format(d, "d-LLL")
        );
        break;
      }

      // -------------------------------------------------------------------
      case "lastMonth": {
        // previous full calendar month (e.g. if today = 22 Jul, window = 1‑30 Jun)
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        // derive how many week buckets are needed
        const daysInMonth = differenceInCalendarDays(end, start) + 1; // (28‑31)
        const weekCount = Math.ceil(daysInMonth / 7); // 4 or 5

        labels = Array.from({ length: weekCount }, (_, i) => `Week ${i + 1}`);
        mongoFmt = null; // we will compute week index manually below
        break;
      }
      case "lastQuarter": {
        start = startOfMonth(subMonths(today, 2)); // current‑2  … current
        end = new Date();
        mongoFmt = "%b"; // Jan, Feb, …
        labels = eachMonthOfInterval({ start, end }).map((d) =>
          format(d, "LLL")
        );
        break;
      }
      // -------------------------------------------------------------------
      case "lastYear": {
        start = startOfYear(subMonths(today, 11)); // past 12 months inc. current
        end = endOfYear(today);
        mongoFmt = "%b"; // Jan…Dec
        labels = eachMonthOfInterval({ start, end }).map((d) =>
          format(d, "LLL")
        );
        break;
      }

      default:
        return res.status(400).json({ message: "invalid range param" });
    }

    // ──────────────────────────────────────────────────────────────────────
    // 3) build aggregation pipeline
    // ──────────────────────────────────────────────────────────────────────
    const match = { createdAt: { $gte: start, $lte: end } };

    // only models that *have* HotelId should be filtered; Admin might not
    if (Model.schema.path("HotelId")) match.HotelId = req.user.HotelId;

    let pipeline;

    if (range === "lastMonth") {
      // -------- group by "week index" inside that month (0,1,2,3,4) ----------
      pipeline = [
        { $match: match },
        {
          $addFields: {
            weekOfMonth: {
              $floor: {
                $divide: [
                  {
                    $dateDiff: {
                      startDate: start, // JS Date object is OK here (driver v5+)
                      endDate: "$createdAt",
                      unit: "day",
                    },
                  },
                  7,
                ],
              },
            },
          },
        },
        { $group: { _id: "$weekOfMonth", total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ];
    } else {
      // ---------- default path uses $dateToString directly -------------------
      pipeline = [
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: {
                format: mongoFmt,
                date: "$createdAt",
                timezone: tz,
              },
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ];

      // patch “today” labels so Mongo's '00' becomes '00:00', etc.
      if (range === "today") {
        pipeline.push({
          $addFields: {
            _id: { $concat: ["$_id", ":00"] },
          },
        });
      }
    }

    const data = await Model.aggregate(pipeline);

    // ──────────────────────────────────────────────────────────────────────
    // 4) align to labels[]  (fill missing buckets with 0)
    // ──────────────────────────────────────────────────────────────────────
    const lookup = Object.fromEntries(
      data.map((d) =>
        range === "lastMonth"
          ? [`Week ${d._id + 1}`, d.total] // convert int → 'Week N'
          : [d._id, d.total]
      )
    );

    const series = labels.map((lbl) => lookup[lbl] ?? 0);

    return res.json({ labels, data: series });
  } catch (err) {
    next(err); // let your global error‑handler middleware respond 5xx
  }
};

const ALL_SERVICES = [
  "SpaSalonBooking",
  "ConciergeRequest",
  "FacilityRequest",
  "HousekeepingRequest",
  "InRoomControlRequest",
  "InRoomDiningBooking",
  "ReceptionRequest",
  "SwimmingPoolBooking",
];

exports.getServiceStatusCounts = async (req, res, next) => {
  try {
    const { range } = req.query;

    // ─────────────────────────── date window ──────────────────────────────
    const today = startOfDay(new Date());

    let start, end;

    switch (range) {
      case "today":
        start = today;
        end = new Date();
        break;

      case "lastWeek":
        start = subDays(today, 6);
        end = new Date();
        break;

      case "lastMonth":
        start = startOfMonth(subMonths(today, 1)); // previous calendar month
        end = endOfMonth(subMonths(today, 1));
        break;

      case "lastQuarter":
        start = startOfMonth(subMonths(today, 2)); // current‑2  … current
        end = new Date();
        break;

      case "lastYear":
        start = startOfYear(subMonths(today, 11)); // rolling 12 months
        end = endOfYear(today);
        break;

      default:
        return res.status(400).json({ message: "invalid range param" });
    }

    // ─────────────────────────── aggregation ──────────────────────────────
    const match = {
      createdAt: { $gte: start, $lte: end },
      HotelId: req.user.HotelId, // scope to the current hotel
    };

    const agg = await ServiceRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: { service: "$__t", status: "$status" },
          total: { $sum: 1 },
        },
      },
    ]);

    // ─────────────────────────── shape the reply ───────────────────────────
    // initial => every service with 0 counts
    const response = ALL_SERVICES.reduce((acc, svc) => {
      acc[svc] = { pending: 0, completed: 0 };
      return acc;
    }, {});

    agg.forEach(({ _id: { service, status }, total }) => {
      if (
        response[service] &&
        (status === "pending" || status === "completed")
      ) {
        response[service][status] = total;
      }
    });

    /* Example final shape:
       {
         SpaSalonBooking    : { pending: 4, completed: 7 },
         ConciergeRequest   : { pending: 1, completed: 0 },
         …
       }
    */
    return res.json(response);
  } catch (err) {
    next(err);
  }
};

exports.getBookingKPIs = async (req, res, next) => {
  try {
    const { range } = req.query;

    // ───────────────────────── Date windows ────────────────────────────────
    const today = startOfDay(new Date());
    let start, end;

    switch (range) {
      case "today":
        start = today;
        end = new Date();
        break;

      case "lastWeek":
        start = subDays(today, 6); // 7 days incl. today
        end = new Date();
        break;

      case "lastMonth":
        // previous full calendar month
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;

      case "lastQuarter":
        // rolling 3 months (current ‑ 2  … current month inclusive)
        start = startOfMonth(subMonths(today, 2));
        end = new Date();
        break;

      case "lastYear":
        start = startOfYear(subMonths(today, 11)); // past 12 mo
        end = endOfYear(today);
        break;

      default:
        return res.status(400).json({ message: "invalid range param" });
    }

    // previous calendar month window (always the comparator)
    const prevStart = startOfMonth(subMonths(today, 1));
    const prevEnd = endOfMonth(subMonths(today, 1));

    // ───────────────────────── Mongo aggregation helpers ───────────────────
    const buildMatch = (s, e) => {
      const m = { createdAt: { $gte: s, $lte: e } };
      if (Booking.schema.path("HotelId")) m.HotelId = req.user.HotelId;
      return m;
    };

    const buildStats = async (match) => {
      const raw = await Booking.aggregate([
        { $match: match },
        { $group: { _id: "$status", total: { $sum: 1 } } },
      ]);

      // baseline object
      const stats = {
        total: 0,
        cancelled: 0,
        checkedIn: 0,
        checkedOut: 0,
      };

      raw.forEach(({ _id, total }) => {
        stats.total += total;
        if (_id === "Cancelled") stats.cancelled = total;
        if (_id === "Checked-In") stats.checkedIn = total;
        if (_id === "Checked-Out") stats.checkedOut = total;
      });

      return stats;
    };

    const [curr, prev] = await Promise.all([
      buildStats(buildMatch(start, end)),
      buildStats(buildMatch(prevStart, prevEnd)),
    ]);

    // ───────────────────────── add % deltas ────────────────────────────────
    const pct = (now, then) =>
      then === 0
        ? now === 0
          ? 0
          : 100
        : +(((now - then) / then) * 100).toFixed(1); // one decimal

    const result = {
      total: {
        count: curr.total,
        pctVsPrevMonth: pct(curr.total, prev.total),
      },
      cancelled: {
        count: curr.cancelled,
        pctVsPrevMonth: pct(curr.cancelled, prev.cancelled),
      },
      checkedIn: {
        count: curr.checkedIn,
        pctVsPrevMonth: pct(curr.checkedIn, prev.checkedIn),
      },
      checkedOut: {
        count: curr.checkedOut,
        pctVsPrevMonth: pct(curr.checkedOut, prev.checkedOut),
      },
    };

    return res.json(result);
  } catch (err) {
    next(err);
  }
};
exports.getServiceRevenue = async (req, res, next) => {
  try {
    const { range } = req.query;

    // ─────────────── date window ───────────────────────────────────────────
    const today = startOfDay(new Date());
    let start, end;

    switch (range) {
      case "today":
        start = today;
        end = new Date();
        break;

      case "lastWeek":
        start = subDays(today, 6);
        end = new Date();
        break;

      case "lastMonth":
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;

      case "lastQuarter":
        start = startOfMonth(subMonths(today, 2)); // rolling 3 months
        end = new Date();
        break;

      case "lastYear":
        start = startOfYear(subMonths(today, 11)); // rolling 12 months
        end = endOfYear(today);
        break;

      default:
        return res.status(400).json({ message: "invalid range param" });
    }

    // ─────────────── aggregation ───────────────────────────────────────────
    const match = {
      createdAt: { $gte: start, $lte: end },
      HotelId: req.user.HotelId,
      paymentStatus: "paid", // count only realised revenue
    };

    const agg = await ServiceRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$__t", // discriminator name
          sum: { $sum: "$amount.finalAmount" },
        },
      },
    ]);

    // ─────────────── shape response ────────────────────────────────────────
    const byDepartment = ALL_SERVICES.reduce((acc, svc) => {
      acc[svc] = 0;
      return acc;
    }, {});

    let totalRevenue = 0;

    agg.forEach(({ _id, sum }) => {
      byDepartment[_id] = +sum.toFixed(2); // keep two decimals
      totalRevenue += sum;
    });

    totalRevenue = +totalRevenue.toFixed(2);

    return res.json({ totalRevenue, byDepartment });
  } catch (err) {
    next(err);
  }
};