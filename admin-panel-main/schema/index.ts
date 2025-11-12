import { sources } from 'next/dist/compiled/webpack/webpack';
import { z } from 'zod';

// *****************Login and resetpassword form schema and type*******************

// Login Schema and type
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be atleast 6 characters'),
  rememberMe: z.boolean().default(false)
});

export type loginSchemaType = z.infer<typeof loginSchema>;

// Reset Password Schema and type
export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export type resetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

// Email verification Schema and type
export const otpVerificationSchema = z.object({
  otp: z.string()
});

export type otpVerificationSchemaType = z.infer<typeof otpVerificationSchema>;

// Set new password schema and type
export const setNewPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be atleast 6 characters'),
  confirmNewPassword: z.string().min(8, 'Password must be atleast 6 characters')
});

export type setNewPasswordSchemaType = z.infer<typeof setNewPasswordSchema>;

// *****************Add guest and Add booking form schema and type*******************

// Add guest schema and type

export const guestSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    phoneE164: z.string().optional(),
    phoneNumber: z
      .string()
      .regex(/^\d{10}$/, 'Phone Number must be exactly 10 digits'),
    // streetAddress: z.string().min(1, 'Required'),
    streetAddress: z.string().optional(),
    guests: z
      .array(
        z.object({
          guestType: z.enum(['adult', 'children', 'infant']),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          phoneNumber: z.string().optional(),
          countryCode: z.string().optional(),
          gender: z.enum(['male', 'female', 'others', 'prefer not to say']),
          idProof: z
            .object({
              url: z.string().optional(),
              type: z.string().optional(),
              verification: z
                .object({ status: z.string() })
                .partial()
                .optional()
            })
            .optional()
        })
      )
      .default([]),
    landmark: z.string().optional(),
    country: z.string(),
    email: z.string(),
    address: z.string().optional(),
    city: z.string(),
    state: z.string(),
    gst: z
      .preprocess((val) => (val === '' ? 0 : Number(val)), z.number())
      .optional(),
    countryCode: z.string().optional(),
    // gender: z.enum(['Male', 'Female', 'Others', 'Prefer not to say']),
    pinCode: z.string().regex(/^[1-9][0-9]{5}$/, {
      message: 'Pincode must be a 6-digit positive number (cannot start with 0)'
    }),
    sources: z.string().optional(),
    adultGuestsCount: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be an integer'),
    // .min(1, 'At least 1 adult is required'),
    childrenGuestsCount: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be an integer')
      .min(0),
    infantGuestsCount: z
      .number({ invalid_type_error: 'Must be a number' })
      .int('Must be an integer')
      .min(0),
    receivedAmt: z
      .preprocess((val) => (val === '' ? 0 : Number(val)), z.number())
      .optional(),

    roomTariffDue: z
      .preprocess((val) => (val === '' ? 0 : Number(val)), z.number())
      .optional(),
    serviceDue: z.number().optional(),

    dueAmt: z

      .preprocess((val) => (val === '' ? 0 : Number(val)), z.number())
      .optional(),
    paymentMode: z.string().optional(),

    roomCategory: z.string().optional(),

    // assignedRoomNumber: z
    // .union([z.string(), z.number()])
    // .transform((val) => (val === '' ? undefined : Number(val)))
    // .optional(),
    assignedRoomNumber: z.string().optional(),
    businessName: z.string().optional(),
    gstIn: z
      .string()
      .max(15, { message: 'GSTIN must not exceed 15 characters' })
      .regex(/^[A-Z0-9]*$/, {
        message: 'GSTIN must be uppercase letters and numbers only'

        // message: 'GSTIN must be uppercase letters and numbers only',
      })
      .optional(),
    status: z
      .enum([
        'Pending',
        'Confirmed',
        'Checked-In',
        'Checked-Out',
        'Cancelled',
        'No-Show'
      ])
      .optional(),
    paymentStatus: z.enum(['paid', 'unpaid']).optional(),

    roomNumber: z.string().optional(),
    roomTariff: z
      .preprocess((val) => (val === '' ? 0 : Number(val)), z.number())
      .optional(),

    checkInDate: z
      .preprocess(
        (val) => (typeof val === 'string' && val.trim() !== '' ? val : null),
        z.union([z.string(), z.null()])
      )
      .optional(),

    checkOutDate: z
      .preprocess(
        (val) => (typeof val === 'string' && val.trim() !== '' ? val : null),
        z.union([z.string(), z.null()])
      )
      .optional(),
    wifi: z.object({
      wifiName: z.string().optional(),
      password: z.string().optional(),
      scanner: z.string().optional()
    }),
    preCheckInRejectionMessage: z.string().optional(),
    specialRequests: z.string().optional(),
    idProof: z
      .object({
        url: z.string().optional(),
        type: z.string().optional(),
        verification: z
          .object({
            status: z.string().optional(),
            message: z.string().nullable().optional(),
            timestamp: z.string().nullable().optional(),
            requestId: z.string().nullable().optional()
          })
          .optional()
      })
      .optional()
  })
  .superRefine((data, ctx) => {
    const adults = Number(data.adultGuestsCount ?? 0);
    const children = Number(data.childrenGuestsCount ?? 0);
    const total = adults + children;
    const need = Math.max(0, total - 1);

    const roomAssigned =
      typeof data.assignedRoomNumber === 'string' &&
      data.assignedRoomNumber.trim().length > 0;

    // Enforce only when room is assigned AND party size > 1
    if (roomAssigned && total > 1) {
      if (data.guests.length !== need) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guests'],
          message: `Please add details for ${need} additional guest${need > 1 ? 's' : ''}`
        });
      }
    }
  });
