const Subscription = require("../../models/Subscription");
const ApiError = require("../../utils/ApiError");

exports.createSubscription = async (req, res) => {
  try {
    const createdBy = req.user._id;
    const { planName, planDuration, planType, description, cost } = req.body
    if ((!planName || !planDuration || !planType || !description || !cost)) {
      throw new ApiError(400, 'All fields are required')
    }
    const isExisting = await Subscription.findOne({ planName })
    if (isExisting) {
      throw new ApiError(409, 'Subscription plan name already exists')
    }
    const newSubscription = new Subscription({
      planName,
      planDuration,
      planType,
      description,
      cost,
      createdBy,
    });
    await newSubscription.save()

    return res.status(201).json({
      success: true,
      message: 'Subscription Created!',
      newSubscription
    })

  } catch (error) {
    return next(error)
  }
}
exports.updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Subscription.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updated) {
      throw new ApiError(404, "Subscription not found");
    }

    return res.status(200).json({
      success: true,
      message: "Subscription updated",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAllSubscriptions = async (req, res, next) => {
  try {
    let filter = {};
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10
    const skip = (page - 1) * limit; // Calculate number of documents to skip

    if (req.query?.status)
      filter.status = req.query.status;

    // 1. Get the total count for calculating total pages (optional but recommended)
    const totalSubscriptions = await Subscription.countDocuments(filter);

    // 2. Fetch the paginated results
    const subscriptions = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 3. Calculate total pages
    const totalPages = Math.ceil(totalSubscriptions / limit);

    return res.status(200).json({
      success: true,
      data: subscriptions,
      pagination: {
        totalSubscriptions,
        totalPages,
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    return next(error);
  }
};




exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    return res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    return next(error);
  }
};
