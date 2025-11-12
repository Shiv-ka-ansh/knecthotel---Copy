const Bookings = require("../../models/Bookings");
const { ToWords } = require('to-words');
const ServiceRequest = require("../../models/services/ServiceRequest");
const ApiError = require("../../utils/ApiError");
const { POPULATES } = require("../Services/serviceRequestController");
const Hotel = require("../../models/Hotel");

const toWords = new ToWords({ localeCode: 'en-IN' });

const safe = (v, d = '') => (v === undefined || v === null ? d : v);
const currency = (n) => (Number.isFinite(n) ? Number(n) : 0);
const toCurrencyString = (n) => currency(n).toFixed(2);

function hotelBaseFromBooking(booking = {}) {
    const hotel = booking.HotelId || {};
    return {
        HotelLogo: hotel.logo || '',
        HotelName: hotel.name || '',
        HotelAddress: hotel.address + ", " + hotel.city + ", " + hotel.state + ", " + hotel.country || '',
        HotelCity: hotel.city,
        HotelState: hotel.state,
        HotelCountry: hotel.country,
        HotelPincode: hotel.pincode,
        HotelPhone: hotel.phoneNo || '',
        HotelEmail: hotel.email || '',
        HotelGST: hotel.gstImage?.gstValue || "12AAAAA67Z90HHHU7M",
        HotelPAN: hotel.panNumber?.numberValue || '',
    };
}

function guestFromBooking(booking = {}) {
    const guest = booking.guest || {};
    return {
        guestName: `${safe(guest.firstName)} ${safe(guest.lastName)}`.trim(),
        guestEmail: guest.email || '',
        guestAddress: [booking.address, booking.city, booking.state].filter(Boolean).join(', ') + (booking.state ? '.' : ''),
        guestPhone: guest.phoneNumber || '',
        guestGST: booking.gstIn || '',
        arrivalDate: booking.checkInDate,
        departureDate: booking.checkOutDate,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestCount: (booking.adultGuestsCount || 0) + (booking.childrenGuestsCount || 0) + (booking.infantGuestsCount || 0),
    };
}

function roomAmounts(booking = {}) {
    const roomTariff = currency(booking.roomTariff);
    const gstPercent = currency(booking.gst);
    const rate = roomTariff - (roomTariff * gstPercent) / 100;
    const sgstPercent = gstPercent / 2;
    const cgstPercent = gstPercent / 2;
    const sgstAmount = (sgstPercent * roomTariff) / 100;
    const cgstAmount = (cgstPercent * roomTariff) / 100;
    const gstAmount = sgstAmount + cgstAmount;
    return {
        roomCharges: `Accommodation for ${safe(booking.roomCategory)}`,
        rate: currency(rate),
        total: currency(rate),
        amount: currency(booking.total),
        subTotal: currency(booking.amount),
        sgstPercentage: sgstPercent,
        sgstAmount: currency(sgstAmount),
        cgstPercentage: cgstPercent,
        cgstAmount: currency(cgstAmount),
        gstAmount: currency(gstAmount),
        grandTotal: currency(roomTariff),
        advanceAmount: currency(booking.receivedAmt),
        netPayableAmount: currency(booking.roomTariffDue),
    };
}

function buildServiceCharges(servType, service = {}) {
    const charges = [];
    if (servType === "InRoomDiningBooking") {
        return (service.orderedItems || []).map(item => ({
            description: item.product?.productName || '',
            rate: currency(item.product?.cost),
            quantity: item.quantity || 0,
            amount: currency((item.product?.cost || 0) * (item.quantity || 0)),
        }));
    }
    if (servType === "HousekeepingRequest") {
        return (service.items || []).map(item => ({
            description: `${item.item?.serviceType || ''} - ${item.item?.name || ''}`,
            rate: currency(item.item?.price),
            quantity: item.quantity || 0,
            amount: currency((item.item?.price || 0) * (item.quantity || 0)),
        }));
    }
    if (servType === "FacilityRequest") {
        charges.push({
            description: `${service.facility?.facilityType || ''}, ${service.slot?.startTime || ''} - ${service.slot?.endTime || ''}`,
            rate: currency(service.slot?.price),
            quantity: (service.additionalGuests || 0) + 1,
            amount: currency(service.amount?.subtotal),
        });
    }
    if (servType === "SpaSalonBooking") {
        charges.push({
            description: `${service.spaSalonProduct?.serviceType || ''} - ${service.spaSalonProduct?.productName || ''}`,
            rate: currency(service.spaSalonProduct?.price),
            quantity: (service.additionalGuests || 0) + 1,
            amount: currency(service.amount?.subtotal),
        });
    }
    if (servType === "SwimmingPoolBooking") {
        charges.push({
            description: `Swimming Pool Booking, ${service.slot?.startTime || ''} - ${service.slot?.endTime || ''}`,
            rate: currency(service.slot?.price),
            quantity: (service.additionalGuests || 0) + 1,
            amount: currency(service.amount?.subtotal),
        });
    }
    return charges;
}