// export type guestSchemaType = z.infer<typeof guestSchema>;
export type GuestSchemaType = z.infer<typeof guestSchema>;
// Add booking schema and type
export const bookingSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  phoneNo: z
    .string()
    .min(1, 'Phone Number is required')
    .max(10, 'Phone Number must not exceed 10 digits')
    .regex(/^\d{10}$/, 'Phone Number must be exactly 10 digits'),
  idProof: z.string().min(1, 'ID Proof is required'),
  roomType: z.string().min(1, 'Room Type is required'),
  email: z.string().email().min(1, 'Email is required'),
  roomNo: z.string().min(1, 'Room Number is required'),
  paymentStatus: z.string().min(1, 'Payment Status is required')
});

export type bookingSchemaType = z.infer<typeof bookingSchema>;

// *****************Notification Details form schema and type*******************

export const notificationSchema = z.object({
  notificationID: z.string().min(1, 'Notification ID is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  name: z.string().min(1, 'Name is required'),
  phoneNo: z
    .string()
    .min(1, 'Phone Number is required')
    .max(10, 'Phone Number must not exceed 10 digits')
    .regex(/^\d{10}$/, 'Phone Number must be exactly 10 digits'),
  roomNo: z.string().min(1, 'Room number is required'),
  notificationType: z.literal('Email'),
  Status: z.enum(['Received', 'Sent'])
});

export type notificationSchemaType = z.infer<typeof notificationSchema>;

// ****************************Payment management schema*******************************************

// ***********Create coupon schema and type************
export const createCouponSchema = z.object({
  category: z.enum(['Percentage Coupons', 'Fixed Amount Coupons'], {
    errorMap: () => ({ message: 'Please select a valid category status' })
  }),
  validityFrom: z.string().min(1, 'Validity From is required'),
  validityTo: z.string().min(1, 'Validity To is required'),
  usageLimit: z.string().min(1, 'Usage Limit is required'),
  discountPercentage: z.string().min(1, 'Per User Limit is required'),
  discountAmount: z
    .number()
    .min(0, 'Discount amount cannot be negative')
    .or(z.literal(0)),
  minimumSpent: z.string().min(1, 'Minimum Spent is required'),
  couponStatus: z.enum(['active', 'expired', 'disabled'], {
    errorMap: () => ({ message: 'Please select a valid coupon status' })
  }),
  redemption: z.enum(['automatic', 'manual entry', 'promo code'], {
    errorMap: () => ({ message: 'Please select a valid coupon status' })
  }),
  stackable: z.boolean().default(false),
  createCode: z.string().min(1, 'Create Code is required'),
  termsAndConditions: z.string().min(1, 'Terms and Conditions is required'),
  couponImage: z
    .custom<File | undefined>(
      (file) => file instanceof File || typeof file === 'undefined',
      { message: 'Invalid file format' }
    )
    .refine(
      (file) =>
        !file ||
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
          file.type
        ),
      { message: 'Only JPG, PNG, GIF, and WEBP formats are allowed.' }
    )
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: 'Image size must be 5MB or less.'
    })
});
export type createCouponSchemaType = z.infer<typeof createCouponSchema>;

