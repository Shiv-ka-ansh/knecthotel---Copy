// import { z } from 'zod';
// // ****************************Company Panel*********************

// // Admin Management Schema---------------------------------------------------------------------------------------
// const baseAdminSchema = z.object({
//   firstName: z.string().min(1, 'First Name is required'),
//   lastName: z.string().min(1, 'Last Name is required'),
//   email: z.string().email().min(1, 'Email is required'),
//   mobileNumber: z.string().min(1, 'Phone Number is required'),
//   roleId: z.string().min(1, 'Role is required'),
//   status: z.enum(['Active', 'Inactive'], {
//     errorMap: () => ({ message: 'Invalid Status' })
//   }),
//   password: z.string().optional() // Optional by default
// });

// // Schema for add mode (password required)
// export const addAdminSchema = baseAdminSchema.extend({
//   password: z
//     .string()
//     .min(6, { message: 'Password must be at least 6 characters' })
//     .nonempty({ message: 'Password is required' })
// });

// // Schema for edit mode (password optional)
// export const editAdminSchema = baseAdminSchema;

// export type AdminSchemaType = z.infer<typeof baseAdminSchema>;

// // Subscription Management Schema---------------------------------------------------------------------------------
// export const SubscriptionManagementFormSchema = z.object({
//   subscriptionID: z
//     .string()
//     .min(1, 'Subscription ID cannot be empty')
//     .optional(),
//   planName: z.string().min(1, 'Plan Name cannot be empty').optional(),
//   planDuration: z.string().min(1, 'Plan Duration cannot be empty').optional(), // Made optional
//   planType: z.string().min(1, 'Plan Type cannot be empty').optional(),
//   description: z.string().min(1, 'Description cannot be empty').optional(),
//   status: z.enum(['Active', 'Inactive', 'Cancelled', 'Expired'], {
//     errorMap: () => ({ message: 'Invalid status' })
//   }),
//   cost: z.coerce
//     .number({ invalid_type_error: 'Cost must be a valid number' })
//     .positive('Cost must be positive')
//     .min(0, 'Cost must be non-negative')
//     .optional() // Made optional
//   // PAYMENT TYPE FIELD VALIDATION IS LEFT
// });

// export type SubscriptionManagementFormSchemaType = z.infer<
//   typeof SubscriptionManagementFormSchema
// >;

// //Complaint management form schema--------------------------------------------------------------------------------
// export const complaintFormSchema = z.object({
//   complaintID: z.string(),
//   userID: z.string().min(1, 'Invalid UserID'),
//   complaintCategory: z.enum(
//     ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
//     {
//       errorMap: () => ({ message: 'Please select a valid complaint category' })
//     }
//   ),
//   description: z.string().min(1, 'Enter valid input'),
//   feedback: z.string().min(1, 'Enter valid input'),
//   status: z.enum(['Open', 'In-Progress', 'Resolved', 'Closed'], {
//     errorMap: () => ({ message: 'Please select a valid Refund status' })
//   }),
//   assignedStaff: z.string().min(1, 'Enter valid input'),
//   dateAndTime: z.string().min(1, 'Enter valid value')
// });

// export type ComplaintFormSchemaType = z.infer<typeof complaintFormSchema>;

// // Hotel management form schema--------------------------------------------------------------------------------

// export const serviceOptions = [
//   'Reception',
//   'Housekeeping',
//   'In-Room Dining',
//   'Gym',
//   'Spa',
//   'Swimming Pool',
//   'Concierge Service',
//   'In-Room Control',
//   'Order Management',
//   'SOS Management',
//   'Chat With Staff'
// ] as const;

// export type ServiceType = (typeof serviceOptions)[number];

// export const CreateHotelIdFormSchema = z.object({
//   hotelImageUrl: z.string(),
//   hotelImageFile: z
//     .custom<File | undefined>(
//       (file) => file instanceof File || typeof file === 'undefined',
//       { message: 'Invalid file format' }
//     )
//     .refine(
//       (file) =>
//         !file ||
//         ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
//           file.type
//         ),
//       { message: 'Only JPG, PNG, GIF, and WEBP formats are allowed.' }
//     )
//     .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
//       message: 'Image size must be 5MB or less.'
//     }),
//   hotelID: z.string().min(1, 'Hotel ID cannot be empty'),
//   hotelName: z.string().min(1, 'Hotel Name cannot be empty'), // Typo: "enmtpy" -> "empty"
//   address: z.string().min(1, 'Address field is required'),
//   services: z.array(z.enum(serviceOptions)),
//   subscriptionPlan: z.string().min(1, 'Subscription plan name is required.'),
//   subscriptionPrice: z.number().min(1, 'Price is required.'),
//   contactNo: z
//     .string()
//     .length(10, 'Contact number must be exactly 10 digits')
//     .regex(/^\d+$/, 'Contact number must contain only digits'),
//   email: z
//     .string()
//     .email('Invalid email address')
//     .min(1, 'Email address is required')
// });

