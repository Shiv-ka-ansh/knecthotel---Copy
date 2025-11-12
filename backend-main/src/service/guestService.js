// controllers/helpers/guestPayload.js
const sanitizeIdProof = (idProof) => {
  if (!idProof || (!idProof.url && !idProof.type)) return undefined;
  const clean = {};
  if (idProof.url) clean.url = idProof.url;
  // only keep type if present (prevents enum "" error)
  if (idProof.type) clean.type = idProof.type;
  if (idProof.verification) {
    clean.verification = {
      status: idProof.verification.status || "PENDING",
      message: idProof.verification.message,
      timestamp: idProof.verification.timestamp,
      requestId: idProof.verification.requestId,
    };
  }
  return clean;
};

const sanitizeGuest = (g) => ({
  guestType: g.guestType, // "adult" | "children" | "infant"
  firstName: g.firstName,
  lastName: g.lastName,
  phoneNumber: g.phoneNumber,
  countryCode: g.countryCode,
  gender: g.gender,
  idProof: sanitizeIdProof(g.idProof),
});

const countByType = (guestsArr) => ({
  adults: guestsArr.filter((x) => x.guestType === "adult").length,
  children: guestsArr.filter((x) => x.guestType === "children").length,
  infants: guestsArr.filter((x) => x.guestType === "infant").length,
});

const validateCountsNotExceeding = (booking, counts) => {
  const errs = [];
  if (counts.adults > Number(booking.adultGuestsCount)) {
    errs.push(
      `adultGuestsCount (${booking.adultGuestsCount}) < uploaded adults (${counts.adults})`
    );
  }
  if (counts.children > Number(booking.childrenGuestsCount)) {
    errs.push(
      `childrenGuestsCount (${booking.childrenGuestsCount}) < uploaded children (${counts.children})`
    );
  }
  if (counts.infants > Number(booking.infantGuestsCount)) {
    errs.push(
      `infantGuestsCount (${booking.infantGuestsCount}) < uploaded infants (${counts.infants})`
    );
  }
  return errs;
};

module.exports = {
  sanitizeGuest,
  sanitizeIdProof,
  countByType,
  validateCountsNotExceeding,
};
