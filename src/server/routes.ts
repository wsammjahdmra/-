/**
 * Comprehensive Express REST API Router
 * منصة عقار — الإصدار الرابع
 */

import { Router, Request, Response } from 'express';
import { db } from './db';
import { fetchNeighborhoodInsights } from './geminiMaps';
import {
  Listing,
  ListingStatus,
  Property,
  ReportCase,
  SupportTicket,
  PaymentOrder,
  Invoice,
  Refund,
  UserRole,
} from '../types/database';

export const apiRouter = Router();

// Current active session simulated state (default to System Admin so developer can test everything immediately, with easy one-click switcher)
let currentSessionUserId = 'usr_adm_1';

function getCurrentUser() {
  return db.users.get(currentSessionUserId) || db.users.get('usr_adm_1')!;
}

// -------------------------------------------------------------
// 1. Settings & Platform Branding (Dynamic customization)
// -------------------------------------------------------------
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json({ success: true, settings: db.settings });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'system_admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح: هذا الإجراء يتطلب صلاحية مدير النظام.' });
  }

  const { platformName, platformSubtitle, logoText, primaryColor, secondaryColor, vatRate, supportPhone, supportEmail, allowVisitorReports } = req.body;

  if (platformName) db.settings.platformName = platformName.trim();
  if (platformSubtitle) db.settings.platformSubtitle = platformSubtitle.trim();
  if (logoText) db.settings.logoText = logoText.trim();
  if (primaryColor) db.settings.primaryColor = primaryColor;
  if (secondaryColor) db.settings.secondaryColor = secondaryColor;
  if (typeof vatRate === 'number') db.settings.vatRate = vatRate;
  if (supportPhone) db.settings.supportPhone = supportPhone;
  if (supportEmail) db.settings.supportEmail = supportEmail;
  if (typeof allowVisitorReports === 'boolean') db.settings.allowVisitorReports = allowVisitorReports;

  db.recordAuditEvent({
    userId: user.id,
    userRole: user.role,
    userName: user.fullName,
    eventType: 'SETTINGS_UPDATED',
    entityName: 'settings',
    entityId: 'global',
    details: `تم تحديث هوية المنصة وإعدادات النظام: اسم المنصة الجديد: ${db.settings.platformName}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, settings: db.settings, message: 'تم حفظ إعدادات وهوية المنصة بنجاح.' });
});

// -------------------------------------------------------------
// 2. Authentication, Profile & Role Switcher
// -------------------------------------------------------------
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const org = user.orgId ? db.organizations.get(user.orgId) : undefined;
  res.json({ success: true, user, organization: org });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, phone } = req.body;
  let foundUser = Array.from(db.users.values()).find(
    (u) => (email && u.email.toLowerCase() === email.toLowerCase()) || (phone && u.phone === phone)
  );

  if (!foundUser) {
    // If not found, log in as registered user default
    foundUser = db.users.get('usr_reg_1');
  }

  if (foundUser) {
    currentSessionUserId = foundUser.id;
    return res.json({ success: true, user: foundUser, message: `مرحباً بك، ${foundUser.fullName}` });
  }

  res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة.' });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { fullName, phone, email, role = 'registered_user', falLicenseNumber } = req.body;

  if (!fullName || !phone || !email) {
    return res.status(400).json({ success: false, message: 'يرجى استكمال جميع الحقول الإلزامية (الاسم، الجوال، البريد).' });
  }

  const existing = Array.from(db.users.values()).find((u) => u.email === email || u.phone === phone);
  if (existing) {
    return res.status(409).json({ success: false, message: 'رقم الجوال أو البريد الإلكتروني مسجل مسبقاً.' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    phone,
    email,
    fullName,
    role: role as UserRole,
    status: 'active' as const,
    falLicenseNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.set(newUser.id, newUser);
  currentSessionUserId = newUser.id;

  db.recordAuditEvent({
    userId: newUser.id,
    userRole: newUser.role,
    userName: newUser.fullName,
    eventType: 'USER_REGISTERED',
    entityName: 'user',
    entityId: newUser.id,
    details: `تسجيل حساب جديد بالدور: ${newUser.role}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json({ success: true, user: newUser, message: 'تم إنشاء الحساب بنجاح.' });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role, userId } = req.body;

  if (userId && db.users.has(userId)) {
    currentSessionUserId = userId;
    const targetUser = db.users.get(userId)!;
    return res.json({ success: true, user: targetUser, message: `تم التبديل إلى المستخدم: ${targetUser.fullName} (${targetUser.role})` });
  }

  // Find a user with the requested role
  const matchedUser = Array.from(db.users.values()).find((u) => u.role === role);
  if (matchedUser) {
    currentSessionUserId = matchedUser.id;
    return res.json({ success: true, user: matchedUser, message: `تم تفعيل الدور: ${matchedUser.role} (${matchedUser.fullName})` });
  }

  // If role is visitor
  if (role === 'visitor') {
    return res.json({
      success: true,
      user: {
        id: 'usr_guest',
        fullName: 'زائر غير مسجل',
        role: 'visitor',
        status: 'active',
        phone: '',
        email: '',
        createdAt: '',
        updatedAt: '',
      },
      message: 'تم تفعيل وضع الزائر العام',
    });
  }

  res.status(404).json({ success: false, message: 'لم يتم العثور على مستخدم بالدور المطلوب.' });
});