//***********Create refund schema and type*************
export const createRefundSchema = z.object({
  refundID: z.string(),
  userID: z.string().min(1, 'Invalid UserID'),
  hotelID: z.string().min(1, 'Invalid HotelID'),
  amount: z.number().min(1, 'Enter valid amount'),
  refundReason: z.string().min(1, 'Enter valid input'),
  refundStatus: z.enum(['Initiated', 'In-Progress', 'Completed', 'Rejected'], {
    errorMap: () => ({ message: 'Please select a valid Refund status' })
  }),
  message: z.string().min(1, 'Enter a valid input').optional(),
  assignedStaff: z.string().min(1, 'Enter valid input'),
  serviceDepartment: z.string().min(1, 'Enter valid input'),
  dateAndTime: z.string().min(1, 'Enter valid value')
});

export type createRefundSchemaType = z.infer<typeof createRefundSchema>;

// **********Hotel Profile schema***************
// Room configuration schema
export const roomConfigSchema = z.object({
  roomType: z.string().min(1, 'Room type is required'),
  // feature: z.string().min(1, 'Feature is required')
  features: z
    .array(z.string().min(1))
    .min(1, 'Add at least one feature')
    .default([])
});

export const hotelSchema = z.object({
  hotelId: z.string().min(1, 'Hotel ID is required'), // maps to "HotelId"
  name: z.string().min(1, 'Hotel name is required'), // maps to "name"
  number: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Complete address is required'), // maps to "address"
  hotelCategory: z.enum(['3 Star', '4 Star', '5 Star', '7 Star']),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().regex(/^[1-9][0-9]{5}$/, {
    message: 'Pincode must be a 6-digit positive number (cannot start with 0)'
  }),
  gst: z.string().optional(), // maps to "gstDetails"
  gstImage: z.any().optional(),
  brandedHotel: z.boolean().optional(),
  chainHotel: z.boolean().optional(), // mapped from string-to-boolean if needed
  // parentHotelName: z.string().optional(), // maps to "parentHotel"
  parentHotelId: z.string().optional(), // maps to "parentHotel"
  // subHotelName: z.string().optional(),
  roomImage: z.array(z.string().url()).optional().default([]),
  // subscriptionPlan: z.string(),
  roomConfigs: z.array(roomConfigSchema),
  numberOfRooms: z.number().min(1),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  servingDepartment: z.array(z.string()).optional(), // maps to servingDepartment[0]
  totalStaff: z.number().min(1),
  hotelLicenseCertifications: z.string().optional(), // maps to "hotelLicenseAndCertification.certificateValue"
  hotelLicenseImage: z.any().optional(),
  legalBusinessLicense: z.string().optional(), // maps to "legalAndBusinessLicense.licenseValue"
  legalBusinessLicenseImage: z.any().optional(),
  touristLicense: z.string().optional(), // maps to "touristLicense.licenseValue"
  touristLicenseImage: z.any().optional(),
  tanNumber: z.string().optional(), // maps to "panNumber.numberValue"
  tanNumberImage: z.any().optional(),
  dataPrivacyGdprCompliances: z.string().optional(), // maps to "dataPrivacyAndGDPRCompliance.complianceValue"
  dataPrivacyGdprImage: z.any().optional(),

  subscriptionPlan: z.object({
    _id: z.string(),
    planName: z.string(),
    cost: z.number(),
    planType: z.string()
  }),
  planName: z.string(),
  subscriptionPlanName: z.any().optional(),
  // This should hold the plan's _id (string)
  subscriptionPrice: z.number(),
  netPrice: z.number().optional(),
  couponCode: z.string().optional(),
  // couponCode: z
  //   .object({
  //     _id: z.string(),
  //     code: z.string(),
  //     discountType: z.enum(['percentage', 'fixed']),
  //     value: z.number(),
  //   })
  //   .optional(),
  logoImage: z.any().optional(),
  additionalImage: z.any().optional(),
  internetConnectivity: z.boolean().optional(),
  status: z.enum(['Active', 'Inactive']),
  softwareCompatibility: z.boolean().optional(),
  subscriptionStartDate: z
    .string()
    .min(1, 'Subscription start date is required'),
  subscriptionEndDate: z.string().min(1, 'Subscription start date is required'),
  wifi: z.object({
    wifiName: z.string().optional(),
    password: z.string().optional(),
    scanner: z.string().optional()
  }),
  about: z.string().optional(),
  subscriptionPlanType: z.string().optional(),
  gstPercentage: z.number().min(0).max(100).optional(),
  serviceDue: z.number().optional()
});
// Inferred type
export type HotelSchemaType = z.infer<typeof hotelSchema>;

