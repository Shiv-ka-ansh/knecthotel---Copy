exports.groupItemsByServiceType = (items) => {
  return items.reduce((acc, item) => {
    if (!acc[item.serviceType]) {
      acc[item.serviceType] = [];
    }
    acc[item.serviceType].push(item);
    return acc;
  }, {});
};
exports.groupItemsByServiceType = (items) => {
  return items.reduce((acc, item) => {
    const { serviceType } = item;
    if (!acc[serviceType]) {
      acc[serviceType] = [];
    }
    acc[serviceType].push(item);
    return acc;
  }, {});
};

exports.setServiceType = (discriminatorName) => {
  return (req, _res, next) => {
    req.serviceType = discriminatorName;   // could also be req.query.__t
    next();
  };
};