// -------------------------------------------------------------
// 3. Listings & Properties (Public Search, Details, Create, Moderate)
// -------------------------------------------------------------
apiRouter.get('/listings', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const {
    city,
    district,
    purpose,
    propertyType,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    rooms,
    sortBy,
    status,
    ownerOnly,
    featuredOnly,
  } = req.query;

  let all = db.getAllListingsWithProperties();

  // If public or visitor, enforce status = 'published' only
  const isElevatedRole = ['content_moderator', 'compliance_officer', 'system_admin'].includes(user.role);

  if (ownerOnly === 'true') {
    all = all.filter((l) => l.ownerId === user.id || (user.orgId && l.orgId === user.orgId));
  } else if (!isElevatedRole) {
    all = all.filter((l) => l.status === 'published');
  }

  if (status && isElevatedRole) {
    all = all.filter((l) => l.status === status);
  }

  if (city) {
    all = all.filter((l) => l.property?.city.toLowerCase().includes(String(city).toLowerCase()));
  }

  if (district) {
    all = all.filter((l) => l.property?.district.toLowerCase().includes(String(district).toLowerCase()));
  }

  if (purpose) {
    all = all.filter((l) => l.purpose === purpose);
  }

  if (propertyType) {
    all = all.filter((l) => l.property?.propertyType === propertyType);
  }

  if (minPrice) {
    all = all.filter((l) => l.price >= Number(minPrice));
  }

  if (maxPrice) {
    all = all.filter((l) => l.price <= Number(maxPrice));
  }

  if (minArea) {
    all = all.filter((l) => (l.property?.totalAreaSqm || 0) >= Number(minArea));
  }

  if (maxArea) {
    all = all.filter((l) => (l.property?.totalAreaSqm || 0) <= Number(maxArea));
  }

  if (rooms) {
    all = all.filter((l) => l.roomsCount >= Number(rooms));
  }

  if (featuredOnly === 'true') {
    all = all.filter((l) => l.isFeatured);
  }

  // Sorting
  if (sortBy === 'price_asc') {
    all.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    all.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'views') {
    all.sort((a, b) => b.viewsCount - a.viewsCount);
  } else {
    // Default newest + featured on top
    all.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  res.json({
    success: true,
    count: all.length,
    listings: all,
  });
});

apiRouter.get('/listings/:id', (req: Request, res: Response) => {
  const listing = db.getListingWithProperty(req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: 'الإعلان غير موجود أو قد تم حذفه.' });
  }

  // Increment view counter safely
  listing.viewsCount = (listing.viewsCount || 0) + 1;

  // Fetch status history
  const history = db.listingHistory.filter((h) => h.listingId === listing.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Check if current user favorited this
  const user = getCurrentUser();
  const isFav = db.favorites.some((f) => f.userId === user.id && f.listingId === listing.id);

  res.json({
    success: true,
    listing,
    history,
    isFavorited: isFav,
  });
});

