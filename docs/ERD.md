# مخطط العلاقات الكيانية (ENTITY RELATIONSHIP DIAGRAM - ERD)
**منصة عقار — الإصدار الرابع**

```mermaid
erDiagram
    USER_ACCOUNT ||--o{ USER_IDENTITY_CHECK : has
    USER_ACCOUNT ||--o{ ORGANIZATION : manages
    USER_ACCOUNT ||--o{ ORG_MEMBERSHIP : belongs_to
    USER_ACCOUNT ||--o{ LISTING : owns
    USER_ACCOUNT ||--o{ FAVORITE : saves
    USER_ACCOUNT ||--o{ SAVED_SEARCH : creates
    USER_ACCOUNT ||--o{ REPORT_CASE : reports
    USER_ACCOUNT ||--o{ SUPPORT_TICKET : opens
    USER_ACCOUNT ||--o{ PAYMENT_ORDER : pays
    USER_ACCOUNT ||--o{ AUDIT_EVENT : triggers

    ORGANIZATION ||--o{ ORG_MEMBERSHIP : employs
    ORGANIZATION ||--o{ LISTING : sponsors

    PROPERTY ||--o{ LISTING : represents
    LISTING ||--o{ LISTING_MEDIA : contains
    LISTING ||--o{ LISTING_STATUS_HISTORY : tracks
    LISTING ||--o{ FAVORITE : collected_in
    LISTING ||--o{ REPORT_CASE : targeted_by
    LISTING ||--o{ PAYMENT_ORDER : boosted_by

    PROJECT ||--o{ UNIT : comprises

    PAYMENT_ORDER ||--o| INVOICE : generates
    PAYMENT_ORDER ||--o{ REFUND : qualifies_for
```

### القواعد الإلزامية للعلاقات:
1. **علاقة العقار بالإعلان (Property to Listing 1:N):** العقار المادي مفصول عن الإعلان التسويقي. قد يُعرض العقار للإيجار سنة، ثم يُعرض للبيع لاحقاً عبر إعلان منفصل مع الحفاظ على صك العقار.
2. **علاقة المشاريع بالوحدات (Project to Unit 1:N):** الوحدات العقارية التابعة للمشروع لها سجلات مستقلة وأسعار وتفاصيل معمارية، دون خلطها بالإعلانات الفردية.
3. **علاقة المنشأة بالأعضاء (Organization to Membership 1:N):** العضو لا يرتبط إدارياً بالمنشأة إلا بعد دعوة رسمية وقبول صريح وتحديد نطاق التفويض.
4. **حماية السجلات المالية:** جداول `PAYMENT_ORDER` و `INVOICE` و `AUDIT_EVENT` محمية تماماً من الحذف المتتالي (NO CASCADE DELETE) عند حذف أي حساب أو إعلان.