// **********Change password schema************ //

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, { message: 'Old password must be at least 6 characters' })
      .nonempty({ message: 'Old password is required' }),

    newPassword: z
      .string()
      .min(6, { message: 'New password must be at least 6 characters' })
      .max(18, { message: 'New password must not exceed 18 characters' })
      .regex(/[A-Z]/, {
        message: 'New password must contain at least one uppercase letter'
      })
      .regex(/[a-z]/, {
        message: 'New password must contain at least one lowercase letter'
      })
      .regex(/\d/, { message: 'New password must contain at least one number' })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: 'New password must contain at least one special character'
      })
      .nonempty({ message: 'New password is required' }),

    confirmNewPassword: z
      .string()
      .min(8, { message: 'Confirm password must be at least 6 characters' })
      .nonempty({ message: 'Confirm password is required' })
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword']
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: 'New password must be different from old password',
    path: ['newPassword']
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;

// ***********************PriceTimeSetting Modal Form Schema **********************//

// PriceTimeSetting(Global) Schema
export const PriceTimeSettingSchema = z.object({
  priceType: z.enum(['Free', 'Paid'], {
    errorMap: () => ({
      message: 'Invalid Price Category'
    })
  }),
  price: z
    .string()
    .refine((val) => val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Invalid price format (e.g., 10 or 10.99)'
    })
    .transform((val) => (val === '' ? 0 : parseFloat(val)))
    .refine((val) => val > 0, { message: 'Price must be greater than 0' })
    .or(z.number().min(1, { message: 'Price must be greater than 0' })),
  timeSlot: z.enum(
    ['5:00AM-12:00PM', '12:00PM-10:00PM', '10:00PM-1:00AM', '11:00PM-12:00AM'],
    {
      errorMap: () => ({ message: 'Please select valid time slot' })
    }
  ),
  availability: z.enum(
    ['Monday-Friday', 'Monday-saturday', 'Monday-Sunday', 'only Weekends'],
    {
      errorMap: () => ({ message: 'Please select valid slot' })
    }
  )
});

export type PriceTimeSettingSchemaType = z.infer<typeof PriceTimeSettingSchema>;

// Price time setting schema for gym service

export const PriceTimeSettingGymSchema = z.object({
  priceType: z.enum(['Free', 'Paid'], {
    errorMap: () => ({
      message: 'Invalid Price Category'
    })
  }),
  price: z
    .string()
    .refine((val) => val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Invalid price format (e.g., 10 or 10.99)'
    })
    .transform((val) => (val === '' ? 0 : parseFloat(val)))
    .refine((val) => val > 0, { message: 'Price must be greater than 0' })
    .or(z.number().min(1, { message: 'Price must be greater than 0' })),
  timeSlot: z.enum(
    ['5:00AM-12:00PM', '12:00PM-10:00PM', '10:00PM-1:00AM', '11:00PM-12:00AM'],
    {
      errorMap: () => ({ message: 'Please select valid time slot' })
    }
  ),
  availability: z.enum(
    ['Monday-Friday', 'Monday-saturday', 'Monday-Sunday', 'only Weekends'],
    {
      errorMap: () => ({ message: 'Please select valid slot' })
    }
  ),
  category: z.string({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a string'
  })
});

export type PriceTimeSettingGymSchemaType = z.infer<
  typeof PriceTimeSettingGymSchema
>;

// Price time setting schema for Concierge service

