# قاموس قاعدة البيانات (DATABASE DICTIONARY)
**إصدار المخطط:** 4.0  
**وحدة العملة المعتمدة:** SAR (ريال سعودي)  
**التوقيت القياسي:** UTC مع تمثيل بتوقيت المملكة العربية السعودية (+03:00)  

---

### 1. جدول الحسابات `USER_ACCOUNT`
- `id` (VARCHAR(36), PK): المعرف الفريد للمستخدم.
- `phone` (VARCHAR(20), UNIQUE): رقم الجوال الموثق بالرمز الدولي.
- `email` (VARCHAR(120), UNIQUE): البريد الإلكتروني.
- `password_hash` (VARCHAR(255)): تجزئة كلمة المرور الآمنة.
- `full_name` (VARCHAR(150)): الاسم الرباعي الرسمي.
- `role` (VARCHAR(50)): الدور الأساسي (`visitor`, `registered_user`, `individual_advertiser`, `org_manager`, `authorized_broker`, `content_moderator`, `compliance_officer`, `support_officer`, `financial_officer`, `system_admin`).
- `status` (VARCHAR(30)): حالة الحساب (`active`, `suspended`, `pending_verification`).
- `created_at` (TIMESTAMP): تاريخ إنشاء الحساب.
- `updated_at` (TIMESTAMP): تاريخ آخر تعديل.

### 2. جدول التحقق من الهوية `USER_IDENTITY_CHECK`
- `id` (VARCHAR(36), PK): معرف سجل التحقق.
- `user_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): معرف المستخدم.
- `national_id_hash` (VARCHAR(64)): تجزئة الهوية الوطنية لحماية الخصوصية.
- `fal_license_number` (VARCHAR(50)): رقم رخصة فال العقارية.
- `verification_status` (VARCHAR(30)): (`verified`, `pending`, `failed`).
- `verified_at` (TIMESTAMP): تاريخ إتمام التحقق.
- `provider_ref` (VARCHAR(100)): المرجع لدى مزود التحقق الخارجي.

### 3. جدول المنشآت والمكاتب العقارية `ORGANIZATION`
- `id` (VARCHAR(36), PK): معرف المنشأة.
- `name` (VARCHAR(200)): اسم المكتب أو المنشأة العقارية.
- `commercial_record` (VARCHAR(50), UNIQUE): السجل التجاري.
- `fal_org_license` (VARCHAR(50)): رخصة فال للمنشآت.
- `manager_user_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): مدير المنشأة.
- `status` (VARCHAR(30)): (`active`, `pending_verification`, `suspended`).
- `logo_url` (VARCHAR(500)): رابط شعار المنشأة.
- `created_at` (TIMESTAMP): تاريخ التأسيس على المنصة.

