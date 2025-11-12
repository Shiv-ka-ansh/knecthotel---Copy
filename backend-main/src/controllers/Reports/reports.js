const { default: mongoose } = require("mongoose");
const Admin = require("../../models/SuperAdmin/Admin");
const Coupons = require("../../models/Coupons");
const Refund = require("../../models/Refund");
const Bookings = require("../../models/Bookings");
const ServiceRequest = require("../../models/services/ServiceRequest");
const Complaint = require("../../models/Complaint");
const { startOfDay, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, eachMonthOfInterval, eachDayOfInterval, format, differenceInCalendarDays } = require("date-fns");
const Guest = require("../../models/Guest");
const Subscription = require("../../models/Subscription");
const Transaction = require("../../models/Transaction")
const ObjectId = mongoose.Types.ObjectId;

const ExcelJS = require("exceljs");

// Enhanced Excel generation functions
const generateExcelBufferFromRows = async (rows, sheetName = "Sheet1") => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  rows.forEach((row, rowIndex) => {
    const excelRow = worksheet.addRow(row);

    // Style the main title (first row)
    if (rowIndex === 0) {
      excelRow.eachCell((cell) => {
        cell.font = { bold: true, size: 14 };
      });
      // Merge title row if it's a single cell
      if (row.length === 1) {
        worksheet.mergeCells(`A1:${String.fromCharCode(64 + Math.max(4, row.length))}1`);
      }
    }

    // Style all header rows (rows that contain text like "Period", "Revenue", etc.)
    const isHeaderRow = row.some(cell =>
      typeof cell === 'string' &&
      ['Period', 'Revenue', 'Discount', 'Actual Cost', 'Service Type',
        'Total Count', 'Active Count', 'Inactive Count', 'Total Bookings',
        'Revenue Generated', 'Pending Services', 'Completed Services'].includes(cell)
    );

    if (isHeaderRow) {
      excelRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6E6E6' }
        };
      });
    }

    // Style section headers
    const isSectionHeader = row.length === 1 &&
      typeof row[0] === 'string' &&
      ['Summary', 'Totals', 'Time Series Data', 'Overall Statistics'].includes(row[0]);

    if (isSectionHeader) {
      excelRow.eachCell((cell) => {
        cell.font = { bold: true };
      });
    }
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });

  return workbook.xlsx.writeBuffer();
};