apiRouter.post('/listings', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (['visitor', 'registered_user'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح: يجب أن تكون معلناً فرداً أو وسيطاً عقارياً لنشر إعلان.' });
  }

  const {
    title,
    description,
    purpose,
    rentPeriod,
    price,
    roomsCount,
    bathroomsCount,
    city,
    district,
    propertyType,
    totalAreaSqm,
    deedNumber,
    adLicenseNumber,
    features = [],
    media = [],
    latitude,
    longitude,
    status = 'draft',
  } = req.body;

  if (!title || !price || !city || !district || !propertyType || !totalAreaSqm) {
    return res.status(400).json({ success: false, message: 'يرجى إكمال الحقول الأساسية للإعلان والعقار.' });
  }

  const propertyId = `prp_${Date.now()}`;
  const newProperty: Property = {
    id: propertyId,
    city,
    district,
    propertyType,
    totalAreaSqm: Number(totalAreaSqm),
    latitude: latitude || 24.7136,
    longitude: longitude || 46.6753,
    addressDescription: `${district}، ${city}`,
    deedNumber: deedNumber || `DEED-${Date.now().toString().slice(-6)}`,
  };
  db.properties.set(propertyId, newProperty);

  const listingId = `lst_${Date.now()}`;
  const initialStatus: ListingStatus = status === 'pending_verification' ? 'pending_verification' : 'draft';

  const newListing: Listing = {
    id: listingId,
    propertyId,
    property: newProperty,
    ownerId: user.id,
    ownerName: user.fullName,
    ownerPhone: user.phone,
    orgId: user.orgId,
    orgName: user.orgId ? db.organizations.get(user.orgId)?.name : undefined,
    title,
    description: description || '',
    purpose: purpose || 'sale',
    rentPeriod,
    price: Number(price),
    currency: 'SAR',
    roomsCount: Number(roomsCount) || 0,
    bathroomsCount: Number(bathroomsCount) || 0,
    features: Array.isArray(features) ? features : [],
    adLicenseNumber: adLicenseNumber || (user.falLicenseNumber ? `71000${Math.floor(10000 + Math.random() * 90000)}` : ''),
    licenseVerificationStatus: adLicenseNumber ? 'pending' : 'not_requested',
    status: initialStatus,
    isFeatured: false,
    viewsCount: 0,
    favoritesCount: 0,
    media: media.length > 0 ? media : [
      {
        id: `med_${Date.now()}`,
        listingId,
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        isPrimary: true,
        title: 'صورة العقار',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.listings.set(listingId, newListing);

  // History entry
  db.listingHistory.push({
    id: `his_${Date.now()}`,
    listingId,
    fromStatus: 'draft',
    toStatus: initialStatus,
    reason: initialStatus === 'pending_verification' ? 'تم تقديم الإعلان للمراجعة والتحقق من رخصة فال' : 'حفظ كمسودة',
    changedByUserId: user.id,
    changedByName: user.fullName,
    createdAt: new Date().toISOString(),
  });

  db.recordAuditEvent({
    userId: user.id,
    userRole: user.role,
    userName: user.fullName,
    eventType: 'LISTING_CREATED',
    entityName: 'listing',
    entityId: listingId,
    details: `إنشاء إعلان جديد (${title}) بحالة: ${initialStatus}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json({
    success: true,
    listing: { ...newListing, property: newProperty },
    message: initialStatus === 'pending_verification' ? 'تم إرسال الإعلان للمراجعة والتحقق بنجاح.' : 'تم حفظ مسودة الإعلان بنجاح.',
  });
});

apiRouter.post('/listings/:id/submit', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const listing = db.listings.get(req.params.id);

  if (!listing) return res.status(404).json({ success: false, message: 'الإعلان غير موجود.' });
  if (listing.ownerId !== user.id && user.role !== 'system_admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح: لا تملك حق إرسال هذا الإعلان.' });
  }

  const prevStatus = listing.status;
  listing.status = 'pending_verification';
  listing.licenseVerificationStatus = 'pending';
  listing.updatedAt = new Date().toISOString();

  db.listingHistory.push({
    id: `his_${Date.now()}`,
    listingId: listing.id,
    fromStatus: prevStatus,
    toStatus: 'pending_verification',
    reason: 'تقديم الإعلان للفحص النظامي والتحقق من الهيئة العامة للعقار',
    changedByUserId: user.id,
    changedByName: user.fullName,
    createdAt: new Date().toISOString(),
  });

  db.recordAuditEvent({
    userId: user.id,
    userRole: user.role,
    userName: user.fullName,
    eventType: 'LISTING_SUBMITTED_FOR_REVIEW',
    entityName: 'listing',
    entityId: listing.id,
    details: 'إرسال الإعلان للفحص النظامي',
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, listing: db.getListingWithProperty(listing.id), message: 'تم إرسال الإعلان إلى قائمة انتظار المراجعة والتحقق.' });
});

apiRouter.post('/listings/:id/status', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const allowedModerators = ['content_moderator', 'compliance_officer', 'system_admin'];

  if (!allowedModerators.includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح: هذه العملية محصورة بمشرفي المحتوى والامتثال.' });
  }

  const { toStatus, reason } = req.body;
  const listing = db.listings.get(req.params.id);

  if (!listing) return res.status(404).json({ success: false, message: 'الإعلان غير موجود.' });

  // Mandatory reason for rejection, suspension, or completion request
  if (['rejected', 'suspended', 'needs_completion'].includes(toStatus) && (!reason || reason.trim().length < 5)) {
    return res.status(400).json({ success: false, message: 'يجب تدوين سبب واضح ومعتمد لاتخاذ هذا الإجراء وفق اللائحة.' });
  }

  const fromStatus = listing.status;
  listing.status = toStatus as ListingStatus;
  listing.updatedAt = new Date().toISOString();

  if (toStatus === 'published' || toStatus === 'approved_for_publish') {
    listing.licenseVerificationStatus = 'verified';
    if (!listing.publishedAt) listing.publishedAt = new Date().toISOString();
  }

  db.listingHistory.push({
    id: `his_${Date.now()}`,
    listingId: listing.id,
    fromStatus,
    toStatus,
    reason: reason || 'تحديث إداري معتمد',
    changedByUserId: user.id,
    changedByName: user.fullName,
    createdAt: new Date().toISOString(),
  });

  db.recordAuditEvent({
    userId: user.id,
    userRole: user.role,
    userName: user.fullName,
    eventType: `LISTING_STATUS_${toStatus.toUpperCase()}`,
    entityName: 'listing',
    entityId: listing.id,
    details: `تغيير حالة الإعلان من ${fromStatus} إلى ${toStatus}. السبب: ${reason || 'موافقة نظامية'}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({
    success: true,
    listing: db.getListingWithProperty(listing.id),
    message: `تم تحديث حالة الإعلان بنجاح إلى: ${toStatus}`,
  });
});

apiRouter.post('/listings/:id/toggle-favorite', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role === 'visitor') {
    return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول لإضافة الإعلان إلى المفضلة.' });
  }

  const listing = db.listings.get(req.params.id);
  if (!listing) return res.status(404).json({ success: false, message: 'الإعلان غير موجود.' });

  const existingIdx = db.favorites.findIndex((f) => f.userId === user.id && f.listingId === listing.id);
  let favorited = false;

  if (existingIdx >= 0) {
    db.favorites.splice(existingIdx, 1);
    listing.favoritesCount = Math.max(0, (listing.favoritesCount || 1) - 1);
    favorited = false;
  } else {
    db.favorites.push({
      id: `fav_${Date.now()}`,
      userId: user.id,
      listingId: listing.id,
      createdAt: new Date().toISOString(),
    });
    listing.favoritesCount = (listing.favoritesCount || 0) + 1;
    favorited = true;
  }

  res.json({ success: true, isFavorited: favorited, favoritesCount: listing.favoritesCount });
});

// -------------------------------------------------------------
// 4. Projects & Units
// -------------------------------------------------------------
apiRouter.get('/projects', (req: Request, res: Response) => {
  const projects = Array.from(db.projects.values()).map((p) => {
    const units = Array.from(db.projectUnits.values()).filter((u) => u.projectId === p.id);
    return { ...p, units };
  });
  res.json({ success: true, count: projects.length, projects });
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'المشروع غير موجود.' });

  const units = Array.from(db.projectUnits.values()).filter((u) => u.projectId === project.id);
  res.json({ success: true, project: { ...project, units } });
});

// -------------------------------------------------------------
// 5. User Services: Favorites & Saved Searches
// -------------------------------------------------------------
apiRouter.get('/favorites', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const userFavIds = db.favorites.filter((f) => f.userId === user.id).map((f) => f.listingId);
  const listings = userFavIds.map((id) => db.getListingWithProperty(id)).filter(Boolean);
  res.json({ success: true, listings });
});