export const PriceTimeSettingConciergeSchema = z.object({
  priceType: z.enum(['Free', 'Paid'], {
    errorMap: () => ({
      message: 'Invalid Price Category'
    })
  }),
  price: z
    .string()
    .refine((val) => val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Invalid price format (e.g., 10 or 10.99)'
    })
    .transform((val) => (val === '' ? 0 : parseFloat(val)))
    .refine((val) => val > 0, { message: 'Price must be greater than 0' })
    .or(z.number().min(1, { message: 'Price must be greater than 0' })),
  timeSlot: z.enum(
    ['5:00AM-12:00PM', '12:00PM-10:00PM', '10:00PM-1:00AM', '11:00PM-12:00AM'],
    {
      errorMap: () => ({ message: 'Please select valid time slot' })
    }
  ),
  availability: z.enum(
    ['Monday-Friday', 'Monday-saturday', 'Monday-Sunday', 'only Weekends'],
    {
      errorMap: () => ({ message: 'Please select valid slot' })
    }
  ),
  category: z.string({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a string'
  })
});

export type PriceTimeSettingConciergeSchemaType = z.infer<
  typeof PriceTimeSettingConciergeSchema
>;
// Price time setting schema for InRoomControl service

export const PriceTimeSettingInRoomControlSchema = z.object({
  priceType: z.enum(['Free', 'Paid'], {
    errorMap: () => ({
      message: 'Invalid Price Category'
    })
  }),
  price: z
    .string()
    .refine((val) => val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Invalid price format (e.g., 10 or 10.99)'
    })
    .transform((val) => (val === '' ? 0 : parseFloat(val)))
    .refine((val) => val > 0, { message: 'Price must be greater than 0' })
    .or(z.number().min(1, { message: 'Price must be greater than 0' })),
  timeSlot: z.enum(
    ['5:00AM-12:00PM', '12:00PM-10:00PM', '10:00PM-1:00AM', '11:00PM-12:00AM'],
    {
      errorMap: () => ({ message: 'Please select valid time slot' })
    }
  ),
  availability: z.enum(
    ['Monday-Friday', 'Monday-saturday', 'Monday-Sunday', 'only Weekends'],
    {
      errorMap: () => ({ message: 'Please select valid slot' })
    }
  ),
  category: z.string({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a string'
  })
});

export type PriceTimeSettingInRoomControlSchemaType = z.infer<
  typeof PriceTimeSettingInRoomControlSchema
>;

// Price time setting schema for spa/salon service

export const PriceTimeSettingSpaSchema = z.object({
  priceType: z.enum(['Free', 'Paid'], {
    errorMap: () => ({
      message: 'Invalid Price Category'
    })
  }),
  price: z
    .string()
    .refine((val) => val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Invalid price format (e.g., 10 or 10.99)'
    })
    .transform((val) => (val === '' ? 0 : parseFloat(val)))
    .refine((val) => val > 0, { message: 'Price must be greater than 0' })
    .or(z.number().min(1, { message: 'Price must be greater than 0' })),
  timeSlot: z.enum(
    ['5:00AM-12:00PM', '12:00PM-10:00PM', '10:00PM-1:00AM', '11:00PM-12:00AM'],
    {
      errorMap: () => ({ message: 'Please select valid time slot' })
    }
  ),
  availability: z.enum(
    ['Monday-Friday', 'Monday-saturday', 'Monday-Sunday', 'only Weekends'],
    {
      errorMap: () => ({ message: 'Please select valid slot' })
    }
  ),
  service: z.string({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a string'
  }),
  productCategory: z.string({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a string'
  }),
  productName: z.string({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a string'
  })
});

export type PriceTimeSettingSpaSchemaType = z.infer<
  typeof PriceTimeSettingSpaSchema
>;
// Price time setting schema for spa/salon service