### 4. جدول عضويات المنشأة `ORG_MEMBERSHIP`
- `id` (VARCHAR(36), PK): معرف العضوية.
- `org_id` (VARCHAR(36), FK -> ORGANIZATION.id): معرف المنشأة.
- `user_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): معرف المستخدم الوسيط.
- `role_in_org` (VARCHAR(50)): (`manager`, `broker`, `agent`).
- `invitation_status` (VARCHAR(30)): (`pending`, `accepted`, `rejected`, `revoked`).
- `scope_limitations` (TEXT): نطاق الصلاحية والتفويض داخل المنشأة.
- `created_at` (TIMESTAMP): تاريخ الدعوة.

### 5. جدول العقار المادي `PROPERTY`
- `id` (VARCHAR(36), PK): معرف العقار الفعلي.
- `city` (VARCHAR(100)): المدينة (الرياض، جدة، مكة، الدمام، إلخ).
- `district` (VARCHAR(100)): اسم الحي.
- `property_type` (VARCHAR(50)): (`apartment`, `villa`, `land`, `building`, `office`, `floor`, `warehouse`).
- `total_area_sqm` (DECIMAL(10,2)): المساحة الإجمالية بالمتر المربع.
- `latitude` (DECIMAL(10,7)): خط العرض.
- `longitude` (DECIMAL(10,7)): خط الطول.
- `address_description` (TEXT): الوصف المكاني للعنوان.
- `deed_number` (VARCHAR(50)): رقم الصك العقاري الموثق.

### 6. جدول الإعلانات التسويقية `LISTING`
- `id` (VARCHAR(36), PK): معرف الإعلان.
- `property_id` (VARCHAR(36), FK -> PROPERTY.id): العقار المرتبط.
- `owner_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): صاحب الإعلان.
- `org_id` (VARCHAR(36), NULL, FK -> ORGANIZATION.id): المنشأة المسوقة (إن وجدت).
- `title` (VARCHAR(250)): عنوان الإعلان الجذاب والواضح.
- `description` (TEXT): الوصف التفصيلي لمواصفات العقار.
- `purpose` (VARCHAR(20)): الغرض (`sale`, `rent`).
- `rent_period` (VARCHAR(20), NULL): دورية الإيجار (`monthly`, `yearly`, `daily`).
- `price` (DECIMAL(14,2)): السعر المطلوب (أكبر من 0).
- `currency` (VARCHAR(10)): `SAR`.
- `rooms_count` (INT): عدد الغرف.
- `bathrooms_count` (INT): عدد دورات المياه.
- `floor_number` (INT): رقم الطابق.
- `building_age_years` (INT): عمر العقار بالسنوات.
- `facade` (VARCHAR(50)): الواجهة (شمالية، جنوبية، إلخ).
- `street_width_m` (DECIMAL(6,2)): عرض الشارع بالمتر.
- `features` (TEXT): المزايا والمرافق (مصعد، موقف سيارات، تكييف، إلخ).
- `ad_license_number` (VARCHAR(60)): رقم ترخيص الإعلان العقاري (الهيئة العامة للعقار).
- `status` (VARCHAR(30)): حالة الإعلان (`draft`, `pending_verification`, `needs_completion`, `approved_for_publish`, `published`, `suspended`, `expired`, `rejected`, `cancelled`).
- `is_featured` (BOOLEAN): إعلان مميز (ترويج نشط).
- `featured_expires_at` (TIMESTAMP, NULL): تاريخ انتهاء الترويج المميز.
- `views_count` (INT): إجمالي المشاهدات الحقيقية.
- `favorites_count` (INT): عدد مرات الإضافة للمفضلة.
- `published_at` (TIMESTAMP, NULL): تاريخ النشر الفعلي.
- `expires_at` (TIMESTAMP, NULL): تاريخ انتهاء صلاحية النشر (60 يوماً افتراضياً).
- `created_at` (TIMESTAMP): تاريخ إنشاء المسودة.
- `updated_at` (TIMESTAMP): تاريخ التحديث.

### 7. جدول وسائط الإعلان `LISTING_MEDIA`
- `id` (VARCHAR(36), PK): معرف الوسيط.
- `listing_id` (VARCHAR(36), FK -> LISTING.id): الإعلان التابع له.
- `media_type` (VARCHAR(20)): (`image`, `video`, `plan`, `virtual_tour`).
- `url` (VARCHAR(500)): رابط الملف المحمي أو المعروض.
- `is_primary` (BOOLEAN): الصورة الرئيسية للبطاقة.
- `sort_order` (INT): ترتيب الظهور في المعرض.
- `created_at` (TIMESTAMP): وقت الرفع.

