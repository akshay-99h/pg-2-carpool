import { z } from 'zod';

export const userRoleSchema = z.enum(['USER', 'ADMIN']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const approvalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;

export const commuteRoleSchema = z.enum(['VEHICLE_OWNER', 'PASSENGER', 'BOTH']);
export type CommuteRole = z.infer<typeof commuteRoleSchema>;

export const registerProfileSchema = z.object({
  name: z.string().min(2).max(80),
  towerFlat: z.string().min(2).max(32),
  commuteRole: commuteRoleSchema,
  vehicleNumber: z.string().max(20).optional().or(z.literal('')),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
});

export const emailOtpRequestSchema = z.object({
  email: z.string().email(),
});

export const emailOtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6)
    .regex(/^[0-9]+$/),
});

export const tripTypeSchema = z.enum(['DAILY', 'ONE_TIME']);

export const createTripSchema = z.object({
  tripType: tripTypeSchema,
  from: z.string().min(2).max(120),
  route: z.string().min(2).max(200),
  to: z.string().min(2).max(120),
  departAtIso: z.string().datetime(),
  seatsAvailable: z.number().int().min(1).max(7),
  notes: z.string().max(240).optional(),
});

export const poolRequestSchema = z.object({
  from: z.string().min(2).max(120),
  to: z.string().min(2).max(120),
  route: z.string().max(200).optional(),
  travelAtIso: z.string().datetime(),
  seatsNeeded: z.number().int().min(1).max(4),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
  message: z.string().min(10).max(500),
});

export const userAdminUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: userRoleSchema.optional(),
  approvalStatus: approvalStatusSchema.optional(),
});