export const PriceTimeSettingHouseKeepingSchema = z.object({
  priceType: z.enum(['Free', 'Paid'], {
    errorMap: () => ({
      message: 'Invalid Price Category'
    })
  }),
  price: z
    .string()
    .refine((val) => val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Invalid price format (e.g., 10 or 10.99)'
    })
    .transform((val) => (val === '' ? 0 : parseFloat(val)))
    .refine((val) => val > 0, { message: 'Price must be greater than 0' })
    .or(z.number().min(1, { message: 'Price must be greater than 0' })),
  timeSlot: z.enum(
    ['5:00AM-12:00PM', '12:00PM-10:00PM', '10:00PM-1:00AM', '11:00PM-12:00AM'],
    {
      errorMap: () => ({ message: 'Please select valid time slot' })
    }
  ),
  availability: z.enum(
    ['Monday-Friday', 'Monday-saturday', 'Monday-Sunday', 'only Weekends'],
    {
      errorMap: () => ({ message: 'Please select valid slot' })
    }
  ),
  service: z.string({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a string'
  }),
  productCategory: z.string({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a string'
  }),
  productName: z.string({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a string'
  })
});

export type PriceTimeSettingHouseKeepingSchemaType = z.infer<
  typeof PriceTimeSettingHouseKeepingSchema
>;

// ***********Reception Details Form Schema************//

const requestTypeEnum = z.enum([
  'Service',
  'Complaint',
  'Wake-up call',
  'Pre check-in',
  'Pre check-out',
  'Wake up call schedule',
  'Feedback',
  'Service feedback'
]);

const statusEnum = z.enum(['Pending', 'In-Progress', 'Completed']);

export const ReceptionDataSchema = z.object({
  requestID: z.string(),
  requestDetail: z.string(),
  responseDetail: z.string(),
  requestAssignedTo: z.string(),
  requestTime: z.object({
    date: z.string(), // Consider using `z.date()` if you work with actual Date objects
    time: z.string()
  }),
  guestDetails: z.object({
    guetID: z.string(),
    name: z.string(),
    roomNo: z.string(),
    mobileNumber: z
      .string()
      .min(1, 'Phone Number is required')
      .max(10, 'Phone Number must not exceed 10 digits')
      .regex(/^\d{10}$/, 'Phone Number must be exactly 10 digits'), // Adjust min/max length as needed
    email: z.string().email()
  }),
  requestType: requestTypeEnum,
  status: statusEnum,
  assignedTo: z.string()
});

export type ReceptionDataSchemaType = z.infer<typeof ReceptionDataSchema>;

// *************Order Management schema***************
//manage products modal form schema

export const ManageProductsSchema = z.object({
  productType: z.string().min(1, 'Invalid input')
});

export type ManageProductsSchemaType = z.infer<typeof ManageProductsSchema>;

//Add Menu modal form schema

export const AddMenuSchema = z.object({
  newProductType: z.string().min(1, 'Invalid input'),
  selectType: z
    .enum(['American', 'Starter'], {
      errorMap: () => ({
        message: 'Invalid status category'
      })
    })
    .optional(),
  productName: z.string().min(1, 'Invalid input'),
  description: z.string().min(1, 'Invalid input'),
  barcode: z.string().min(1, 'Invalid input'),
  salesPrice: z.number().min(0, 'Sales price must be a positive number'),
  salesTaxes: z.number().min(0, 'Sales tax must be a positive number'),
  productImage: z
    .custom<File | undefined>(
      (file) => file instanceof File || typeof file === 'undefined',
      { message: 'Invalid file format' }
    )
    .refine(
      (file) =>
        !file ||
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
          file.type
        ),
      { message: 'Only JPG, PNG, GIF, and WEBP formats are allowed.' }
    )
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: 'Image size must be 5MB or less.'
    })
});

export type AddMenuSchemaType = z.infer<typeof AddMenuSchema>;

// *******************Employee management*********************
// Add employee form schema
export const employeeSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email().min(1, 'Email is required'),
  phoneNo: z
    .string()
    .min(1, 'Phone Number is required')
    .max(10, 'Phone Number must not exceed 10 digits')
    .regex(/^\d{10}$/, 'Phone Number must be exactly 10 digits'),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .nonempty({ message: 'Password is required' }),

  role: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive'], {})
});

export type employeeSchemaType = z.infer<typeof employeeSchema>;

// **************SPA/Salon service schema**************//

export const spaSalonServiceSchema = z.object({
  additionalService: z.string().min(1, 'Invalid input')
});

export type SpaSalonServiceSchemaType = z.infer<typeof spaSalonServiceSchema>;

// *************In-room dining shema*****************//
//Add item schema