exports.roomBookingInvoice = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const booking = await Bookings.findById(bookingId)
            .populate("guest", "firstName lastName email phoneNumber")
            .populate("HotelId", "logo name address phoneNo email gstImage panNumber city state pincode country");
        if (!booking) throw new ApiError(404, "Booking not found");
        if (booking.sources !== 'Walk-In') {
            throw new ApiError(403, "Invoice Only Available for Walk-In source.")
        }
        const data = {
            ...hotelBaseFromBooking(booking),
            acknowledgementNumber: booking.uniqueId,
            acknowledgementDate: booking.createdAt,
            invoiceNo: "INV" + safe(booking.uniqueId).slice(2),
            bookingThrough: booking.sources || "Direct",
            ...guestFromBooking(booking),
            ...roomAmounts(booking),
        };

        data.inWords = `Rupees ${toWords.convert(Math.round(data.grandTotal))} Only`;

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

exports.serviceInvoice = async (req, res, next) => {
    try {
        const { serviceId } = req.params;
        const serv = await ServiceRequest.findById(serviceId).select('__t').lean();
        if (!serv) throw new ApiError(404, "Service Request not found");

        const service = await ServiceRequest.findById(serviceId).populate(['guest', ...POPULATES[serv.__t]]);
        if (!service) throw new ApiError(404, "Service not found");

        const booking = await Bookings.findById(service.bookingId)
            .populate("guest", "firstName lastName email phoneNumber")
            .populate("HotelId", "logo name address phoneNo email gstImage panNumber  city state pincode country");

        if (!booking) throw new ApiError(404, "Booking not found");

        if (!booking.guest) booking.guest = service.guest;

        const charges = buildServiceCharges(serv.__t, service);

        const gstAmount = currency(service.amount?.gstAmount);
        const gstPercent = currency(service.gst);

        const data = {
            charges,
            ...hotelBaseFromBooking(booking),
            acknowledgementNumber: booking.uniqueId,
            acknowledgementDate: booking.createdAt,
            irn: safe(booking.uniqueId).slice(2),
            invoiceNo: service.uniqueId,
            bookingThrough: booking.sources || "Direct",
            ...guestFromBooking(booking),
            total: currency(service.amount?.subtotal),
            amount: currency(service.amount?.subtotal) - currency(service.amount?.discount),
            discountAmount: currency(service.amount?.discount),
            subTotal: currency(service.amount?.subtotal),
            gstAmount,
            sgstPercentage: gstPercent / 2,
            sgstAmount: gstAmount / 2,
            cgstPercentage: gstPercent / 2,
            cgstAmount: gstAmount / 2,
            grandTotal: currency(service.amount?.finalAmount) || 0,
        };

        data.inWords = `Rupees ${toWords.convert(Math.round(data.grandTotal))} Only`;

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

exports.subscriptionInvoice = async (req, res, next) => {
    try {
        // const { HotelId } = req.params;
        const admin = req.user;
        const HotelId = admin.HotelId;
        const hotel = await Hotel.findById(HotelId).populate('subscriptionPlan', 'planName planDuration cost').populate('transaction', 'amount transactionId gstPercentage coupon discountAmount').populate('coupon').lean();
        if (!hotel) throw new ApiError(404, "Hotel not found");
        
        
        const data = {
            acknowledgementNumber: hotel.HotelId,
            acknowledgementDate: hotel.createdAt,
            irn: hotel.transaction.transactionId || 'TXN0000000',
            invoiceNo: "INV" + safe(hotel.HotelId).slice(2),
            hotelName: hotel.name || '',
            hotelAddress: hotel.address + ", " + hotel.city + ", " + hotel.state + " - " + hotel.pincode || '',
            hotelPhone: hotel.phoneNo || '',
            hotelEmail: hotel.email || '',
            hotelGST: hotel.gstImage?.gstValue || "NA",
            hotelPAN: hotel.panNumber?.numberValue || 'NA',
            subscriptionPlan: safe(hotel.subscriptionPlan.planName) || 'Free',
            subsctiptionStart: hotel.subscriptionStartDate,
            subscriptionEnd: hotel.subscriptionEndDate,
            charges: [{
                description: `Subscription Plan - ${safe(hotel.subscriptionPlan.planName) || 'Free'}`,
                rate: currency(hotel.subscriptionPlan.cost),
                duration: hotel.subscriptionPlan.planDuration || 0,
                total: currency(hotel.subscriptionPlan.cost),
                amount: currency(hotel.subscriptionPlan.cost),
            }],
            couponCode: hotel.coupon?.code || '',
            couponDiscount: currency(hotel.transaction.discountAmount),
            subtotal: currency(hotel.subscriptionPlan.cost)- currency(hotel.transaction.discountAmount),
            gstAmount: (currency(hotel.subscriptionPlan.cost) - currency(hotel.transaction.discountAmount)) * (hotel.gstPercentage || 0) / 100,
            gstPercentage: currency(hotel.transaction.gstPercentage),
            sgstPercentage: (hotel.gstPercentage || 0) / 2,
            sgstAmount: ((currency(hotel.subscriptionPlan.cost) - currency(hotel.transaction.discountAmount)) * (hotel.gstPercentage || 0) / 100) / 2,
            cgstPercentage: (hotel.gstPercentage || 0) / 2,
            cgstAmount: ((currency(hotel.subscriptionPlan.cost) - currency(hotel.transaction.discountAmount)) * (hotel.gstPercentage || 0) / 100) / 2,
            grandTotal: currency(hotel.transaction.amount),
            inWords: `Rupees ${toWords.convert(Math.round(currency(hotel.transaction.amount)))} Only`,
            
        };

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error(error);
        return next(error);
    }
};