apiRouter.get('/saved-searches', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const list = db.savedSearches.filter((s) => s.userId === user.id);
  res.json({ success: true, savedSearches: list });
});

apiRouter.post('/saved-searches', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const { title, criteria, notifyEnabled = true } = req.body;

  const item = {
    id: `sch_${Date.now()}`,
    userId: user.id,
    title: title || 'بحث محفوظ جديد',
    criteria: criteria || {},
    notifyEnabled: Boolean(notifyEnabled),
    createdAt: new Date().toISOString(),
  };

  db.savedSearches.push(item);
  res.status(201).json({ success: true, savedSearch: item, message: 'تم حفظ معايير البحث وتفعيل التنبيهات.' });
});

// -------------------------------------------------------------
// 6. Reports & Support Tickets
// -------------------------------------------------------------
apiRouter.post('/reports', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const { listingId, reasonType, description, reporterContact } = req.body;

  if (!listingId || !reasonType || !description) {
    return res.status(400).json({ success: false, message: 'يرجى تقديم سبب البلاغ وشرح المخالفة.' });
  }

  const listing = db.listings.get(listingId);
  if (!listing) return res.status(404).json({ success: false, message: 'الإعلان المبلغ عنه غير موجود.' });

  const refNo = `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const report: ReportCase = {
    id: `rep_${Date.now()}`,
    referenceNo: refNo,
    listingId,
    listingTitle: listing.title,
    reporterUserId: user.role !== 'visitor' ? user.id : undefined,
    reporterContact: reporterContact || user.phone || 'زائر مجهول',
    reasonType,
    description,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  db.reports.set(report.id, report);

  db.recordAuditEvent({
    userId: user.role !== 'visitor' ? user.id : undefined,
    userRole: user.role,
    userName: user.fullName,
    eventType: 'REPORT_SUBMITTED',
    entityName: 'report',
    entityId: report.id,
    details: `تقديم بلاغ برقم مرجعي: ${refNo} على الإعلان: ${listing.title}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json({
    success: true,
    referenceNo: refNo,
    message: `تم استلام بلاغك بنجاح برقم مرجعي (${refNo})، وسيتم فحصه فوراً من قبل فريق الرقابة.`,
  });
});

