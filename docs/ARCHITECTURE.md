# المعمارية التقنية للمنصة (SYSTEM ARCHITECTURE)
**منصة عقار — الإصدار الرابع**

---

## 1. النمط المعماري (Architectural Pattern)
تم اختيار نمط **Modular Clean Full-Stack Monolith**:
- طبقة واجهة المستخدم (Presentation Layer): تطبيق تفاعلي مبني بـ React 19، Tailwind CSS v4، Lucide Icons، وMotion. يدعم بالكامل اللغة العربية وRTL والتجاوب على مختلف الشاشات.
- طبقة التوجيه ونقاط النهاية (API Gateway & Controllers): Express.js مع بادئة موحدة `/api/v1/`، تحقق شامل من الطلبات ومعالجة أخطاء موحدة.
- طبقة خدمات الأعمال (Domain Services Layer):
  - `ListingService`: إدارة دورة حياة العقار، التراخيص، وانتقالات الحالات.
  - `AuthAndPermissionService`: فحص الجلسات، الأدوار، ملكية السجل، وتصاريح المنشآت.
  - `FinanceService`: احتساب الأسعار، إنشاء أوامر الدفع بـ Idempotency Key، إصدار الفواتير، والاسترداد.
  - `ComplianceIntegrationService`: محول تكامل فحص التراخيص والهوية الوطنية.
  - `AuditLogService`: تسجيل العمليات الحساسة في `AUDIT_EVENT`.
  - `GeminiMapGroundingService`: التحليل الجغرافي واستخراج المعالم المحيطة عبر `gemini-3.8-flash` و `googleMaps` Tool.
- طبقة البيانات والتخزين (Data Access & Persistence Layer):
  - محرك بيانات علائقي مع تدقيق فهارس البحث المكاني والنصي.
  - معاملات ذرية (Transactions) لضمان عدم حدوث تضارب في عمليات الدفع أو الحجز أو تغيير الحالات.
  - منع الحذف المتتالي الضار (Soft Delete & Protected Foreign Keys) للحفاظ على السجلات المالية والتدقيقية.

## 2. إدارة الجلسات والأمان (Security & Sessions)
- تخزين الرموز والتحقق من الجلسات عبر HTTP Headers / Session State الآمن.
- فصل حقول تسجيل الدخول وتجزئة كلمات المرور عن الملف الشخصي العام.
- عدم تسريب المفاتيح السرية في الكود المصدري؛ وتمرير مفتاح `GEMINI_API_KEY` خادميًا حصرًا.
- حماية ضد XSS عبر تطهير المدخلات والتشفير القياسي في React.
- حماية ضد SQL/NoSQL Injection والـ IDOR (Insecure Direct Object References) بالتحقق الخادمي من ملكية السجل قبل أي تعديل أو قراءة خاصة.

## 3. التكاملات الخارجية (Integration Adapters)
- **مزود التحقق من التراخيص (Wathq/Ejar/Fal Adapter):** واجهة قياسية `LicenseVerifierInterface` تدعم وضع المحاكاة الصريح مع تسجيل استجابات الفحص، مع عدم تحويل الفشل أو المهلة إلى موافقة تلقائية.
- **مزود بوابة الدفع (Mada/Visa/ApplePay Adapter):** معالجة الطلبات عبر خادم آمن، مطابقة المبالغ والعملة (SAR)، والتأكد من عدم تكرار الإشعار (Webhook Idempotency).
- **مزود الخرائط والمعلومات الحية:** تكامل Google Maps Grounding لاسترجاع معالم الأحياء، الخدمات المجاورة، المستشفيات، والمدارس، مع روابط حقيقية للخرائط.
