const crypto = require("crypto");
const mongoose = require("mongoose");
async function generateUniqueId(modelName, idField, prefix = "", length = 6) {
  let isUnique = false;
  let uniqueId;

  const min = 10 ** (length - 1);
  const max = 10 ** length;
  const Model = mongoose.models[modelName];
  if (!Model) throw new Error(`Model '${modelName}' not found`);

  while (!isUnique) {
    const randomDigits = crypto.randomInt(min, max).toString();
    uniqueId = prefix + randomDigits;

    const existing = await Model.findOne({ [idField]: uniqueId });
    if (!existing) {
      isUnique = true;
    }
  }

  return uniqueId;
}

module.exports = generateUniqueId;