// export type CreateHotelIdFormSchemaType = z.infer<
//   typeof CreateHotelIdFormSchema
// >;

// // Sub Hotel management form schema----------------------------------------------------------------------------

// export const CreateSubHotelIdFormSchema = z.object({
//   subHotelImageUrl: z.string(),
//   subHotelImageFile: z
//     .custom<File | undefined>(
//       (file) => file instanceof File || typeof file === 'undefined',
//       { message: 'Invalid file format' }
//     )
//     .refine(
//       (file) =>
//         !file ||
//         ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
//           file.type
//         ),
//       { message: 'Only JPG, PNG, GIF, and WEBP formats are allowed.' }
//     )
//     .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
//       message: 'Image size must be 5MB or less.'
//     }),
//   parentHotelID: z.string().min(1, 'Parent Hotel ID cannot be empty'),
//   subHotelName: z.string().min(1, 'Sub Hotel Name cannot be empty'), // Typo: "enmtpy" -> "empty"
//   address: z.string().min(1, 'Address field is required'),
//   services: z.array(z.enum(serviceOptions)),
//   subscriptionPlan: z.string().min(1, 'Subscription plan name is required.'),
//   subscriptionPrice: z.number().min(1, 'Price is required.'),
//   subHotelID: z.string().min(1, 'Hotel ID cannot be empty'),
//   contactNo: z
//     .string()
//     .length(10, 'Contact number must be exactly 10 digits')
//     .regex(/^\d+$/, 'Contact number must contain only digits'),
//   email: z
//     .string()
//     .email('Invalid email address')
//     .min(1, 'Email address is required'),
//   gstDetails: z.string().min(1, 'GST Details field cannot be empty')
// });

// export type CreateSubHotelIdFormSchemaType = z.infer<
//   typeof CreateSubHotelIdFormSchema
// >;

import { z } from 'zod';
// ****************************Company Panel*********************

// Admin Management Schema---------------------------------------------------------------------------------------
const baseAdminSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email().min(1, 'Email is required'),
  mobileNumber: z.string().min(1, 'Phone Number is required'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive'], {
    errorMap: () => ({ message: 'Invalid Status' })
  }),
  password: z.string().optional() // Optional by default
});

// Schema for add mode (password required)
export const addAdminSchema = baseAdminSchema.extend({
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .nonempty({ message: 'Password is required' })
});

// Schema for edit mode (password optional)
export const editAdminSchema = baseAdminSchema;

export type AdminSchemaType = z.infer<typeof baseAdminSchema>;

// Subscription Management Schema---------------------------------------------------------------------------------
export const SubscriptionManagementFormSchema = z.object({
  subscriptionID: z
    .string()
    .min(1, 'Subscription ID cannot be empty')
    .optional(),
  planName: z.string().min(1, 'Plan Name cannot be empty').optional(),
  planDuration: z.string().min(1, 'Plan Duration cannot be empty').optional(), // Made optional
  planType: z.string().min(1, 'Plan Type cannot be empty').optional(),
  description: z.string().min(1, 'Description cannot be empty').optional(),
  status: z.enum(['Active', 'Inactive', 'Cancelled', 'Expired'], {
    errorMap: () => ({ message: 'Invalid status' })
  }),
  cost: z.coerce
    .number({ invalid_type_error: 'Cost must be a valid number' })
    .positive('Cost must be positive')
    .min(0, 'Cost must be non-negative')
    .optional() // Made optional
  // PAYMENT TYPE FIELD VALIDATION IS LEFT
});

export type SubscriptionManagementFormSchemaType = z.infer<
  typeof SubscriptionManagementFormSchema
>;