### 8. جدول السجل التاريخي لحالات الإعلان `LISTING_STATUS_HISTORY`
- `id` (VARCHAR(36), PK): معرف السجل.
- `listing_id` (VARCHAR(36), FK -> LISTING.id): معرف الإعلان.
- `from_status` (VARCHAR(30)): الحالة السابقة.
- `to_status` (VARCHAR(30)): الحالة الجديدة.
- `reason` (TEXT): سبب التغيير (إلزامي للرفض أو الإيقاف أو طلب الاستكمال).
- `changed_by_user_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): من نفذ التغيير.
- `created_at` (TIMESTAMP): التوقيت الدقيق للانتقال.

### 9. جدول المشاريع العقارية `PROJECT`
- `id` (VARCHAR(36), PK): معرف المشروع.
- `developer_name` (VARCHAR(150)): اسم المطور العقاري.
- `name` (VARCHAR(200)): اسم المشروع.
- `city` (VARCHAR(100)): المدينة.
- `district` (VARCHAR(100)): الحي.
- `description` (TEXT): تفاصيل المشروع وخدماته.
- `status` (VARCHAR(30)): (`under_construction`, `ready`, `off_plan`).
- `units_total` (INT): إجمالي الوحدات في المشروع.
- `price_starts_from` (DECIMAL(14,2)): يبدأ السعر من.
- `image_url` (VARCHAR(500)): صورة واجهة المشروع.
- `handover_date` (VARCHAR(50)): تاريخ التسليم المتوقع.

### 10. جدول وحدات المشاريع `UNIT`
- `id` (VARCHAR(36), PK): معرف الوحدة.
- `project_id` (VARCHAR(36), FK -> PROJECT.id): المشروع التابعة له.
- `unit_number` (VARCHAR(50)): رقم أو رمز الوحدة.
- `unit_type` (VARCHAR(50)): نوع الوحدة (شقة، فيلا، تاون هاوس، دوبلكس).
- `area_sqm` (DECIMAL(10,2)): المساحة.
- `rooms` (INT): عدد الغرف.
- `price` (DECIMAL(14,2)): سعر الوحدة.
- `status` (VARCHAR(30)): (`available`, `reserved`, `sold`).

### 11. جدول المفضلة `FAVORITE`
- `id` (VARCHAR(36), PK): معرف السجل.
- `user_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): المستخدم.
- `listing_id` (VARCHAR(36), FK -> LISTING.id): الإعلان.
- **قيد فريد:** `UNIQUE(user_id, listing_id)`.
- `created_at` (TIMESTAMP): وقت الإضافة.

### 12. جدول عمليات البحث المحفوظة `SAVED_SEARCH`
- `id` (VARCHAR(36), PK): معرف البحث المحفوظ.
- `user_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): المستخدم.
- `title` (VARCHAR(150)): عنوان التسمية المخصص من المستخدم.
- `criteria_json` (TEXT): معايير البحث (المدينة، الحي، السعر، الغرض).
- `notify_enabled` (BOOLEAN): تفعيل الإشعارات الفورية عند نزول عقار مطابق.
- `created_at` (TIMESTAMP): تاريخ الحفظ.

### 13. جدول البلاغات `REPORT_CASE`
- `id` (VARCHAR(36), PK): معرف البلاغ.
- `reference_no` (VARCHAR(50), UNIQUE): الرقم المرجعي المتاح للمبلّغ للمتابعة.
- `listing_id` (VARCHAR(36), FK -> LISTING.id): الإعلان المبلغ عنه.
- `reporter_user_id` (VARCHAR(36), NULL, FK -> USER_ACCOUNT.id): المبلّغ.
- `reason_type` (VARCHAR(50)): نوع المخالفة (`fake_ad`, `wrong_price`, `unlicensed`, `duplicate_ad`, `inappropriate_content`).
- `description` (TEXT): تفاصيل البلاغ والقرائن.
- `status` (VARCHAR(30)): (`new`, `under_investigation`, `escalated`, `closed`).
- `resolution_note` (TEXT): قرار معالجة البلاغ وتوثيق السبب.
- `resolved_by` (VARCHAR(36), NULL): المشرف المعالج.
- `created_at` (TIMESTAMP): وقت تقديم البلاغ.

### 14. جدول تذاكر الدعم الفني `SUPPORT_TICKET`
- `id` (VARCHAR(36), PK): معرف التذكرة.
- `ticket_number` (VARCHAR(50), UNIQUE): رقم التذكرة.
- `user_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): المستخدم صاحب التذكرة.
- `subject` (VARCHAR(200)): موضوع التذكرة.
- `priority` (VARCHAR(20)): (`low`, `medium`, `high`, `urgent`).
- `status` (VARCHAR(30)): (`open`, `in_progress`, `waiting_user`, `resolved`, `closed`).
- `created_at` (TIMESTAMP): وقت الإنشاء.

