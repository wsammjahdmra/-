/**
 * Enterprise Data Types & Database Schema
 * منصة عقار — الإصدار الرابع
 */

export type UserRole =
  | 'visitor'
  | 'registered_user'
  | 'individual_advertiser'
  | 'org_manager'
  | 'authorized_broker'
  | 'content_moderator'
  | 'compliance_officer'
  | 'support_officer'
  | 'financial_officer'
  | 'system_admin';

export type AccountStatus = 'active' | 'suspended' | 'pending_verification';

export interface UserAccount {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
  falLicenseNumber?: string;
  nationalIdMasked?: string;
  orgId?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  commercialRecord: string;
  falOrgLicense: string;
  managerUserId: string;
  status: 'active' | 'pending_verification' | 'suspended';
  logoUrl?: string;
  city: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface OrgMembership {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  userPhone: string;
  roleInOrg: 'manager' | 'broker' | 'agent';
  invitationStatus: 'pending' | 'accepted' | 'rejected' | 'revoked';
  scopeLimitations: string;
  invitedAt: string;
  joinedAt?: string;
}

export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'land'
  | 'building'
  | 'office'
  | 'floor'
  | 'warehouse';

export interface Property {
  id: string;
  city: string;
  district: string;
  propertyType: PropertyType;
  totalAreaSqm: number;
  latitude: number;
  longitude: number;
  addressDescription: string;
  deedNumber: string;
}

export type ListingPurpose = 'sale' | 'rent';

export type ListingStatus =
  | 'draft'
  | 'pending_verification'
  | 'needs_completion'
  | 'approved_for_publish'
  | 'published'
  | 'suspended'
  | 'expired'
  | 'rejected'
  | 'cancelled';

export interface ListingMedia {
  id: string;
  listingId: string;
  mediaType: 'image' | 'video' | 'plan';
  url: string;
  isPrimary: boolean;
  title?: string;
}

export interface ListingStatusHistory {
  id: string;
  listingId: string;
  fromStatus: ListingStatus;
  toStatus: ListingStatus;
  reason?: string;
  changedByUserId: string;
  changedByName: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  propertyId: string;
  property: Property;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  orgId?: string;
  orgName?: string;
  title: string;
  description: string;
  purpose: ListingPurpose;
  rentPeriod?: 'daily' | 'monthly' | 'yearly';
  price: number;
  currency: 'SAR';
  roomsCount: number;
  bathroomsCount: number;
  floorNumber?: number;
  buildingAgeYears?: number;
  facade?: string;
  streetWidthM?: number;
  features: string[];
  adLicenseNumber: string;
  licenseVerificationStatus: 'verified' | 'pending' | 'failed' | 'not_requested';
  status: ListingStatus;
  isFeatured: boolean;
  featuredExpiresAt?: string;
  viewsCount: number;
  favoritesCount: number;
  publishedAt?: string;
  expiresAt?: string;
  media: ListingMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUnit {
  id: string;
  projectId: string;
  unitNumber: string;
  unitType: string;
  areaSqm: number;
  rooms: number;
  price: number;
  status: 'available' | 'reserved' | 'sold';
}

export interface Project {
  id: string;
  developerName: string;
  name: string;
  city: string;
  district: string;
  description: string;
  status: 'under_construction' | 'ready' | 'off_plan';
  unitsTotal: number;
  priceStartsFrom: number;
  imageUrl: string;
  handoverDate: string;
  features: string[];
  units?: ProjectUnit[];
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  title: string;
  criteria: {
    city?: string;
    district?: string;
    purpose?: ListingPurpose;
    propertyType?: PropertyType;
    minPrice?: number;
    maxPrice?: number;
  };
  notifyEnabled: boolean;
  createdAt: string;
}

export interface ReportCase {
  id: string;
  referenceNo: string;
  listingId: string;
  listingTitle: string;
  reporterUserId?: string;
  reporterContact?: string;
  reasonType: 'fake_ad' | 'wrong_price' | 'unlicensed' | 'duplicate_ad' | 'inappropriate_content';
  description: string;
  status: 'new' | 'under_investigation' | 'escalated' | 'closed';
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionPackage {
  id: string;
  name: string;
  tier: 'basic' | 'pro' | 'premium_star';
  durationDays: number;
  basePrice: number;
  features: string[];
  badgeText: string;
}

export interface PaymentOrder {
  id: string;
  idempotencyKey: string;
  userId: string;
  userName: string;
  listingId?: string;
  listingTitle?: string;
  packageId: string;
  packageName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: 'SAR';
  paymentMethod: 'mada' | 'visa_mastercard' | 'apple_pay';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentGatewayRef?: string;
  createdAt: string;
  paidAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  paymentOrderId: string;
  userId: string;
  customerName: string;
  customerTaxNo?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: 'SAR';
  zatcaStatus: 'compliant';
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  createdAt: string;
}

export interface Refund {
  id: string;
  paymentOrderId: string;
  invoiceNumber: string;
  refundAmount: number;
  reason: string;
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  approvedBy?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface AuditEvent {
  id: string;
  userId?: string;
  userRole?: string;
  userName?: string;
  eventType: string;
  entityName: string;
  entityId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface SystemSettings {
  platformName: string;
  platformSubtitle: string;
  logoText: string;
  primaryColor: string; // hex code
  secondaryColor: string;
  vatRate: number; // e.g. 0.15
  currency: 'SAR';
  supportPhone: string;
  supportEmail: string;
  regaLicenseNote: string;
  allowVisitorReports: boolean;
}

export interface MarketIndicator {
  id: string;
  city: string;
  district: string;
  propertyType: PropertyType;
  purpose: ListingPurpose;
  avgPricePerSqm: number;
  quarterlyChangePercent: number;
  totalTransactionsRecorded: number;
  source: string;
  lastUpdated: string;
}

export interface GroundedPlaceChunk {
  title: string;
  uri: string;
  address?: string;
}

export interface NeighborhoodInsight {
  city: string;
  district: string;
  summary: string;
  schools: string[];
  hospitals: string[];
  parks: string[];
  groundingUrls: GroundedPlaceChunk[];
  sourceModel: string;
}