//Complaint management form schema--------------------------------------------------------------------------------
// export const complaintFormSchema = z.object({
//   complaintID: z.string().optional(), // optional
//   userID: z.string().optional(), // now optional
//   hotelID: z.string().optional(),
//   complaintCategory: z.enum(
//     ['Subscription', 'Payment', 'Category 3', 'Category 4'],
//     {
//       errorMap: () => ({ message: 'Please select a valid complaint category' })
//     }
//   ),
//   description: z.string().min(1, 'Enter valid input'),
//   feedback: z.string().optional(), // optional
//   status: z
//     .enum(['Open', 'In-Progress', 'Resolved'], {
//       errorMap: () => ({ message: 'Please select a valid Refund status' })
//     })
//     .optional(),
//   assignedStaff: z.string().optional(), // optional
//   dateAndTime: z.string().optional() // optional
// });

// export type ComplaintFormSchemaType = z.infer<typeof complaintFormSchema>;
// export const ComplaintFormSchemaType = z.object({
//   complaintID: z.string().optional(),
//   userID: z.string().min(1, 'Invalid UserID').optional(),
//   hotelID: z.string().nonempty({ message: "Hotel ID is required" }),
//   complaintCategory: z.enum(
//     ['Subscription', 'Payment', 'Category 3', 'Category 4'],
//     {
//       errorMap: () => ({ message: 'Please select a valid complaint category' })
//     }
//   ),
//   description: z.string().min(1, 'Enter valid input'),
//   feedback: z.string().min(1, 'Enter valid input').optional(),
//   status: z
//     .enum(['Open', 'In-Progress', 'Resolved', 'Closed'], {
//       errorMap: () => ({ message: 'Please select a valid status' })
//     })
//     .optional(),
//   assignedStaff: z.string().min(1, 'Enter valid input').optional(),
//   dateAndTime: z.string().min(1, 'Enter valid value').optional()
// });

//Complaint management form schema--------------------------------------------------------------------------------
export const complaintFormSchema = z.object({
  complaintID: z.string().optional(),
  userID: z.string().optional(),
  hotelID: z.string().optional(),
  complaintType: z.string().optional(),
  complaintCategory: z.enum(
    [
      'Subscription',
      'Payment',
      'Account',
      'Booking',
      'Refund',
      'Coupon',
      'Other'
    ],
    {
      errorMap: () => ({ message: 'Please select a valid complaint category' })
    }
  ),

  description: z.string().min(1, 'Enter valid input'),
  feedback: z.string().optional(),
  status: z
    .enum(['Open', 'In-Progress', 'Resolved'], {
      errorMap: () => ({ message: 'Please select a valid Refund status' })
    })
    .optional(),
  assignedStaff: z.string().optional(),
  dateAndTime: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  uniqueId: z.string().optional(),
  updatedAt: z.string().optional(),
  assignedRoomNumber: z.string().optional(),
  email: z.string().optional(),
  estimatedDeliveryTime: z.string().optional(),
  remark: z.string().optional(),
  hotelName: z.string().optional()
});

export type ComplaintFormSchemaType = z.infer<typeof complaintFormSchema>;
export const ComplaintFormSchemaType = z.object({
  complaintID: z.string().optional(),
  userID: z.string().min(1, 'Invalid UserID').optional(),
  hotelID: z.string().nonempty({ message: 'Hotel ID is required' }),
  complaintCategory: z.enum(
    ['Subscription', 'Payment', 'Category 3', 'Category 4'],
    {
      errorMap: () => ({ message: 'Please select a valid complaint category' })
    }
  ),
  description: z.string().min(1, 'Enter valid input'),
  feedback: z.string().min(1, 'Enter valid input').optional(),
  status: z
    .enum(['Open', 'In-Progress', 'Resolved', 'Closed'], {
      errorMap: () => ({ message: 'Please select a valid status' })
    })
    .optional(),
  assignedStaff: z.string().min(1, 'Enter valid input').optional(),
  dateAndTime: z.string().min(1, 'Enter valid value').optional()
});

// Hotel management form schema--------------------------------------------------------------------------------

export const serviceOptions = [
  'Reception',
  'Housekeeping',
  'In-Room Dining',
  'Gym',
  'Spa',
  'Swimming Pool',
  'Concierge Service',
  'In-Room Control',
  'Order Management',
  'SOS Management',
  'Chat With Staff'
] as const;

export type ServiceType = (typeof serviceOptions)[number];

