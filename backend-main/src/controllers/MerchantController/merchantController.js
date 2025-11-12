const CashfreeMerchant = require("../../models/CashfreeMerchant");
const ApiError = require("../../utils/ApiError");

exports.getMerchanByHotelId = async (req, res, next) => {
    try {
        const HotelId = req.params.HotelId
        if (req.user.scope !== 'Platform') {
            throw new ApiError(403, 'Access Denied!')
        }
        const merchant = await CashfreeMerchant.findOne({ HotelId })
        if (!merchant) {
            throw new ApiError(404, "No Merchant Found!")
        }
        const merchantId = merchant.merchantId.slice(0, 4) + "XXXXXXXXXXXXXXXXXXXXXXXXXXXX" + merchant.merchantId.slice(-4)
        return res.status(200).json({
            success: true,
            merchantId
        })
    } catch (error) {
        return next(error)
    }
}

exports.addCashreeMerchantId = async (req, res, next) => {
    try {
        const HotelId = req.params.HotelId
        if (req.user.scope !== 'Platform') {
            throw new ApiError(403, 'Access Denied!')
        };
        const { merchantId } = req.body;
        if (!merchantId || merchantId.trim() === "") {
            throw new ApiError(400, "merchantId is required");
        }
        await CashfreeMerchant.create({
            merchantId,
            addedBy: req.user._id,
            HotelId
        })
        return res.status(201).json({
            success: true,
            message: 'Cashfree Merchant Added Successfully!',
        })
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}

exports.updateCashreeMerchantId = async (req, res, next) => {
    try {
        const HotelId = req.params.HotelId
        if (req.user.scope !== 'Platform') {
            throw new ApiError(403, 'Access Denied!')
        };
        const { merchantId } = req.body;
        if (!merchantId || merchantId.trim() === "") {
            throw new ApiError(400, "merchantId is required");
        }
        
        const merchant = await CashfreeMerchant.findOneAndUpdate({HotelId},{
            merchantId,
            addedBy: req.user._id,
            HotelId
        })
        if(!merchant){
            throw new ApiError(404, "No Merchant Found!")
        }
        return res.status(201).json({
            success: true,
            message: 'Cashfree Merchant Updated Successfully!',
        })
    }
    catch (error) {
        console.log(error)
        return next(error)
    }
}