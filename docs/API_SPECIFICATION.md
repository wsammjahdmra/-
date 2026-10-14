# مواصفات واجهات البرمجة (REST API SPECIFICATION)
**الإصدار:** v1 (`/api/v1/*`)  
**تنسيق البيانات:** JSON  
**الترميز:** UTF-8 مع رسائل خطأ عربية واضحة  

---

### 1. المصادقة والجلسات `Auth & Roles`
- `POST /api/v1/auth/login`: تسجيل الدخول بالبريد/الهاتف وكلمة المرور.
- `POST /api/v1/auth/register`: إنشاء حساب جديد مع التحقق الأولي.
- `GET /api/v1/auth/me`: جلب بيانات المستخدم الحالي وصلاحياته النشطة.
- `POST /api/v1/auth/switch-role`: تبديل دور المستخدم الحالي للأغراض التجريبية والتشغيلية الفورية.

### 2. الإعلانات والعقارات `Listings & Properties`
- `GET /api/v1/listings`: استعراض وبحث الإعلانات (يقبل الفلاتر: `city`, `district`, `purpose`, `property_type`, `min_price`, `max_price`, `min_area`, `max_area`, `rooms`, `sort_by`, `status`). للعامة تقتصر النتائج على `published`.
- `GET /api/v1/listings/:id`: تفاصيل إعلان محدد مع الصور وسجل التراخيص ومواصفات العقار.
- `POST /api/v1/listings`: إنشاء مسودة إعلان جديد (`draft`).
- `PUT /api/v1/listings/:id`: تعديل بيانات الإعلان (للمالك أو المفوض).
- `POST /api/v1/listings/:id/submit`: إرسال الإعلان للتحقق والمراجعة (`pending_verification`).
- `POST /api/v1/listings/:id/status`: تغيير حالة الإعلان بواسطة المشرفين (قبول، رفض، إيقاف، مع سبب).
- `POST /api/v1/listings/:id/media`: رفع وسائط وصور جديدة للإعلان.

### 3. المشاريع العقارية والوحدات `Projects & Units`
- `GET /api/v1/projects`: قائمة المشاريع السكنية والتجارية.
- `GET /api/v1/projects/:id`: تفاصيل المشروع والوحدات التابعة له.
- `GET /api/v1/projects/:id/units`: استعراض وحدات المشروع وأسعارها ومساحاتها وحالتها.

### 4. التفاعل والمفضلة `User Services`
- `GET /api/v1/favorites`: جلب إعلانات المستخدم المفضلة.
- `POST /api/v1/favorites/:listingId`: إضافة إعلان للمفضلة (مع منع التكرار).
- `DELETE /api/v1/favorites/:listingId`: إزالة إعلان من المفضلة.
- `GET /api/v1/saved-searches`: جلب استعلامات البحث المحفوظة.
- `POST /api/v1/saved-searches`: حفظ استعلام بحث جديد مع خيار التنبيهات.

### 5. البلاغات والتذاكر `Reports & Support`
- `POST /api/v1/reports`: تقديم بلاغ عن إعلان مخالف (مع توليد رقم مرجعي فريد وحماية ضد السبام).
- `GET /api/v1/admin/reports`: استعراض البلاغات للمشرفين لمعالجتها.
- `POST /api/v1/admin/reports/:id/resolve`: اتخاذ قرار في البلاغ وتوثيق الإجراء.
- `GET /api/v1/tickets`: جلب تذاكر الدعم الفني.
- `POST /api/v1/tickets`: إنشاء تذكرة دعم فني جديدة.

### 6. الخدمات المالية والترويج `Finance & Payments`
- `GET /api/v1/finance/packages`: استعراض باقات الترويج المتاحة وأسعارها.
- `POST /api/v1/finance/orders`: إنشاء أمر دفع مالي فريد مع `idempotency_key` واحتساب الضريبة 15%.
- `POST /api/v1/finance/webhook`: محاكاة استلام إشعار تأكيد الدفع من البوابة البنكية والتفعيل الذري للترويج.
- `GET /api/v1/finance/invoices`: استعراض فواتير المستخدم أو المنشأة الضريبية.
- `POST /api/v1/finance/refunds`: تقديم أو اعتماد طلب استرداد مالي وفق الضوابط.

### 7. المنشآت والمكاتب `Organizations`
- `GET /api/v1/organizations/my-org`: بيانات منشأة المستخدم الحالي وأعضائها.
- `POST /api/v1/organizations/invite`: دعوة وسيط جديد وتحديد دوره ونطاقه.
- `PUT /api/v1/organizations/members/:memberId`: تعديل حالة عضو المنشأة (تفعيل/تعطيل).

### 8. الإدارة والتشغيل والتدقيق `Admin & Operations`
- `GET /api/v1/admin/metrics`: إحصائيات تشغيلية حقيقية ومؤشرات النظام الحية.
- `GET /api/v1/admin/users`: استعراض المستخدمين وتعديل الصلاحيات أو تجميد الحسابات.
- `GET /api/v1/admin/audit-events`: سجل التدقيق الإداري المحمي.
- `GET /api/v1/admin/settings`: استرجاع إعدادات المنصة وهوية البراندينغ.
- `PUT /api/v1/admin/settings`: تحديث هوية المنصة (الاسم، الشعار، الألوان، الضرائب).

### 9. التحليلات وخرائط Google Maps `Maps Grounding & Insights`
- `GET /api/v1/market-indicators`: مؤشرات أسعار السوق العقاري حسب المدينة والحي.
- `POST /api/v1/ai/neighborhood-insights`: تحليل ذكي للحي والخدمات المجاورة عبر Gemini 3.8 Flash وGoogle Maps Grounding.
