# نظام التصميم الكامل - Fake News Detection System

## 📐 شبكة التخطيط (Grid System)

### نظام Tailwind الافتراضي:

```
- الحاوية: max-w-7xl (80rem)
- الحشوة الجانبية: px-4 (16px على الهاتف)
- الفجوات بين العناصر: gap-4 إلى gap-8
- الصفوف: grid-cols-1, grid-cols-2, grid-cols-3, grid-cols-4
```

---

## 🎨 متغيرات CSS المخصصة

### في `client/src/index.css`:

```css
@layer base {
  :root {
    /* الألوان الأساسية */
    --primary: 15 23 42;           /* Navy Blue #0F172A */
    --primary-foreground: 255 255 255; /* White */
    
    --secondary: 5 150 105;        /* Emerald Green #059669 */
    --secondary-foreground: 255 255 255;
    
    --destructive: 220 38 38;      /* Coral Red #DC2626 */
    --destructive-foreground: 255 255 255;
    
    --background: 255 255 255;     /* White */
    --foreground: 15 23 42;        /* Navy Blue */
    
    --card: 255 255 255;           /* White */
    --card-foreground: 15 23 42;
    
    --muted: 243 244 246;          /* Light Gray */
    --muted-foreground: 107 114 128; /* Dark Gray */
    
    --accent: 5 150 105;           /* Emerald Green */
    --accent-foreground: 255 255 255;
    
    --border: 229 231 235;         /* Light Border */
    --input: 255 255 255;
    --ring: 15 23 42;
  }
}
```

---

## 📏 المسافات والحشوة (Spacing)

### نظام المسافات:

```
xs: 4px   (0.25rem)
sm: 8px   (0.5rem)
md: 16px  (1rem)
lg: 24px  (1.5rem)
xl: 32px  (2rem)
2xl: 48px (3rem)
```

### الحشوة الموصى بها:

| العنصر | الحشوة |
| --- | --- |
| البطاقات | 24px (lg) |
| الأزرار | 12px 24px |
| حقول الإدخال | 12px 16px |
| الأقسام | 32px (2xl) |
| الصفحات | 48px (2xl) |

---

## 🔲 الزوايا المستديرة (Border Radius)

```
xs: 4px (0.25rem)
sm: 6px (0.375rem)
md: 8px (0.5rem)
lg: 12px (0.75rem)
xl: 16px (1rem)
2xl: 24px (1.5rem)
full: 9999px (دائري كامل)
```

### الاستخدام:

| العنصر | الزاوية |
| --- | --- |
| الأزرار | md (8px) |
| البطاقات | lg (12px) |
| حقول الإدخال | md (8px) |
| الصور | lg (12px) |
| الشارات | full (دائري) |

---

## 🌑 الظلال (Shadows)

### نظام الظلال:

```css
/* ظل خفيف */
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* ظل متوسط */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
            0 1px 2px 0 rgba(0, 0, 0, 0.06);

/* ظل متوسط عالي */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* ظل كبير */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* ظل عند التمرير */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### الاستخدام:

| العنصر | الظل |
| --- | --- |
| البطاقات الهادئة | ظل خفيف |
| البطاقات العادية | ظل متوسط |
| البطاقات عند التمرير | ظل كبير |
| الرؤوس | ظل خفيف |
| الأزرار | ظل متوسط |

---

## 🎭 حالات العناصر (States)

### الأزرار:

```css
/* الحالة العادية */
background-color: #0F172A;
color: #FFFFFF;

/* الحالة عند التمرير */
background-color: #0D1B2A; /* أغمق قليلاً */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* الحالة عند الضغط */
transform: scale(0.98);
background-color: #0A1420;

/* الحالة المعطلة */
background-color: #D1D5DB;
color: #9CA3AF;
cursor: not-allowed;
opacity: 0.6;
```

### حقول الإدخال:

```css
/* الحالة العادية */
border: 1px solid #D1D5DB;
background-color: #FFFFFF;

/* الحالة عند التركيز */
border: 2px solid #0F172A;
box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);

/* الحالة عند الخطأ */
border: 2px solid #DC2626;
box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);

/* الحالة المعطلة */
background-color: #F3F4F6;
color: #9CA3AF;
cursor: not-allowed;
```

---

## 🎬 الحركات والانتقالات

### الانتقالات الموصى بها:

```css
/* الانتقال السريع */
transition: all 0.15s ease;

/* الانتقال المتوسط */
transition: all 0.3s ease;

/* الانتقال البطيء */
transition: all 0.5s ease;

/* الانتقالات المحددة */
transition: background-color 0.2s ease, color 0.2s ease;
```

### الحركات المخصصة:

```css
/* نبض الذكاء الاصطناعي */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7);
  }
  50% { 
    box-shadow: 0 0 0 10px rgba(5, 150, 105, 0);
  }
}

/* الدوران */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* الظهور التدريجي */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* الانزلاق من الأعلى */
@keyframes slide-down {
  from { 
    opacity: 0;
    transform: translateY(-10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 📱 الاستجابة (Responsive Design)

### نقاط التوقف (Breakpoints):

```
sm: 640px   (الهاتف الصغير)
md: 768px   (الجهاز اللوحي)
lg: 1024px  (سطح المكتب الصغير)
xl: 1280px  (سطح المكتب)
2xl: 1536px (سطح المكتب الكبير)
```

### مثال على الاستجابة:

```jsx
// الهاتف: عمود واحد
// الجهاز اللوحي: عمودان
// سطح المكتب: ثلاثة أعمدة

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* المحتوى */}
</div>
```

---

## ♿ معايير الوصول (Accessibility)

### نسب التباين:

```
النص العادي: 4.5:1 على الأقل
النص الكبير: 3:1 على الأقل
العناصر التفاعلية: 3:1 على الأقل
```

### حجم الخط الموصى به:

```
الحد الأدنى: 12px
الحد الأقصى: 18px
الحجم الأساسي: 16px
```

### حجم العناصر التفاعلية:

```
الحد الأدنى: 44x44px (للهاتف)
الحد الأدنى: 40x40px (لسطح المكتب)
```

---

## 🎨 أمثلة على الاستخدام

### بطاقة بسيطة:

```jsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-semibold text-gray-900 mb-2">العنوان</h3>
  <p className="text-gray-600">الوصف</p>
</div>
```

### زر أساسي:

```jsx
<button className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 
                   active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition-all duration-200">
  اضغط هنا
</button>
```

### حقل إدخال:

```jsx
<input 
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-md 
             focus:border-blue-900 focus:ring-2 focus:ring-blue-100
             transition-all duration-200"
  placeholder="أدخل النص هنا"
/>
```

---

## 📚 ملفات المرجع

- **الألوان**: `client/src/index.css`

- **الخطوط**: `client/index.html` (Google Fonts)

- **المكونات**: `client/src/components/ui/`

- **الصور**: `/webdev-static-assets/`

- **الأيقونات**: Lucide React

---

## ✅ قائمة التحقق من التصميم

عند إضافة صفحة أو مكون جديد:

- [ ] استخدام الألوان من نظام الألوان

- [ ] استخدام الخطوط الموصى بها

- [ ] إضافة الظلال المناسبة

- [ ] استخدام المسافات المناسبة

- [ ] اختبار على الهاتف والجهاز اللوحي وسطح المكتب

- [ ] التحقق من نسب التباين

- [ ] إضافة حالات التمرير والتركيز

- [ ] اختبار مع لوحة المفاتيح

- [ ] إضافة نصوص بديلة للصور

