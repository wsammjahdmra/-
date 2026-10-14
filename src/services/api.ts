/**
 * Frontend API Service Client
 * منصة عقار — الإصدار الرابع
 */

import {
  Listing,
  Project,
  ReportCase,
  SupportTicket,
  PaymentOrder,
  Invoice,
  Refund,
  SystemSettings,
  MarketIndicator,
  NeighborhoodInsight,
  UserAccount,
  PromotionPackage,
  SavedSearch,
  OrgMembership,
  Organization,
} from '../types/database';

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `خطأ في الاتصال بالخادم (${res.status})`);
  }
  return data;
}

export const api = {
  // Settings & Branding
  getSettings: () => request<{ success: boolean; settings: SystemSettings }>('/settings'),
  updateSettings: (settings: Partial<SystemSettings>) =>
    request<{ success: boolean; settings: SystemSettings; message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Auth & Roles
  getMe: () => request<{ success: boolean; user: UserAccount; organization?: Organization }>('/auth/me'),
  login: (credentials: { email?: string; phone?: string }) =>
    request<{ success: boolean; user: UserAccount; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (payload: { fullName: string; phone: string; email: string; role?: string; falLicenseNumber?: string }) =>
    request<{ success: boolean; user: UserAccount; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  switchRole: (role: string, userId?: string) =>
    request<{ success: boolean; user: UserAccount; message: string }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role, userId }),
    }),

  // Listings
  getListings: (params?: Record<string, string | number | boolean>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    const qs = query.toString();
    return request<{ success: boolean; count: number; listings: Listing[] }>(`/listings${qs ? `?${qs}` : ''}`);
  },
  getListing: (id: string) =>
    request<{ success: boolean; listing: Listing; history: any[]; isFavorited: boolean }>(`/listings/${id}`),
  createListing: (payload: any) =>
    request<{ success: boolean; listing: Listing; message: string }>('/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  submitListingForReview: (id: string) =>
    request<{ success: boolean; listing: Listing; message: string }>(`/listings/${id}/submit`, {
      method: 'POST',
    }),
  updateListingStatus: (id: string, toStatus: string, reason?: string) =>
    request<{ success: boolean; listing: Listing; message: string }>(`/listings/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ toStatus, reason }),
    }),
  toggleFavorite: (id: string) =>
    request<{ success: boolean; isFavorited: boolean; favoritesCount: number }>(`/listings/${id}/toggle-favorite`, {
      method: 'POST',
    }),

  // Projects & Units
  getProjects: () => request<{ success: boolean; count: number; projects: Project[] }>('/projects'),
  getProject: (id: string) => request<{ success: boolean; project: Project }>(`/projects/${id}`),

  // User Services
  getFavorites: () => request<{ success: boolean; listings: Listing[] }>('/favorites'),
  getSavedSearches: () => request<{ success: boolean; savedSearches: SavedSearch[] }>('/saved-searches'),
  createSavedSearch: (payload: { title: string; criteria: any; notifyEnabled: boolean }) =>
    request<{ success: boolean; savedSearch: SavedSearch; message: string }>('/saved-searches', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Reports & Support
  submitReport: (payload: { listingId: string; reasonType: string; description: string; reporterContact?: string }) =>
    request<{ success: boolean; referenceNo: string; message: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAdminReports: () => request<{ success: boolean; count: number; reports: ReportCase[] }>('/admin/reports'),
  resolveReport: (id: string, payload: { status: string; resolutionNote: string; suspendListing?: boolean }) =>
    request<{ success: boolean; report: ReportCase; message: string }>(`/admin/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getTickets: () => request<{ success: boolean; tickets: SupportTicket[] }>('/tickets'),
  createTicket: (payload: { subject: string; message: string; priority?: string }) =>
    request<{ success: boolean; ticket: SupportTicket; message: string }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Organization
  getMyOrg: () =>
    request<{
      success: boolean;
      organization: Organization | null;
      members: OrgMembership[];
      listings: Listing[];
    }>('/organizations/my-org'),
  inviteMember: (payload: { userName: string; userPhone: string; roleInOrg?: string; scopeLimitations?: string }) =>
    request<{ success: boolean; membership: OrgMembership; message: string }>('/organizations/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMember: (id: string, payload: Partial<OrgMembership>) =>
    request<{ success: boolean; membership: OrgMembership; message: string }>(`/organizations/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Finance & Promotion
  getPackages: () =>
    request<{ success: boolean; packages: PromotionPackage[]; vatRate: number }>('/finance/packages'),
  createPaymentOrder: (payload: { listingId: string; packageId: string; paymentMethod: string; idempotencyKey?: string }) =>
    request<{ success: boolean; order: PaymentOrder; message: string }>('/finance/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  processPaymentWebhook: (payload: { orderId: string; paymentGatewayRef?: string; status?: 'paid' | 'failed' }) =>
    request<{ success: boolean; order: PaymentOrder; invoice?: Invoice; message: string }>('/finance/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getInvoices: () => request<{ success: boolean; count: number; invoices: Invoice[] }>('/finance/invoices'),
  requestRefund: (payload: { paymentOrderId: string; reason: string }) =>
    request<{ success: boolean; refund: Refund; message: string }>('/finance/refunds', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  approveRefund: (id: string, decision: 'approved' | 'rejected') =>
    request<{ success: boolean; refund: Refund; message: string }>(`/finance/refunds/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),

  // Admin Metrics & Users
  getAdminMetrics: () => request<{ success: boolean; metrics: any }>('/admin/metrics'),
  getAdminUsers: () => request<{ success: boolean; count: number; users: UserAccount[] }>('/admin/users'),
  updateUserStatus: (id: string, status: string) =>
    request<{ success: boolean; user: UserAccount; message: string }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getAuditEvents: () => request<{ success: boolean; count: number; events: any[] }>('/admin/audit-events'),

  // Market & AI Maps Grounding
  getMarketIndicators: () => request<{ success: boolean; indicators: MarketIndicator[] }>('/market-indicators'),
  getNeighborhoodInsights: (payload: { city: string; district: string; latitude?: number; longitude?: number }) =>
    request<{ success: boolean; insights: NeighborhoodInsight }>('/ai/neighborhood-insights', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