apiRouter.get('/admin/reports', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (!['content_moderator', 'compliance_officer', 'support_officer', 'system_admin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح: هذا القسم للإشراف فقط.' });
  }

  const reports = Array.from(db.reports.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ success: true, count: reports.length, reports });
});

apiRouter.post('/admin/reports/:id/resolve', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (!['content_moderator', 'compliance_officer', 'system_admin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح.' });
  }

  const report = db.reports.get(req.params.id);
  if (!report) return res.status(404).json({ success: false, message: 'البلاغ غير موجود.' });

  const { status, resolutionNote, suspendListing } = req.body;
  report.status = status;
  report.resolutionNote = resolutionNote;
  report.resolvedBy = user.fullName;
  report.resolvedAt = new Date().toISOString();

  if (suspendListing && db.listings.has(report.listingId)) {
    const l = db.listings.get(report.listingId)!;
    l.status = 'suspended';
    db.listingHistory.push({
      id: `his_${Date.now()}`,
      listingId: l.id,
      fromStatus: l.status,
      toStatus: 'suspended',
      reason: `إيقاف الإعلان بناءً على البلاغ رقم: ${report.referenceNo} - ${resolutionNote}`,
      changedByUserId: user.id,
      changedByName: user.fullName,
      createdAt: new Date().toISOString(),
    });
  }

  db.recordAuditEvent({
    userId: user.id,
    userRole: user.role,
    userName: user.fullName,
    eventType: 'REPORT_RESOLVED',
    entityName: 'report',
    entityId: report.id,
    details: `معالجة البلاغ (${report.referenceNo}) بحالة: ${status}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, report, message: 'تم حفظ إجراء معالجة البلاغ بنجاح.' });
});

apiRouter.get('/tickets', (req: Request, res: Response) => {
  const user = getCurrentUser();
  let list = Array.from(db.tickets.values());
  if (!['support_officer', 'system_admin'].includes(user.role)) {
    list = list.filter((t) => t.userId === user.id);
  }
  res.json({ success: true, tickets: list });
});

apiRouter.post('/tickets', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const { subject, message, priority = 'medium' } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'يرجى كتابة موضوع التذكرة ومحتواها.' });
  }

  const ticketNumber = `TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticket: SupportTicket = {
    id: `tkt_${Date.now()}`,
    ticketNumber,
    userId: user.id,
    userName: user.fullName,
    subject,
    priority,
    status: 'open',
    messages: [
      {
        id: `msg_${Date.now()}`,
        senderId: user.id,
        senderName: user.fullName,
        text: message,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tickets.set(ticket.id, ticket);
  res.status(201).json({ success: true, ticket, message: `تم فتح التذكرة برقم (${ticketNumber}).` });
});

// -------------------------------------------------------------
// 7. Organizations & Memberships (Office Management)
// -------------------------------------------------------------
apiRouter.get('/organizations/my-org', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (!user.orgId) {
    return res.json({ success: true, organization: null, members: [], listings: [] });
  }

  const org = db.organizations.get(user.orgId);
  const members = Array.from(db.orgMemberships.values()).filter((m) => m.orgId === user.orgId);
  const orgListings = db.getAllListingsWithProperties().filter((l) => l.orgId === user.orgId);

  res.json({ success: true, organization: org, members, listings: orgListings });
});

apiRouter.post('/organizations/invite', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'org_manager' && user.role !== 'system_admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح: دعوة الأعضاء مقتصرة على مدير المنشأة العقارية.' });
  }

  const { userName, userPhone, roleInOrg = 'broker', scopeLimitations = 'كافة مناطق المدينة' } = req.body;
  if (!userName || !userPhone) {
    return res.status(400).json({ success: false, message: 'يرجى تقديم اسم ورقم جوال الوسيط المراد دعوته.' });
  }

  const orgId = user.orgId || 'org_arkan_1';
  const membershipId = `mem_${Date.now()}`;
  const membership = {
    id: membershipId,
    orgId,
    userId: `usr_invited_${Date.now().toString().slice(-4)}`,
    userName,
    userPhone,
    roleInOrg,
    invitationStatus: 'pending' as const,
    scopeLimitations,
    invitedAt: new Date().toISOString(),
  };

  db.orgMemberships.set(membershipId, membership);

  db.recordAuditEvent({
    userId: user.id,
    userRole: user.role,
    userName: user.fullName,
    eventType: 'ORG_MEMBER_INVITED',
    entityName: 'organization',
    entityId: orgId,
    details: `إرسال دعوة انضمام للوسيط (${userName}) بالنطاق: ${scopeLimitations}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json({ success: true, membership, message: `تم إرسال دعوة الانضمام للوسيط (${userName}) بنجاح.` });
});

apiRouter.put('/organizations/members/:id', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'org_manager' && user.role !== 'system_admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح.' });
  }

  const mem = db.orgMemberships.get(req.params.id);
  if (!mem) return res.status(404).json({ success: false, message: 'عضوية الوسيط غير موجودة.' });

  const { status, roleInOrg, scopeLimitations } = req.body;
  if (status) mem.invitationStatus = status;
  if (roleInOrg) mem.roleInOrg = roleInOrg;
  if (scopeLimitations) mem.scopeLimitations = scopeLimitations;

  res.json({ success: true, membership: mem, message: 'تم تحديث بيانات العضوية بنجاح.' });
});

// -------------------------------------------------------------
// 8. Financial Services, Promotion, Invoicing, Refunds
// -------------------------------------------------------------
apiRouter.get('/finance/packages', (req: Request, res: Response) => {
  res.json({ success: true, packages: db.promotionPackages, vatRate: db.settings.vatRate });
});

apiRouter.post('/finance/orders', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const { listingId, packageId, paymentMethod = 'mada', idempotencyKey } = req.body;

  if (!listingId || !packageId) {
    return res.status(400).json({ success: false, message: 'يرجى تحديد الإعلان وباقة الترويج المطلوبة.' });
  }

  const pkg = db.promotionPackages.find((p) => p.id === packageId);
  if (!pkg) return res.status(404).json({ success: false, message: 'الباقة المحددة غير صالحة.' });

  const listing = db.listings.get(listingId);
  if (!listing) return res.status(404).json({ success: false, message: 'الإعلان المطلوب ترويجه غير موجود.' });

  // Idempotency check: if key already exists, return previous order instead of duplicate
  const safeIdempotencyKey = idempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const existingOrder = Array.from(db.paymentOrders.values()).find((o) => o.idempotencyKey === safeIdempotencyKey);
  if (existingOrder) {
    return res.json({ success: true, order: existingOrder, reused: true });
  }

  // Server-side calculation of VAT and total
  const baseAmount = pkg.basePrice;
  const taxAmount = Number((baseAmount * db.settings.vatRate).toFixed(2));
  const totalAmount = Number((baseAmount + taxAmount).toFixed(2));

  const orderId = `ord_${Date.now()}`;
  const order: PaymentOrder = {
    id: orderId,
    idempotencyKey: safeIdempotencyKey,
    userId: user.id,
    userName: user.fullName,
    listingId,
    listingTitle: listing.title,
    packageId: pkg.id,
    packageName: pkg.name,
    amount: baseAmount,
    taxAmount,
    totalAmount,
    currency: 'SAR',
    paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.paymentOrders.set(orderId, order);

  res.status(201).json({ success: true, order, message: 'تم إنشاء أمر الدفع المالي بنجاح.' });
});

apiRouter.post('/finance/webhook', (req: Request, res: Response) => {
  const { orderId, paymentGatewayRef, status = 'paid' } = req.body;
  const order = db.paymentOrders.get(orderId);

  if (!order) return res.status(404).json({ success: false, message: 'أمر الدفع غير موجود.' });

  // Atomic state change
  if (order.status === 'paid') {
    return res.json({ success: true, order, message: 'تم معالجة هذا الدفع مسبقاً (ممنوع التكرار).' });
  }

  order.status = status;
  order.paidAt = new Date().toISOString();
  order.paymentGatewayRef = paymentGatewayRef || `GATEWAY-${Date.now().toString().slice(-6)}`;

  let invoice: Invoice | undefined;

  if (status === 'paid') {
    // 1. Activate Featured status on listing
    if (order.listingId && db.listings.has(order.listingId)) {
      const listing = db.listings.get(order.listingId)!;
      listing.isFeatured = true;
      const days = order.packageId === 'pkg_star' ? 30 : order.packageId === 'pkg_pro' ? 14 : 7;
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + days);
      listing.featuredExpiresAt = expireDate.toISOString();
    }

    // 2. Generate ZATCA compliant e-invoice
    const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: invNumber,
      paymentOrderId: order.id,
      userId: order.userId,
      customerName: order.userName,
      subtotal: order.amount,
      taxAmount: order.taxAmount,
      total: order.totalAmount,
      currency: 'SAR',
      zatcaStatus: 'compliant',
      items: [
        {
          description: `${order.packageName} للإعلان: ${order.listingTitle || ''}`,
          quantity: 1,
          unitPrice: order.amount,
          total: order.amount,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    db.invoices.set(invoice.id, invoice);

    db.recordAuditEvent({
      userId: order.userId,
      userName: order.userName,
      eventType: 'PAYMENT_CONFIRMED',
      entityName: 'payment_order',
      entityId: order.id,
      details: `تم تأكيد سداد مبلغ ${order.totalAmount} ر.س وإصدار الفاتورة الضريبية رقم ${invNumber} وتفعيل الترويج المميز`,
      ipAddress: req.ip || '127.0.0.1',
    });
  }

  res.json({
    success: true,
    order,
    invoice,
    message: status === 'paid' ? 'تم تأكيد الدفع بنجاح وتفعيل باقة الترويج وإصدار الفاتورة الضريبية.' : 'فشلت عملية الدفع البنكي.',
  });
});

apiRouter.get('/finance/invoices', (req: Request, res: Response) => {
  const user = getCurrentUser();
  let list = Array.from(db.invoices.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!['financial_officer', 'system_admin'].includes(user.role)) {
    list = list.filter((i) => i.userId === user.id);
  }

  res.json({ success: true, count: list.length, invoices: list });
});

apiRouter.post('/finance/refunds', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const { paymentOrderId, reason } = req.body;

  const order = db.paymentOrders.get(paymentOrderId);
  if (!order) return res.status(404).json({ success: false, message: 'أمر الدفع غير موجود.' });

  if (order.status !== 'paid') {
    return res.status(400).json({ success: false, message: 'لا يمكن طلب استرداد لعملية دفع غير مكتملة.' });
  }

  const refundId = `ref_${Date.now()}`;
  const refund: Refund = {
    id: refundId,
    paymentOrderId,
    invoiceNumber: Array.from(db.invoices.values()).find((i) => i.paymentOrderId === paymentOrderId)?.invoiceNumber || 'INV-REF',
    refundAmount: order.totalAmount,
    reason: reason || 'طلب إلغاء الباقة قبل الاستفادة',
    status: 'requested',
    requestedBy: user.fullName,
    requestedAt: new Date().toISOString(),
  };

  db.refunds.set(refundId, refund);

  db.recordAuditEvent({
    userId: user.id,
    userName: user.fullName,
    eventType: 'REFUND_REQUESTED',
    entityName: 'refund',
    entityId: refundId,
    details: `طلب استرداد مبلغ ${order.totalAmount} ر.س للعملية ${order.id}. السبب: ${reason}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json({ success: true, refund, message: 'تم رفع طلب الاسترداد المالي للمراجعة والاعتماد.' });
});