export const AddItemsSchema = z.object({
  productType: z.string().min(1, 'Enter valid input'),
  productName: z.string().min(1, 'Enter valid input'),
  description: z.string().min(1, 'Enter valid input'),
  cost: z.coerce.number().min(0, 'Price must be greater than 0'),
  foodType: z.enum(['vegetarian', 'non-vegetarian']),
  visibility: z.boolean(),
  itemImage: z
    .custom<File | undefined>(
      (file) => file instanceof File || typeof file === 'undefined',
      {
        message: 'Invalid file format'
      }
    )
    .refine(
      (file) =>
        !file ||
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
          file.type
        ),
      { message: 'Only JPG, PNG, GIF, and WEBP formats are allowed.' }
    )
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: 'Image size must be 5MB or less.'
    }),
  imageUrl: z.string().optional().nullable()
});

export type AddItemsSchemaType = z.infer<typeof AddItemsSchema>;

//*****************Housekeeping Service > Manage products modal form schema****************/

//***************Concierge Service > Manage products modal form schema****************/
export const ConciergeManageProductsModalFormSchema = z.object({
  productCategory: z
    .string()
    .min(1, 'Input field must have at least 1 character.'),
  selectService: z.enum(['Nearby Attractions', 'Nearby Cafe & Restaurants'], {
    errorMap: () => ({ message: 'Invalid Category' })
  }),
  name: z.string().min(1, 'Input field must have at least 1 character.'),
  distance: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Distance must be a positive number'
    }),

  description: z.string().min(1, 'Input field must have at least 1 character.'),
  productImage: z
    .union([z.any(), z.string().url()])
    .optional()
    .refine((file) => file !== '', {
      message: 'Logo image must not be an empty value'
    })
});

export type ConciergeManageProductsModalFormSchemaType = z.infer<
  typeof ConciergeManageProductsModalFormSchema
>;

//***************Spa/Salon Service > Manage products modal form schema****************/

export const SpaManageProductsModalFormSchema = z.object({
  productCategory: z
    .string()
    .min(1, 'Input field must have at least 1 character.'),
  selectService: z.enum(['SPA SERVICE', 'SALON SERVICE'], {
    errorMap: () => ({ message: 'Invalid Category' })
  }),
  name: z.string().min(1, 'Input field must have at least 1 character.'),

  description: z.string().min(1, 'Input field must have at least 1 character.'),
  visibility: z.boolean(),
  productImage: z
    .union([z.any(), z.string().url()])
    .optional()
    .refine((file) => file !== '', {
      message: 'Logo image must not be an empty value'
    }),
  additionalService: z
    .string()
    .min(1, 'Input field must have at least 1 character.'),
  additionalServicePrice: z
    .string()
    .refine((val) => val === '' || /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Invalid price format (e.g., 10 or 10.99)'
    })
    .transform((val) => (val === '' ? 0 : parseFloat(val)))
    .refine((val) => val > 0, { message: 'Price must be greater than 0' })
    .or(z.number().min(1, { message: 'Price must be greater than 0' })),
  additionalServiceImage: z
    .union([z.any(), z.string().url()])
    .optional()
    .refine((file) => file !== '', {
      message: 'Logo image must not be an empty value'
    })
});

export type SpaManageProductsModalFormSchemaType = z.infer<
  typeof SpaManageProductsModalFormSchema
>;

//*****************Swimming Pool Service > Manage products modal form schema****************/
export const SwimmingPoolManageProductsModalFormSchema = z.object({
  swimmingPoolImage: z
    .union([z.any(), z.string().url()])
    .optional()
    .refine((file) => file !== '', {
      message: 'Logo image must not be an empty value'
    })
});

export type SwimmingPoolManageProductsModalFormSchemaType = z.infer<
  typeof SwimmingPoolManageProductsModalFormSchema
>;

//*****************Gym Pool Service > Manage products modal form schema****************/

export const GymManageProductsModalFormSchema = z.object({
  equipmentImage: z
    .union([z.any(), z.string().url()])
    .optional()
    .refine((file) => file !== '', {
      message: 'Logo image must not be an empty value'
    }),
  equipmentName: z.string().min(1, 'Empty input field.')
});

export type GymManageProductsModalFormSchemaType = z.infer<
  typeof GymManageProductsModalFormSchema
>;