// Report-specific Excel formatters
const excelFormatters = {
  // Employees Count Report
  employeesReport: (payload) => {
    return [
      ['Employees Report'],
      [],
      ['Total Count', payload.totalCount],
      ['Active Count', payload.activeCount],
      ['Inactive Count', payload.inactiveCount]
    ];
  },

  // Coupon Count Report
  couponCount: (payload) => {
    return [
      ['Coupons Report'],
      [],
      ['Total Count', payload.totalCount],
      ['Active Count', payload.activeCount],
      ['Expired Count', payload.expiredCount],
      ['Disabled Count', payload.disabledCount],
      ['Total Redeemed', payload.totalRedeemed]
    ];
  },

  // Refund Count Report
  refundCount: (payload) => {
    const rows = [
      ['Refunds Report'],
      []
    ];

    // Grand Total
    if (payload.grandTotal && payload.grandTotal.length > 0) {
      const grand = payload.grandTotal[0];
      rows.push(['Grand Total']);
      rows.push(['Total Count', grand.totalCount]);
      rows.push(['Initiated Count', grand.InitiatedCount]);
      rows.push(['Inprogress Count', grand.InprogressCount]);
      rows.push(['Completed Count', grand.CompletedCount]);
      rows.push(['Rejected Count', grand.RejectedCount]);
      rows.push([]);
    }

    // By Service Type
    if (payload.byServiceType && payload.byServiceType.length > 0) {
      rows.push(['By Service Type']);
      rows.push(['Service Type', 'Total Count', 'Initiated Count', 'Inprogress Count', 'Completed Count', 'Rejected Count']);
      payload.byServiceType.forEach(item => {
        rows.push([
          item.serviceType,
          item.totalCount,
          item.InitiatedCount,
          item.InprogressCount,
          item.CompletedCount,
          item.RejectedCount
        ]);
      });
    }

    return rows;
  },

  // Booking Reports
  bookingReports: (payload) => {
    return [
      ['Booking Reports'],
      [],
      ['Total Bookings', payload.totalBookings],
      ['Revenue Of Room Tariff', payload.revenueOfRoomTariff],
      ['Received Amount', payload.receivedAmount],
      ['Cash Amount', payload.cashAmount],
      ['Cashfree Amount', payload.cashfreeAmount],
      ['Online Amount Received', payload.onlineAmountReceived],
      ['Room Tariff Due', payload.roomTariffDue],
      ['Confirmed Bookings', payload.confirmedBookings],
      ['Checked In Rooms', payload.checkedInRooms],
      ['Checked Out Rooms', payload.checkedOutRooms],
      ['Cancelled Bookings', payload.cancelledBookings],
      ['No Show Bookings', payload.noShowBookings],
      ['Occupancy Rate', payload.occupancyRate],
      ['Total Number Of Rooms', payload.totalNumberOfRooms]
    ];
  },

  // Service Reports
  serviceReports: (payload) => {
    const rows = [
      ['Service Reports'],
      []
    ];

    // If service is "All", then we have stats and complaintTypeWise
    if (payload.stats) {
      rows.push(['Overall Statistics']);
      rows.push(['Total Services', payload.stats.totalServices]);
      rows.push(['Revenue Generated', payload.stats.revenueGenerated]);
      rows.push(['Paylater Amount', payload.stats.paylaterAmount]);
      rows.push(['Cashfree Revenue', payload.stats.cashfreeRevenue]);
      rows.push(['Pending Services', payload.stats.pendingServices]);
      rows.push(['Inprogress Services', payload.stats.inprogressServices]);
      rows.push(['Completed Services', payload.stats.completedServices]);
      rows.push(['Cancelled Services', payload.stats.cancelledServices]);
      rows.push(['Average Service Rating', payload.stats.avgServiceRating]);
      rows.push(['Average Agent Rating', payload.stats.avgAgentRating]);
      rows.push([]);
    }

    if (payload.complaintTypeWise && payload.complaintTypeWise.length > 0) {
      rows.push(['Service Type Wise']);
      rows.push(['Service Type', 'Total Services', 'Revenue Generated', 'Pending Services', 'Inprogress Services', 'Completed Services', 'Cancelled Services', 'Avg Service Rating', 'Avg Agent Rating']);
      payload.complaintTypeWise.forEach(item => {
        rows.push([
          item.serviceType,
          item.totalServices,
          item.revenueGenerated,
          item.pendingServices,
          item.inprogressServices,
          item.completedServices,
          item.cancelledServices,
          item.avgServiceRating,
          item.avgAgentRating
        ]);
      });
    }

    // If service is not "All", then payload is the stats object directly
    if (!payload.stats && !payload.complaintTypeWise) {
      rows.push(['Total Services', payload.totalServices]);
      rows.push(['Revenue Generated', payload.revenueGenerated]);
      rows.push(['Paylater Amount', payload.paylaterAmount]);
      rows.push(['Cashfree Revenue', payload.cashfreeRevenue]);
      rows.push(['Pending Services', payload.pendingServices]);
      rows.push(['Inprogress Services', payload.inprogressServices]);
      rows.push(['Completed Services', payload.completedServices]);
      rows.push(['Cancelled Services', payload.cancelledServices]);
      rows.push(['Average Service Rating', payload.avgServiceRating]);
      rows.push(['Average Agent Rating', payload.avgAgentRating]);
    }

    return rows;
  },

  // Complaints Reports
  complaintsReports: (payload) => {
    const rows = [
      ['Complaints Reports'],
      []
    ];

    if (payload.stats) {
      rows.push(['Overall Statistics']);
      rows.push(['Total Complaints', payload.stats.totalComplaints]);
      rows.push(['Complaints Resolved', payload.stats.complaintsResolved]);
      rows.push(['Pending Complaints', payload.stats.pendingComplaints]);
      rows.push(['Average Complaint Rating', payload.stats.avgComplaintRating]);
      rows.push(['Average Agent Rating', payload.stats.avgAgentRating]);
      rows.push(['Positive Agent Ratings', payload.stats.positiveAgentRatings]);
      rows.push(['Neutral Agent Ratings', payload.stats.neutralAgentRatings]);
      rows.push(['Poor Agent Ratings', payload.stats.poorAgentRatings]);
      rows.push(['Average Resolution Time (Hours)', payload.stats.avgResolutionTimeHours]);
      rows.push([]);
    }

    if (payload.complaintTypeWise && payload.complaintTypeWise.length > 0) {
      rows.push(['Complaint Type Wise']);
      rows.push(['Complaint Type', 'Total Count', 'Resolved Count', 'Pending Count', 'Avg Complaint Rating', 'Avg Agent Rating']);
      payload.complaintTypeWise.forEach(item => {
        rows.push([
          item.serviceType,
          item.totalCount,
          item.resolvedCount,
          item.pendingCount,
          item.avgComplaintRating,
          item.avgAgentRating
        ]);
      });
    }

    return rows;
  },

  // Income Time Series
  incomeTimeSeries: (payload) => {
    const rows = [
      ['Payment Report'],
      []
    ];

    rows.push(['Period', 'Income']);
    payload.labels.forEach((label, index) => {
      rows.push([label, payload.data[index]]);
    });

    return rows;
  },

  // Hotel Counts
  hotelCounts: (payload) => {
    return [
      ['Hotel Report'],
      [],
      ['Total Hotels', payload.total],
      ['Active Hotels', payload.active],
      ['Inactive Hotels', payload.inactive],
      ['Pending Approval', payload.pendingApproval]
    ];
  },

  // All Bookings Reports
  allBookingsReports: (payload) => {
    return [
      ['Bookings Reports'],
      [],
      ['Total Bookings', payload.totalBookings],
      ['Direct Check-ins', payload.directCheckIns],
      ['Contactless Check-ins', payload.contactlessCheckIns],
      ['New Guests', payload.newGuests],
      ['Returning Guests', payload.returningGuests],
      ['Signup Users', payload.signupUsers]
    ];
  },

  // Subscription Reports
  subscriptionReports: (payload) => {
    const rows = [
      ['Subscription Reports'],
      []
    ];

    // Basic Stats
    rows.push(['Subscription Statistics']);
    rows.push(['Total Subscriptions Created', payload.totalSubscriptionsCreated]);
    rows.push(['Total Active', payload.totalActive]);
    rows.push(['Total Inactive', payload.totalInactive]);
    rows.push(['Total Plan Types', payload.totalPlanType]);
    rows.push([]);

    // Revenue
    rows.push(['Revenue Statistics']);
    rows.push(['Total Revenue', payload.revenue.totalRevenue]);
    rows.push(['Paid Subscriptions Count', payload.revenue.paidSubscriptionsCount]);
    rows.push(['Average Revenue Per Subscribed Hotel', payload.revenue.averageRevenuePerSubscribedHotel]);
    rows.push([]);

    // Popular Subscriptions
    if (payload.popularSubscriptions && payload.popularSubscriptions.length > 0) {
      rows.push(['Popular Subscriptions (Top 5)']);
      rows.push(['Plan Name', 'Unique ID', 'Cost', 'Sold Count']);
      payload.popularSubscriptions.forEach(sub => {
        rows.push([
          sub.planName || 'N/A',
          sub.uniqueId || 'N/A',
          sub.cost || 0,
          sub.soldCount || 0
        ]);
      });
    }

    return rows;
  },

  // Payment Management Report
  paymentReports: (payload) => {
    const rows = [];

    // Title
    rows.push(['Subscription Payment Report']);
    rows.push([]);

    // Summary
    rows.push(['Summary']);
    rows.push(['Period', payload.summary.period]);
    rows.push(['Start Date', new Date(payload.summary.startDate).toLocaleDateString()]);
    rows.push(['End Date', new Date(payload.summary.endDate).toLocaleDateString()]);
    rows.push([]);

    // Time Series Data
    rows.push(['Time Series Data']);
    rows.push(['Period', 'Revenue', 'Discount', 'Actual Cost']);

    payload.labels.forEach((label, index) => {
      rows.push([
        label,
        payload.datasets.revenue[index],
        payload.datasets.discount[index],
        payload.datasets.actualCost[index]
      ]);
    });
    rows.push([]);

    // Totals
    rows.push(['Totals']);
    rows.push(['Total Revenue', payload.totals.totalRevenue]);
    rows.push(['Total Discount', payload.totals.totalDiscount]);
    rows.push(['Actual Cost', payload.totals.actualCost]);
    rows.push(['Total Transactions', payload.totals.totalTransactions]);
    rows.push(['Average Transaction Value', payload.totals.averageTransactionValue]);

    return rows;
  }
};

