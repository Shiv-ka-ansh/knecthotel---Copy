// Bearer token verify for partner (Stayflexi)
module.exports = function verifyPartnerToken(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [type, token] = auth.split(" ");
    const expected = process.env.STAYFLEXI_PARTNER_TOKEN;

    if (!expected) {
      return res.status(500).json({ message: "Partner token not configured" });
    }
    if (type !== "Bearer" || token !== expected) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