apiRouter.post('/finance/refunds/:id/approve', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'financial_officer' && user.role !== 'system_admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح: اعتماد الاسترداد المالي محصور بالمسؤول المالي.' });
  }

  const refund = db.refunds.get(req.params.id);
  if (!refund) return res.status(404).json({ success: false, message: 'طلب الاسترداد غير موجود.' });

  const { decision = 'approved' } = req.body; // approved or rejected
  refund.status = decision === 'approved' ? 'completed' : 'rejected';
  refund.approvedBy = user.fullName;
  refund.processedAt = new Date().toISOString();

  if (decision === 'approved') {
    const order = db.paymentOrders.get(refund.paymentOrderId);
    if (order) order.status = 'refunded';
  }

  db.recordAuditEvent({
    userId: user.id,
    userRole: user.role,
    userName: user.fullName,
    eventType: `REFUND_${decision.toUpperCase()}`,
    entityName: 'refund',
    entityId: refund.id,
    details: `قرار المسؤول المالي بشأن الاسترداد: ${decision}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, refund, message: `تم تحديث حالة طلب الاسترداد إلى: ${refund.status}` });
});

// -------------------------------------------------------------
// 9. Admin Operations & Live Metrics
// -------------------------------------------------------------
apiRouter.get('/admin/metrics', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (!['system_admin', 'content_moderator', 'compliance_officer', 'financial_officer', 'support_officer'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح.' });
  }

  const allListings = Array.from(db.listings.values());
  const listingsByStatus: Record<string, number> = {
    published: 0,
    pending_verification: 0,
    draft: 0,
    needs_completion: 0,
    suspended: 0,
    rejected: 0,
  };

  allListings.forEach((l) => {
    listingsByStatus[l.status] = (listingsByStatus[l.status] || 0) + 1;
  });

  const allPayments = Array.from(db.paymentOrders.values());
  const totalPaidRevenue = allPayments
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const openReports = Array.from(db.reports.values()).filter((r) => r.status !== 'closed').length;
  const openTickets = Array.from(db.tickets.values()).filter((t) => t.status !== 'closed').length;

  res.json({
    success: true,
    metrics: {
      totalListings: allListings.length,
      publishedListings: listingsByStatus.published || 0,
      pendingReviews: listingsByStatus.pending_verification || 0,
      suspendedListings: listingsByStatus.suspended || 0,
      totalUsers: db.users.size,
      totalOrganizations: db.organizations.size,
      totalPaidRevenue: Number(totalPaidRevenue.toFixed(2)),
      currency: 'SAR',
      openReports,
      openTickets,
      listingsByStatus,
      lastUpdated: new Date().toISOString(),
    },
  });
});

apiRouter.get('/admin/users', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'system_admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح: هذا القسم لمدير النظام فقط.' });
  }

  const usersList = Array.from(db.users.values());
  res.json({ success: true, count: usersList.length, users: usersList });
});

apiRouter.put('/admin/users/:id/status', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'system_admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح.' });
  }

  const target = db.users.get(req.params.id);
  if (!target) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });

  const { status } = req.body;
  target.status = status;
  target.updatedAt = new Date().toISOString();

  db.recordAuditEvent({
    userId: user.id,
    userRole: user.role,
    userName: user.fullName,
    eventType: 'USER_STATUS_CHANGED',
    entityName: 'user',
    entityId: target.id,
    details: `تعديل حالة حساب المستخدم (${target.fullName}) إلى: ${status}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, user: target, message: `تم تحديث حالة حساب المستخدم إلى: ${status}` });
});

apiRouter.get('/admin/audit-events', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'system_admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح.' });
  }

  res.json({ success: true, count: db.auditEvents.length, events: db.auditEvents });
});

// -------------------------------------------------------------
// 10. Market Indicators & Gemini Maps Grounding Insights
// -------------------------------------------------------------
apiRouter.get('/market-indicators', (req: Request, res: Response) => {
  res.json({ success: true, indicators: db.marketIndicators });
});

apiRouter.post('/ai/neighborhood-insights', async (req: Request, res: Response) => {
  const { city = 'الرياض', district = 'الملقا', latitude, longitude } = req.body;

  try {
    const insights = await fetchNeighborhoodInsights(city, district, latitude, longitude);
    res.json({ success: true, insights });
  } catch (error) {
    console.error('Error generating neighborhood insights:', error);
    res.status(500).json({ success: false, message: 'تعذر جلب تحليل الحي في الوقت الراهن.' });
  }
});