### 15. جدول أوامر الدفع `PAYMENT_ORDER`
- `id` (VARCHAR(36), PK): معرف أمر الدفع.
- `idempotency_key` (VARCHAR(100), UNIQUE): مفتاح منع تكرار المعاملات المالية.
- `user_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): المستخدم الدافع.
- `listing_id` (VARCHAR(36), NULL, FK -> LISTING.id): الإعلان المروج (إن وجد).
- `package_name` (VARCHAR(100)): باقة الترويج المختارة (`basic`, `pro`, `premium_star`).
- `amount` (DECIMAL(12,2)): المبلغ الإجمالي بدون ضريبة.
- `tax_amount` (DECIMAL(12,2)): قيمة ضريبة القيمة المضافة (15%).
- `total_amount` (DECIMAL(12,2)): المبلغ الإجمالي المستحق بالريال.
- `currency` (VARCHAR(10)): `SAR`.
- `payment_method` (VARCHAR(30)): (`mada`, `visa_mastercard`, `apple_pay`).
- `status` (VARCHAR(30)): (`pending`, `paid`, `failed`, `refunded`).
- `payment_gateway_ref` (VARCHAR(100)): المرجع البنكي من بوابة الدفع.
- `created_at` (TIMESTAMP): تاريخ الطلب.
- `paid_at` (TIMESTAMP, NULL): تاريخ تأكيد الدفع الفعلي من الخادم.

### 16. جدول الفواتير الضريبية `INVOICE`
- `id` (VARCHAR(36), PK): معرف الفاتورة.
- `invoice_number` (VARCHAR(50), UNIQUE): رقم الفاتورة التسلسلي الرسمي.
- `payment_order_id` (VARCHAR(36), FK -> PAYMENT_ORDER.id): أمر الدفع المرتبط.
- `user_id` (VARCHAR(36), FK -> USER_ACCOUNT.id): العميل.
- `subtotal` (DECIMAL(12,2)): المجموع قبل الضريبة.
- `tax_amount` (DECIMAL(12,2)): الضريبة 15%.
- `total` (DECIMAL(12,2)): المجموع النهائي.
- `zatca_status` (VARCHAR(30)): حالة الامتثال للفاتورة الضريبية.
- `created_at` (TIMESTAMP): تاريخ إصدار الفاتورة.

### 17. جدول طلبات واسترداد المبالغ `REFUND`
- `id` (VARCHAR(36), PK): معرف الاسترداد.
- `payment_order_id` (VARCHAR(36), FK -> PAYMENT_ORDER.id): أمر الدفع الأصلي.
- `refund_amount` (DECIMAL(12,2)): المبلغ المسترد (لا يتجاوز أصل المبلغ).
- `reason` (TEXT): سبب الاسترداد.
- `status` (VARCHAR(30)): (`requested`, `approved`, `rejected`, `completed`).
- `requested_by` (VARCHAR(36), FK -> USER_ACCOUNT.id): من قدم الطلب.
- `approved_by` (VARCHAR(36), NULL): المسؤول المالي المعتمد.
- `processed_at` (TIMESTAMP, NULL): تاريخ تحويل الاسترداد.

### 18. جدول سجل التدقيق الإداري `AUDIT_EVENT`
- `id` (VARCHAR(36), PK): معرف الحدث.
- `user_id` (VARCHAR(36), NULL): المنفذ للعملية.
- `user_role` (VARCHAR(50)): دور المستخدم حينها.
- `event_type` (VARCHAR(100)): نوع الإجراء (`LISTING_APPROVED`, `LISTING_SUSPENDED`, `PAYMENT_CONFIRMED`, `REFUND_APPROVED`, `PERMISSION_CHANGED`, `USER_SUSPENDED`).
- `entity_name` (VARCHAR(50)): الكيان المتأثر (`listing`, `payment`, `user`, `report`).
- `entity_id` (VARCHAR(100)): معرف السجل المتأثر.
- `details_json` (TEXT): تفاصيل التغييرات ومسببات القرار.
- `ip_address` (VARCHAR(45)): عنوان IP للطلب.
- `created_at` (TIMESTAMP): وقت الإجراء المسجل (غير قابل للتعديل أو الحذف).