export const CreateHotelIdFormSchema = z.object({
  hotelImageUrl: z.string(),
  hotelImageFile: z
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
    }),
  hotelID: z.string().min(1, 'Hotel ID cannot be empty'),
  hotelName: z.string().min(1, 'Hotel Name cannot be empty'), // Typo: "enmtpy" -> "empty"
  address: z.string().min(1, 'Address field is required'),
  services: z.array(z.enum(serviceOptions)),
  subscriptionPlan: z.string().min(1, 'Subscription plan name is required.'),
  subscriptionPrice: z.number().min(1, 'Price is required.'),
  contactNo: z
    .string()
    .length(10, 'Contact number must be exactly 10 digits')
    .regex(/^\d+$/, 'Contact number must contain only digits'),
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email address is required')
});

export type CreateHotelIdFormSchemaType = z.infer<
  typeof CreateHotelIdFormSchema
>;

// Sub Hotel management form schema----------------------------------------------------------------------------

export const CreateSubHotelIdFormSchema = z.object({
  subHotelImageUrl: z.string(),
  subHotelImageFile: z
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
    }),
  parentHotelID: z.string().min(1, 'Parent Hotel ID cannot be empty'),
  subHotelName: z.string().min(1, 'Sub Hotel Name cannot be empty'), // Typo: "enmtpy" -> "empty"
  address: z.string().min(1, 'Address field is required'),
  services: z.array(z.enum(serviceOptions)),
  subscriptionPlan: z.string().min(1, 'Subscription plan name is required.'),
  subscriptionPrice: z.number().min(1, 'Price is required.'),
  subHotelID: z.string().min(1, 'Hotel ID cannot be empty'),
  contactNo: z
    .string()
    .length(10, 'Contact number must be exactly 10 digits')
    .regex(/^\d+$/, 'Contact number must contain only digits'),
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email address is required'),
  state: z.string(),
  city: z.string(),
  pinCode: z.string(),
  gstDetails: z.string().min(1, 'GST Details field cannot be empty')
});

export type CreateSubHotelIdFormSchemaType = z.infer<
  typeof CreateSubHotelIdFormSchema
>;

export const complaintStatusEnum = z.enum(['Open', 'Inprogress', 'Resolved']);
export type ComplaintStatusType = z.infer<typeof complaintStatusEnum>;

export const TransactionSchema = z.object({
  transactionId: z.string(),
  hotelName: z.string(),
  amount: z.string(),
  paymentGateway: z.string(),
  status: z.string(),
  createdAt: z.string()
});

export type TransactionSchemaType = z.infer<typeof TransactionSchema>;
// export const createRefundSchema = z.object({
//   refundID: z.string().optional(),
//   userID: z.string().optional(),
//   hotelId: z.string().optional(),
//   GuestId: z.string().optional(),
//   amount: z.number(),
//   refundReason: z.string(),
//   refundStatus: z.enum(['Initiated', 'In-progress', 'Completed', 'Rejected']),
//   assignedStaff: z.string().optional(),
//   serviceDepartment: z.string().optional(),
//   dateAndTime: z.string().optional(),
//   message: z.string().optional()
// });

// export type createRefundSchemaType = z.infer<typeof createRefundSchema>;

export const createRefundSchema = z
  .object({
    refundID: z.string().optional(),
    transactionId: z.string().optional(),
    mode: z.string().optional(),
    userID: z.string().optional(),
    phoneNumber: z.string().min(1, 'Phone Number is required').optional(),
    HotelId: z.string().optional(),
    GuestId: z.string().optional(),
    amount: z.number({
      required_error: 'Amount is required'
    }),
    refundReason: z.string({
      required_error: 'Refund reason is required'
    }),
    completionNote: z.string().optional(),
    refundStatus: z.enum(['Initiated', 'In-progress', 'Completed', 'Rejected']),
    assignedStaff: z.string().optional(),
    serviceDepartment: z.string().optional(),
    dateAndTime: z.string().optional(),
    feedback: z.string().optional(),
    rejectreason: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.refundStatus === 'Rejected' && !data.rejectreason?.trim()) {
      ctx.addIssue({
        path: ['rejectReason'],
        code: z.ZodIssueCode.custom,
        message: 'Reason for rejection is required'
      });
    }

    if (data.refundStatus === 'Completed' && !data.feedback?.trim()) {
      ctx.addIssue({
        path: ['feedback'],
        code: z.ZodIssueCode.custom,
        message: 'Feedback is required when refund is marked as Completed'
      });
    }
  });

export type createRefundSchemaType = z.infer<typeof createRefundSchema>;