// Enhanced jsonToExcelBuffer that uses formatters
async function jsonToExcelBuffer(data, sheetName = "Sheet1") {
  // Use custom formatter if available
  if (excelFormatters[sheetName]) {
    const rows = excelFormatters[sheetName](data);
    return await generateExcelBufferFromRows(rows, sheetName);
  }

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(sheetName);

  if (Array.isArray(data)) {
    if (data.length === 0) {
      ws.addRow([]);
    } else {
      const keys = Array.from(
        data.reduce((acc, row) => {
          if (row && typeof row === "object") Object.keys(row).forEach((k) => acc.add(k));
          return acc;
        }, new Set())
      );

      // Add header row with styling
      const headerRow = ws.addRow(keys);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6E6E6' }
        };
      });

      // Add data rows
      data.forEach((row) => {
        const flat = {};
        keys.forEach((k) => {
          const v = row?.[k];
          flat[k] = v && typeof v === "object" ? JSON.stringify(v) : v;
        });
        ws.addRow(flat);
      });
    }
  } else if (data && typeof data === "object") {
    // Add styled headers for key-value format
    const headerRow = ws.addRow(['Key', 'Value']);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6E6' }
      };
    });

    Object.entries(data).forEach(([k, v]) => {
      ws.addRow({ key: k, value: v && typeof v === "object" ? JSON.stringify(v) : v });
    });
  } else {
    const titleRow = ws.addRow([String(data)]);
    titleRow.eachCell((cell) => {
      cell.font = { bold: true, size: 14 };
    });
  }

  // Auto-fit columns for fallback
  ws.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });

  return workbook.xlsx.writeBuffer();
}
// 📌 Employees Count
exports.employeesCount = async (req, res) => {
  try {
    const { scope, HotelId } = req.user;
    const { range } = req.body;

    let match = {
      scope,
      createdAt: {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      },
    };

    if (scope === "Platform") {
      match.isSuperAmin = { $ne: true };
    } else if (scope === "Hotel") {
      match.isHotelAdmin = { $ne: true };
      match.HotelId = new ObjectId(HotelId);
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          inactiveCount: {
            $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
          },
        },
      },
      { $project: { _id: 0, totalCount: 1, activeCount: 1, inactiveCount: 1 } },
    ];

    const aggResult = await Admin.aggregate(pipeline);
    const payload = aggResult[0] || { totalCount: 0, activeCount: 0, inactiveCount: 0 };

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "employees-report");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "employees-report.xlsx" });
    } catch (xlsxErr) {
      console.error("employees-report excel generation error:", xlsxErr);
      // fallback to normal response if excel generation fails
      return res.json(payload);
    }
  } catch (error) {
    console.error("employees-report error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 📌 Coupon Count
exports.couponCount = async (req, res) => {
  try {
    const { scope, HotelId } = req.user;
    const { range } = req.body;

    let match = {
      scope,
      createdAt: {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      },
    };
    if (scope === "Hotel") match.HotelId = new ObjectId(HotelId);

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          redeemedCount: {
            $sum: {
              $map: {
                input: { $ifNull: ["$usedBy", []] },
                as: "u",
                in: { $ifNull: ["$$u.count", 0] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          expiredCount: {
            $sum: { $cond: [{ $eq: ["$status", "Expired"] }, 1, 0] },
          },
          disabledCount: {
            $sum: { $cond: [{ $eq: ["$status", "Disabled"] }, 1, 0] },
          },
          totalRedeemed: { $sum: "$redeemedCount" }, // now sums actual usage counts
        },
      },
      {
        $project: {
          _id: 0,
          totalCount: 1,
          activeCount: 1,
          expiredCount: 1,
          disabledCount: 1,
          totalRedeemed: 1,
        },
      },
    ];

    const result = await Coupons.aggregate(pipeline);
    const payload = result[0] || {
      totalCount: 0,
      activeCount: 0,
      expiredCount: 0,
      disabledCount: 0,
      totalRedeemed: 0
    };

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "couponCount");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "couponReport.xlsx" });
    } catch (xlsxErr) {
      console.error("couponCount excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (error) {
    console.error("couponCount error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 📌 Refund Count
exports.refundCount = async (req, res) => {
  try {
    const { scope, HotelId } = req.user;
    const { range } = req.body;

    let match = {
      scope,
      createdAt: {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      },
    };
    if (scope === "Hotel") match.hotel = new ObjectId(HotelId);

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "transactions",
          localField: "orderId",
          foreignField: "transactionId",
          as: "transaction",
        },
      },
      { $unwind: { path: "$transaction", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "servicerequests",
          localField: "transaction.serviceRequestId",
          foreignField: "_id",
          as: "serviceRequest",
        },
      },
      {
        $unwind: { path: "$serviceRequest", preserveNullAndEmptyArrays: true },
      },
      {
        $facet: {
          grandTotal: [
            {
              $group: {
                _id: null,
                totalCount: { $sum: 1 },
                InitiatedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "Initiated"] }, 1, 0] },
                },
                InprogressCount: {
                  $sum: { $cond: [{ $eq: ["$status", "In-progress"] }, 1, 0] },
                },
                CompletedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
                },
                RejectedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                },
              },
            },
            { $project: { _id: 0 } },
          ],
          byServiceType: [
            {
              $group: {
                _id: "$serviceRequest.__t",
                totalCount: { $sum: 1 },
                InitiatedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "Initiated"] }, 1, 0] },
                },
                InprogressCount: {
                  $sum: { $cond: [{ $eq: ["$status", "In-progress"] }, 1, 0] },
                },
                CompletedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
                },
                RejectedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                serviceType: "$_id",
                _id: 0,
                totalCount: 1,
                InitiatedCount: 1,
                InprogressCount: 1,
                CompletedCount: 1,
                RejectedCount: 1,
              },
            },
          ],
        },
      },
    ];

    const result = await Refund.aggregate(pipeline);
    const payload = result[0] || { grandTotal: [], byServiceType: [] };

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "refundCount");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "refundReport.xlsx" });
    } catch (xlsxErr) {
      console.error("refundCount excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (error) {
    console.error("refundCount error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 📌 Booking Reports
exports.bookingReports = async (req, res) => {
  try {
    const { scope, HotelId } = req.user;
    const { range } = req.body;

    let match = {
      createdAt: {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      },
    };
    if (scope === "Hotel") match.HotelId = new ObjectId(HotelId);

    const hotel =
      scope === "Hotel"
        ? await mongoose.model("Hotel").findById(HotelId)
        : null;
    const totalNumberOfRooms = hotel?.numberOfRooms || 0;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          revenueOfRoomTariff: { $sum: "$roomTariff" },
          receivedAmount: { $sum: "$receivedAmt" },
          cashAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentMode", "cash"] }, "$receivedAmt", 0],
            },
          },
          cashfreeAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentMode", "cashfree"] }, "$receivedAmt", 0],
            },
          },
          onlineAmountReceived: {
            $sum: {
              $cond: [{ $eq: ["$paymentMode", "online"] }, "$receivedAmt", 0],
            },
          },
          roomTariffDue: { $sum: "$roomTariffDue" },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0] },
          },
          checkedInRooms: {
            $sum: { $cond: [{ $eq: ["$status", "Checked-In"] }, 1, 0] },
          },
          checkedOutRooms: {
            $sum: { $cond: [{ $eq: ["$status", "Checked-Out"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
          },
          noShowBookings: {
            $sum: { $cond: [{ $eq: ["$status", "No-Show"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalBookings: 1,
          revenueOfRoomTariff: 1,
          receivedAmount: 1,
          cashAmount: 1,
          cashfreeAmount: 1,
          onlineAmountReceived: 1,
          roomTariffDue: 1,
          confirmedBookings: 1,
          checkedInRooms: 1,
          checkedOutRooms: 1,
          cancelledBookings: 1,
          noShowBookings: 1,
        },
      },
    ];

    let result = await Bookings.aggregate(pipeline);
    result = result[0] || {};
    result.occupancyRate = totalNumberOfRooms
      ? ((result.checkedInRooms / totalNumberOfRooms) * 100).toFixed(2) + "%"
      : "0%";
    result.totalNumberOfRooms = totalNumberOfRooms;

    const payload = result;

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "bookingReports");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "bookingReports.xlsx" });
    } catch (xlsxErr) {
      console.error("bookingReports excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (error) {
    console.error("bookingReports error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 📌 Service Reports
exports.serviceReports = async (req, res) => {
  try {
    const { scope, HotelId } = req.user;
    const { range, service } = req.body;

    let match = {
      createdAt: {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      },
    };
    if (scope === "Hotel") match.HotelId = new ObjectId(HotelId);
    if (service && service !== "All") match.__t = service;

    // If "All" is explicitly selected, return both overall stats and service-wise breakdown
    if (service === "All") {
      const pipeline = [
        { $match: match },
        {
          $facet: {
            stats: [
              {
                $group: {
                  _id: null,
                  totalServices: { $sum: 1 },
                  revenueGenerated: { $sum: "$amount.finalAmount" },
                  paylaterAmount: {
                    $sum: {
                      $cond: [
                        {
                          $or: [
                            { $eq: ["$paymentStatus", "pay-later"] },
                            { $eq: ["$paymentMode", "pay-later"] },
                          ],
                        },
                        "$amount.finalAmount",
                        0,
                      ],
                    },
                  },
                  cashfreeRevenue: {
                    $sum: {
                      $cond: [
                        { $eq: ["$paymentMode", "cashfree"] },
                        "$amount.finalAmount",
                        0,
                      ],
                    },
                  },
                  pendingServices: {
                    $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                  },
                  inprogressServices: {
                    $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
                  },
                  completedServices: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                  },
                  cancelledServices: {
                    $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
                  },
                  avgServiceRating: {
                    $avg: {
                      $cond: [
                        { $ifNull: ["$feedback.serviceRating", false] },
                        "$feedback.serviceRating",
                        null,
                      ],
                    },
                  },
                  avgAgentRating: {
                    $avg: {
                      $cond: [
                        { $ifNull: ["$feedback.agentRating", false] },
                        "$feedback.agentRating",
                        null,
                      ],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalServices: 1,
                  revenueGenerated: 1,
                  paylaterAmount: 1,
                  cashfreeRevenue: 1,
                  pendingServices: 1,
                  inprogressServices: 1,
                  completedServices: 1,
                  cancelledServices: 1,
                  avgServiceRating: { $round: ["$avgServiceRating", 2] },
                  avgAgentRating: { $round: ["$avgAgentRating", 2] },
                },
              },
            ],
            serviceTypeWise: [
              {
                $group: {
                  _id: "$__t",
                  totalServices: { $sum: 1 },
                  revenueGenerated: { $sum: "$amount.finalAmount" },
                  pendingServices: {
                    $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                  },
                  inprogressServices: {
                    $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
                  },
                  completedServices: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                  },
                  cancelledServices: {
                    $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
                  },
                  avgServiceRating: {
                    $avg: {
                      $cond: [
                        { $ifNull: ["$feedback.serviceRating", false] },
                        "$feedback.serviceRating",
                        null,
                      ],
                    },
                  },
                  avgAgentRating: {
                    $avg: {
                      $cond: [
                        { $ifNull: ["$feedback.agentRating", false] },
                        "$feedback.agentRating",
                        null,
                      ],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  serviceType: { $ifNull: ["$_id", "Unknown"] },
                  totalServices: 1,
                  revenueGenerated: 1,
                  pendingServices: 1,
                  inprogressServices: 1,
                  completedServices: 1,
                  cancelledServices: 1,
                  avgServiceRating: { $round: ["$avgServiceRating", 2] },
                  avgAgentRating: { $round: ["$avgAgentRating", 2] },
                },
              },
              { $sort: { serviceType: 1 } },
            ],
          },
        },
      ];

      const agg = await ServiceRequest.aggregate(pipeline);
      const stats = (agg[0] && agg[0].stats && agg[0].stats[0]) || {
        totalServices: 0,
        revenueGenerated: 0,
        paylaterAmount: 0,
        cashfreeRevenue: 0,
        pendingServices: 0,
        inprogressServices: 0,
        completedServices: 0,
        cancelledServices: 0,
        avgServiceRating: null,
        avgAgentRating: null,
      };
      const serviceTypeWise = (agg[0] && agg[0].serviceTypeWise) || [];

      const payload = { stats, serviceTypeWise };

      // create excel and attach as base64 in response
      try {
        const buffer = await jsonToExcelBuffer(payload, "serviceReports");
        const excelBase64 = buffer.toString("base64");
        return res.json({ ...payload, excelBase64, excelFileName: "serviceReports.xlsx" });
      } catch (xlsxErr) {
        console.error("serviceReports excel generation error:", xlsxErr);
        return res.json(payload);
      }
    }

    // fallback: when specific service selected or service not provided (existing behavior)
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          revenueGenerated: { $sum: "$amount.finalAmount" },
          paylaterAmount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$paymentStatus", "pay-later"] },
                    { $eq: ["$paymentMode", "pay-later"] },
                  ],
                },
                "$amount.finalAmount",
                0,
              ],
            },
          },
          cashfreeRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentMode", "cashfree"] },
                "$amount.finalAmount",
                0,
              ],
            },
          },
          pendingServices: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          inprogressServices: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          completedServices: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledServices: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          avgServiceRating: {
            $avg: {
              $cond: [
                { $ifNull: ["$feedback.serviceRating", false] },
                "$feedback.serviceRating",
                null,
              ],
            },
          },
          avgAgentRating: {
            $avg: {
              $cond: [
                { $ifNull: ["$feedback.agentRating", false] },
                "$feedback.agentRating",
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalServices: 1,
          revenueGenerated: 1,
          paylaterAmount: 1,
          cashfreeRevenue: 1,
          pendingServices: 1,
          inprogressServices: 1,
          completedServices: 1,
          cancelledServices: 1,
          avgServiceRating: { $round: ["$avgServiceRating", 2] },
          avgAgentRating: { $round: ["$avgAgentRating", 2] },
        },
      },
    ];

    const result = await ServiceRequest.aggregate(pipeline);
    const payload = result[0] || {};

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "serviceReports");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "serviceReports.xlsx" });
    } catch (xlsxErr) {
      console.error("serviceReports excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (error) {
    console.error("serviceReports error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.complaintsReports = async (req, res) => {
  try {
    const { scope, HotelId } = req.user;
    const { range } = req.body;

    let match = {
      createdAt: {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      },
    };
    if (scope === "Hotel") match.HotelId = new ObjectId(HotelId);
    else match.scope = scope; // keep scope filter for platform/hotel if needed

    const pipeline = [
      { $match: match },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                totalComplaints: { $sum: 1 },
                complaintsResolved: {
                  $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
                },
                pendingComplaints: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["Open", "Inprogress"]] },
                      1,
                      0,
                    ],
                  },
                },
                totalResolutionTimeMs: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "Resolved"] },
                      { $subtract: ["$resolvedAt", "$createdAt"] },
                      0,
                    ],
                  },
                },
                resolvedCountForAvg: {
                  $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
                },
                avgComplaintRating: {
                  $avg: {
                    $cond: [
                      { $ifNull: ["$feedback.complaintRating", false] },
                      "$feedback.complaintRating",
                      null,
                    ],
                  },
                },
                avgAgentRating: {
                  $avg: {
                    $cond: [
                      { $ifNull: ["$feedback.agentRating", false] },
                      "$feedback.agentRating",
                      null,
                    ],
                  },
                },
                positiveAgentRatings: {
                  $sum: {
                    $cond: [
                      { $in: ["$feedback.agentRating", [4, 5]] },
                      1,
                      0,
                    ],
                  },
                },
                neutralAgentRatings: {
                  $sum: {
                    $cond: [{ $eq: ["$feedback.agentRating", 3] }, 1, 0],
                  },
                },
                poorAgentRatings: {
                  $sum: {
                    $cond: [
                      { $in: ["$feedback.agentRating", [1, 2]] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalComplaints: 1,
                complaintsResolved: 1,
                pendingComplaints: 1,
                avgComplaintRating: { $round: ["$avgComplaintRating", 2] },
                avgAgentRating: { $round: ["$avgAgentRating", 2] },
                positiveAgentRatings: 1,
                neutralAgentRatings: 1,
                poorAgentRatings: 1,
                avgResolutionTimeHours: {
                  $cond: [
                    { $gt: ["$resolvedCountForAvg", 0] },
                    {
                      $round: [
                        {
                          $divide: [
                            "$totalResolutionTimeMs",
                            { $multiply: ["$resolvedCountForAvg", 3600000] },
                          ],
                        },
                        2,
                      ],
                    },
                    null,
                  ],
                },
              },
            },
          ],
          complaintTypeWise: [
            {
              $group: {
                _id: "$complaintType",
                totalCount: { $sum: 1 },
                resolvedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
                },
                pendingCount: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["Open", "Inprogress"]] },
                      1,
                      0,
                    ],
                  },
                },
                avgComplaintRating: {
                  $avg: {
                    $cond: [
                      { $ifNull: ["$feedback.complaintRating", false] },
                      "$feedback.complaintRating",
                      null,
                    ],
                  },
                },
                avgAgentRating: {
                  $avg: {
                    $cond: [
                      { $ifNull: ["$feedback.agentRating", false] },
                      "$feedback.agentRating",
                      null,
                    ],
                  },
                },

              },
            },
            {
              $project: {
                _id: 0,
                serviceType: { $ifNull: ["$_id", "Unknown"] },
                totalCount: 1,
                resolvedCount: 1,
                pendingCount: 1,
                avgComplaintRating: { $round: ["$avgComplaintRating", 2] },
                avgAgentRating: { $round: ["$avgAgentRating", 2] }
              },
            },
          ],
        },
      },
    ];

    const agg = await Complaint.aggregate(pipeline);
    const stats = (agg[0] && agg[0].stats && agg[0].stats[0]) || {
      totalComplaints: 0,
      complaintsResolved: 0,
      pendingComplaints: 0,
      avgComplaintRating: null,
      avgAgentRating: null,
      positiveAgentRatings: 0,
      neutralAgentRatings: 0,
      poorAgentRatings: 0,
      avgResolutionTimeHours: null,
    };
    const complaintTypeWise = (agg[0] && agg[0].complaintTypeWise) || [];

    const payload = { stats, complaintTypeWise };

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "complaintsReports");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "complaintsReports.xlsx" });
    } catch (xlsxErr) {
      console.error("complaintsReports excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (error) {
    console.error("complaintsReports error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.incomeTimeSeries = async (req, res) => {
  try {
    const { range } = req.body;
    const tz = "Asia/Kolkata";
    const today = startOfDay(new Date());

    let start, end, mongoFmt, labels;

    switch (range) {
      case "today":
        start = today;
        end = new Date();
        mongoFmt = "%H";
        labels = Array.from({ length: 24 }, (_, h) => `${h.toString().padStart(2, "0")}:00`);
        break;

      case "lastWeek":
        start = subDays(today, 6);
        end = new Date();
        mongoFmt = "%d-%b";
        labels = eachDayOfInterval({ start, end }).map((d) => format(d, "d-LLL"));
        break;

      case "lastMonth":
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        mongoFmt = null; // we'll compute week index
        {
          const daysInMonth = differenceInCalendarDays(end, start) + 1;
          const weekCount = Math.ceil(daysInMonth / 7);
          labels = Array.from({ length: weekCount }, (_, i) => `Week ${i + 1}`);
        }
        break;

      case "lastQuarter":
        start = startOfMonth(subMonths(today, 2));
        end = new Date();
        mongoFmt = "%b";
        labels = eachMonthOfInterval({ start, end }).map((d) => format(d, "LLL"));
        break;

      case "halfYear":
        start = startOfMonth(subMonths(today, 5)); // last 6 months incl. current
        end = endOfMonth(today);
        mongoFmt = "%b";
        labels = eachMonthOfInterval({ start, end }).map((d) => format(d, "LLL"));
        break;

      case "lastYear":
        start = startOfYear(subMonths(today, 11));
        end = endOfYear(today);
        mongoFmt = "%b";
        labels = eachMonthOfInterval({ start, end }).map((d) => format(d, "LLL"));
        break;

      default:
        return res.status(400).json({ error: "invalid range param" });
    }

    // Helper to run aggregation on a model given revenueField and optional filter
    const runAgg = async (Model, revenueFieldPath, extraMatch = {}) => {
      const baseMatch = { createdAt: { $gte: start, $lte: end }, ...extraMatch };
      if (Model.schema.path("HotelId")) baseMatch.HotelId = req.user.HotelId;

      if (range === "lastMonth") {
        const pipeline = [
          { $match: baseMatch },
          {
            $addFields: {
              weekOfMonth: {
                $floor: {
                  $divide: [
                    {
                      $dateDiff: {
                        startDate: start,
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
          {
            $group: {
              _id: "$weekOfMonth",
              total: { $sum: revenueFieldPath },
            },
          },
          { $sort: { _id: 1 } },
        ];
        return Model.aggregate(pipeline);
      } else {
        const pipeline = [
          { $match: baseMatch },
          {
            $group: {
              _id: {
                $dateToString: { format: mongoFmt, date: "$createdAt", timezone: tz },
              },
              total: { $sum: revenueFieldPath },
            },
          },
          { $sort: { _id: 1 } },
        ];

        if (range === "today") {
          pipeline.push({
            $addFields: { _id: { $concat: ["$_id", ":00"] } },
          });
        }

        return Model.aggregate(pipeline);
      }
    };

    // Run both aggregations in parallel:
    // - ServiceRequest: amount.finalAmount where paymentStatus: 'paid'
    // - Bookings: receivedAmt
    const [svcAgg, bkAgg] = await Promise.all([
      runAgg(ServiceRequest, "$amount.finalAmount", { paymentStatus: "paid" }),
      runAgg(Bookings, "$receivedAmt"),
    ]);

    // Build lookup maps (label -> value)
    const svcLookup = Object.fromEntries(
      svcAgg.map((d) =>
        range === "lastMonth" ? [`Week ${d._id + 1}`, d.total] : [d._id, d.total]
      )
    );
    const bkLookup = Object.fromEntries(
      bkAgg.map((d) =>
        range === "lastMonth" ? [`Week ${d._id + 1}`, d.total] : [d._id, d.total]
      )
    );

    // Merge and ensure numeric with two decimals
    const data = labels.map((lbl) => {
      const svcVal = Number(svcLookup[lbl] ?? 0);
      const bkVal = Number(bkLookup[lbl] ?? 0);
      return +((svcVal + bkVal) || 0).toFixed(2);
    });

    const payload = { labels, data };

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "incomeTimeSeries");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "paymentReports.xlsx" });
    } catch (xlsxErr) {
      console.error("incomeTimeSeries excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (err) {
    console.error("incomeTimeSeries error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.hotelCounts = async (req, res) => {
  try {
    const { scope } = req.user || {};
    if (scope !== "Platform") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { range } = req.body || {};

    const hotelMatch = {};
    if (range && range.startDate && range.endDate) {
      hotelMatch.createdAt = {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      };
    }

    const agg = await mongoose.model("Hotel").aggregate([
      { $match: hotelMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          inactive: {
            $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
          },
        },
      },
      { $project: { _id: 0, total: 1, active: 1, inactive: 1 } },
    ]);

    const pendingMatch = { status: "Pending" };
    if (range && range.startDate && range.endDate) {
      pendingMatch.createdAt = {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      };
    }

    const pendingApproval = await mongoose
      .model("PendingHotel")
      .countDocuments(pendingMatch);

    const result = agg[0] || { total: 0, active: 0, inactive: 0 };
    result.pendingApproval = pendingApproval;

    const payload = result;

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "hotelCounts");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "hotelReports.xlsx" });
    } catch (xlsxErr) {
      console.error("hotelCounts excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (error) {
    console.error("hotelCounts error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.allBookingsReports = async (req, res) => {
  try {
    const { scope } = req.user || {};
    if (scope !== "Platform") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { range } = req.body || {};

    if (!range || !range.startDate || !range.endDate) {
      return res.status(400).json({ error: "range.startDate and range.endDate are required" });
    }

    const start = new Date(range.startDate);
    const end = new Date(range.endDate);

    const match = {
      createdAt: { $gte: start, $lte: end },
    };


    // Totals: total bookings, total guests (sum of adult+children+infant), direct vs contactless
    const totalsPipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          directCheckIns: {
            $sum: { $cond: [{ $or: [{ $eq: ["$preCheckIn", false] }, { $eq: ["$preCheckIn", null] }] }, 1, 0] },
          },
          contactlessCheckIns: {
            $sum: { $cond: [{ $eq: ["$preCheckIn", true] }, 1, 0] },
          },
        },
      },
      { $project: { _id: 0, totalBookings: 1, totalGuests: 1, directCheckIns: 1, contactlessCheckIns: 1 } },
    ];

    const totalsResult = (await Bookings.aggregate(totalsPipeline))[0] || {
      totalBookings: 0,
      directCheckIns: 0,
      contactlessCheckIns: 0,
    };

    // New vs Returning guests:
    // - collect distinct phone numbers from bookings in range
    // - a phone is "returning" if it has any booking before the range.startDate
    const phonesInRange = await Bookings.distinct("phoneNumber", match);
    let newGuests = 0;
    let returningGuests = 0;
    if (phonesInRange && phonesInRange.length > 0) {
      // filter out falsy values
      const phones = phonesInRange.filter(Boolean);

      // Use aggregation to compute first booking date per phone and count phones
      // whose firstBooking is before the report range start -> returning guests
      const agg = await Bookings.aggregate([
        { $match: { phoneNumber: { $in: phones } } },
        { $group: { _id: "$phoneNumber", firstBooking: { $min: "$createdAt" } } },
        { $match: { firstBooking: { $lt: start } } },
        { $count: "count" },
      ]);
      returningGuests = agg[0]?.count || 0;
      newGuests = phones.length - returningGuests;
    }

    // Signup users (guests who have a Guest document) - count distinct phoneNumbers from range that exist in Guest
    const signupUsersCount = phonesInRange.length
      ? await Guest.countDocuments({ phoneNumber: { $in: phonesInRange } })
      : 0;

    const payload = {
      totalBookings: totalsResult.totalBookings,
      directCheckIns: totalsResult.directCheckIns,
      contactlessCheckIns: totalsResult.contactlessCheckIns,
      newGuests,
      returningGuests,
      signupUsers: signupUsersCount,
    };

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "allBookingsReports");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "allBookingsReports.xlsx" });
    } catch (xlsxErr) {
      console.error("allBookingsReports excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (error) {
    console.error("allBookingsReports error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.subscriptionReports = async (req, res) => {
  try {
    const { scope, HotelId } = req.user || {};
    const { range } = req.body || {};

    // Hotel-level match: only hotels that have a subscriptionPlan
    const hotelMatch = { subscriptionPlan: { $ne: null } };
    if (scope === "Hotel") hotelMatch._id = new ObjectId(HotelId);
    if (range && range.startDate && range.endDate) {
      hotelMatch.createdAt = {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      };
    }

    // 1) Totals for hotels with subscriptionPlan
    const totalsAgg = await mongoose.model("Hotel").aggregate([
      { $match: hotelMatch },
      {
        $group: {
          _id: null,
          totalSubscriptionsCreated: { $sum: 1 },
          totalActive: {
            $sum: { $cond: [{ $eq: ["$subscriptionStatus", "Active"] }, 1, 0] },
          },
          totalInactive: {
            $sum: { $cond: [{ $eq: ["$subscriptionStatus", "Inactive"] }, 1, 0] },
          },
        },
      },
      { $project: { _id: 0 } },
    ]);

    const totals = totalsAgg[0] || {
      totalSubscriptionsCreated: 0,
      totalActive: 0,
      totalInactive: 0,
    };

    // 2) Top 5 selling subscriptions (popular subscription plans based on hotels' subscriptionPlan references)
    const popularAgg = await mongoose.model("Hotel").aggregate([
      { $match: hotelMatch },
      { $group: { _id: "$subscriptionPlan", soldCount: { $sum: 1 } } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          planId: "$_id",
          planName: "$plan.planName",
          uniqueId: "$plan.uniqueId",
          cost: "$plan.cost",
          soldCount: 1,
        },
      },
      { $sort: { soldCount: -1 } },
      { $limit: 5 },
    ]);

    // 3) Total plan types (count of Subscription documents). If date range provided, filter subscriptions created in range.
    const subscriptionQuery = {};
    if (range && range.startDate && range.endDate) {
      subscriptionQuery.createdAt = {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      };
    }
    const totalPlanType = await Subscription.countDocuments(subscriptionQuery);


    // 5) Average Revenue (date dependent)
    // Sum of amounts received from hotels for subscriptions (use subscriptionPaymentStatus 'paid' and subscriptionPaymentDate in range if provided)
    const revenueMatch = {
      subscriptionPlan: { $ne: null },
      subscriptionPaymentStatus: "paid",
    };
    if (scope === "Hotel") revenueMatch._id = new ObjectId(HotelId);
    if (range && range.startDate && range.endDate) {
      revenueMatch.subscriptionPaymentDate = {
        $gte: new Date(range.startDate),
        $lte: new Date(range.endDate),
      };
    }

    const revenueAgg = await mongoose.model("Hotel").aggregate([
      { $match: revenueMatch },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscriptionPlan",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$plan.cost", 0] } },
          paidSubscriptionsCount: { $sum: 1 },
        },
      },
      { $project: { _id: 0 } },
    ]);

    const revenueResult = revenueAgg[0] || { totalRevenue: 0, paidSubscriptionsCount: 0 };

    // Average revenue per subscribed hotel (using totalSubscriptionsCreated as denominator)
    const avgRevenue =
      totals.totalSubscriptionsCreated > 0
        ? Number((revenueResult.totalRevenue / totals.totalSubscriptionsCreated).toFixed(2))
        : 0;

    const payload = {
      totalSubscriptionsCreated: totals.totalSubscriptionsCreated,
      totalActive: totals.totalActive,
      totalInactive: totals.totalInactive,
      totalPlanType,
      popularSubscriptions: popularAgg,
      revenue: {
        totalRevenue: revenueResult.totalRevenue,
        paidSubscriptionsCount: revenueResult.paidSubscriptionsCount,
        averageRevenuePerSubscribedHotel: avgRevenue,
      },
    };

    // create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "subscriptionReports");
      const excelBase64 = buffer.toString("base64");
      return res.json({ ...payload, excelBase64, excelFileName: "subscriptionReports.xlsx" });
    } catch (xlsxErr) {
      console.error("subscriptionReports excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (err) {
    console.error("subscriptionReports error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.paymentManagement = async (req, res) => {
  try {
    const { range } = req.body || {};
    const tz = "Asia/Kolkata";
    const today = startOfDay(new Date());

    let start, end, mongoFmt, labels;

    switch (range) {
      case "today":
        start = today;
        end = new Date();
        mongoFmt = "%H";
        labels = Array.from({ length: 24 }, (_, h) => `${h.toString().padStart(2, "0")}:00`);
        break;
      case "lastWeek":
        start = subDays(today, 6);
        end = new Date();
        mongoFmt = "%d-%b";
        labels = eachDayOfInterval({ start, end }).map((d) => format(d, "d-LLL"));
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        mongoFmt = null;
        {
          const daysInMonth = differenceInCalendarDays(end, start) + 1;
          const weekCount = Math.ceil(daysInMonth / 7);
          labels = Array.from({ length: weekCount }, (_, i) => `Week ${i + 1}`);
        }
        break;
      case "lastQuarter":
        start = startOfMonth(subMonths(today, 2));
        end = new Date();
        mongoFmt = "%b";
        labels = eachMonthOfInterval({ start, end }).map((d) => format(d, "LLL"));
        break;
      case "halfYear":
        start = startOfMonth(subMonths(today, 5));
        end = endOfMonth(today);
        mongoFmt = "%b";
        labels = eachMonthOfInterval({ start, end }).map((d) => format(d, "LLL"));
        break;
      case "lastYear":
        start = startOfYear(subMonths(today, 11));
        end = endOfYear(today);
        mongoFmt = "%b";
        labels = eachMonthOfInterval({ start, end }).map((d) => format(d, "LLL"));
        break;
      default:
        return res.status(400).json({ error: "invalid range param" });
    }

    // Helper aggregator for subscription transactions only
    const runSubscriptionAgg = async (options = {}) => {
      const baseMatch = {
        createdAt: { $gte: start, $lte: end },
        transactionType: "SubscriptionPayment",
        status: "completed",
        ...options.extraMatch
      };

      // Apply hotel-level filter when applicable
      if (req.user?.HotelId) {
        baseMatch.hotel = new ObjectId(req.user.HotelId);
      }

      if (range === "lastMonth") {
        const pipeline = [
          { $match: baseMatch },
          {
            $addFields: {
              weekOfMonth: {
                $floor: {
                  $divide: [
                    {
                      $dateDiff: {
                        startDate: start,
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
          {
            $group: {
              _id: "$weekOfMonth",
              totalRevenue: { $sum: "$amount" },
              totalDiscount: { $sum: { $ifNull: ["$discountAmount", 0] } },
              count: { $sum: 1 }
            },
          },
          { $sort: { _id: 1 } },
        ];
        return Transaction.aggregate(pipeline);
      } else {
        const pipeline = [
          { $match: baseMatch },
          {
            $group: {
              _id: {
                $dateToString: { format: mongoFmt, date: "$createdAt", timezone: tz },
              },
              totalRevenue: { $sum: "$amount" },
              totalDiscount: { $sum: { $ifNull: ["$discountAmount", 0] } },
              count: { $sum: 1 }
            },
          },
          { $sort: { _id: 1 } },
        ];
        if (range === "today") {
          pipeline.push({
            $addFields: { _id: { $concat: ["$_id", ":00"] } },
          });
        }
        return Transaction.aggregate(pipeline);
      }
    };

    // Run aggregation for subscription payments
    const subscriptionAgg = await runSubscriptionAgg();

    // Build lookup for subscription data
    const subscriptionLookup = Object.fromEntries(
      subscriptionAgg.map((d) =>
        range === "lastMonth"
          ? [`Week ${d._id + 1}`, { revenue: d.totalRevenue, discount: d.totalDiscount }]
          : [d._id, { revenue: d.totalRevenue, discount: d.totalDiscount }]
      )
    );

    // Calculate totals
    const totalRevenue = subscriptionAgg.reduce((sum, d) => sum + Number(d.totalRevenue || 0), 0);
    const totalDiscount = subscriptionAgg.reduce((sum, d) => sum + Number(d.totalDiscount || 0), 0);
    const totalTransactions = subscriptionAgg.reduce((sum, d) => sum + Number(d.count || 0), 0);

    const actualCost = totalRevenue + totalDiscount;

    // Prepare data for graph
    const revenueData = labels.map((lbl) => {
      const data = subscriptionLookup[lbl];
      return +(data?.revenue || 0).toFixed(2);
    });

    const discountData = labels.map((lbl) => {
      const data = subscriptionLookup[lbl];
      return +(data?.discount || 0).toFixed(2);
    });

    const actualCostData = labels.map((lbl) => {
      const data = subscriptionLookup[lbl];
      const revenue = data?.revenue || 0;
      const discount = data?.discount || 0;
      return +((revenue + discount) || 0).toFixed(2);
    });

    const payload = {
      labels,
      datasets: {
        revenue: revenueData,
        discount: discountData,
        actualCost: actualCostData
      },
      totals: {
        totalRevenue: +totalRevenue.toFixed(2),
        totalDiscount: +totalDiscount.toFixed(2),
        actualCost: +actualCost.toFixed(2),
        totalTransactions,
        averageTransactionValue: totalTransactions > 0 ? +(totalRevenue / totalTransactions).toFixed(2) : 0
      },
      summary: {
        period: range,
        startDate: start,
        endDate: end
      }
    };

    // Create excel and attach as base64 in response
    try {
      const buffer = await jsonToExcelBuffer(payload, "paymentReports");
      const excelBase64 = buffer.toString("base64");
      return res.json({
        ...payload,
        excelBase64,
        excelFileName: `paymentReports-${range}-${new Date().toISOString().split('T')[0]}.xlsx`
      });
    } catch (xlsxErr) {
      console.error("paymentReports excel generation error:", xlsxErr);
      return res.json(payload);
    }
  } catch (err) {
    console.error("paymentReports error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Additional helper function to get detailed subscription payment analytics
exports.getSubscriptionPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, hotelId } = req.body;

    const matchStage = {
      transactionType: "SubscriptionPayment",
      status: "completed",
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (hotelId) {
      matchStage.hotel = new ObjectId(hotelId);
    }

    const analytics = await Transaction.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          as: "hotelInfo"
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscription",
          foreignField: "_id",
          as: "subscriptionInfo"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalDiscount: { $sum: { $ifNull: ["$discountAmount", 0] } },
          totalGst: {
            $sum: {
              $multiply: [
                "$amount",
                { $divide: [{ $ifNull: ["$gstPercentage", 0] }, 100] }
              ]
            }
          },
          transactionCount: { $sum: 1 },
          hotels: { $addToSet: "$hotel" },
          subscriptions: { $addToSet: "$subscription" }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          totalDiscount: 1,
          totalGst: 1,
          transactionCount: 1,
          uniqueHotels: { $size: "$hotels" },
          uniqueSubscriptions: { $size: "$subscriptions" },
          grossRevenue: { $add: ["$totalRevenue", "$totalDiscount"] },
          netRevenue: {
            $subtract: [
              "$totalRevenue",
              {
                $multiply: [
                  "$totalRevenue",
                  { $divide: [{ $ifNull: ["$totalGst", 0] }, 100] }
                ]
              }
            ]
          }
        }
      }
    ]);

    const result = analytics[0] || {
      totalRevenue: 0,
      totalDiscount: 0,
      totalGst: 0,
      transactionCount: 0,
      uniqueHotels: 0,
      uniqueSubscriptions: 0,
      grossRevenue: 0,
      netRevenue: 0
    };

    return res.json(result);
  } catch (err) {
    console.error("getSubscriptionPaymentAnalytics error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};