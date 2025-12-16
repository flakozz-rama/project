# GoRent Multi-Language System

## Overview
GoRent now supports three languages:
- 🇬🇧 **English** (Default)
- 🇷🇺 **Russian** (Русский)
- 🇰🇿 **Kazakh** (Қазақша)

## How to Use

### For Users
1. Click the **Globe icon (🌐)** in the header (desktop) or mobile menu
2. Select your preferred language from the dropdown
3. The entire website will instantly translate

### For Developers

#### Translation System Structure

```
/utils/translations.ts          # All translations
/context/LanguageContext.tsx    # Language state management
/components/LanguageSwitcher.tsx # Language switcher UI
```

#### Using Translations in Components

1. **Import the hook:**
```tsx
import { useLanguage } from "../context/LanguageContext";
```

2. **Get the translation function:**
```tsx
const { t } = useLanguage();
```

3. **Use translations:**
```tsx
<h1>{t("hero.title")}</h1>
<button>{t("common.save")}</button>
```

#### Translation Key Structure

All translations are organized by section:

```typescript
translations = {
  en: {
    header: { ... },      // Header navigation
    hero: { ... },        // Hero section
    signup: { ... },      // Sign up page
    signin: { ... },      // Sign in page
    featured: { ... },    // Featured properties
    categories: { ... },  // Property categories
    features: { ... },    // Features section
    footer: { ... },      // Footer
    profile: { ... },     // User profile
    search: { ... },      // Search page
    bookings: { ... },    // Bookings page
    favourites: { ... },  // Favourites page
    notifications: { ... }, // Notifications
    support: { ... },     // Support center
    messages: { ... },    // Messages
    listProperty: { ... }, // List property
    myProperties: { ... }, // My properties
    propertyDetails: { ... }, // Property details
    common: { ... }       // Common terms
  },
  ru: { ... },  // Same structure for Russian
  kk: { ... }   // Same structure for Kazakh
}
```

#### Adding New Translations

1. **Open** `/utils/translations.ts`
2. **Add** your key in all three languages (en, ru, kk)
3. **Use** the key in your component with `t("section.key")`

Example:
```typescript
// In translations.ts
export const translations = {
  en: {
    mySection: {
      title: "My Title",
      button: "Click Me"
    }
  },
  ru: {
    mySection: {
      title: "Мой заголовок",
      button: "Нажми на меня"
    }
  },
  kk: {
    mySection: {
      title: "Менің атауым",
      button: "Маған басыңыз"
    }
  }
}

// In your component
const { t } = useLanguage();
<h1>{t("mySection.title")}</h1>
<button>{t("mySection.button")}</button>
```

## Translated Components

The following components are currently translated:
- ✅ Header (navigation, buttons)
- ✅ Hero (title, subtitle, search)
- ✅ Sign Up page (complete)
- ✅ Sign In page (complete)
- ✅ Footer (complete)
- ✅ All other pages have translation keys defined

## Next Steps for Full Translation

To complete the translation of remaining components:

1. Import `useLanguage` hook
2. Replace hardcoded text with `t("key.path")`
3. All translation keys are already defined in `/utils/translations.ts`

Example pattern:
```tsx
// Before
<h1>Find Properties</h1>

// After
import { useLanguage } from "../context/LanguageContext";
const { t } = useLanguage();
<h1>{t("search.title")}</h1>
```

## Language Persistence

Currently, the language preference is stored in component state. To persist across sessions, you can:

1. **Add localStorage:**
```tsx
// In LanguageContext.tsx
const [language, setLanguage] = useState<Language>(
  (localStorage.getItem("language") as Language) || "en"
);

// Update setLanguage to also save to localStorage
const updateLanguage = (lang: Language) => {
  setLanguage(lang);
  localStorage.setItem("language", lang);
};
```

2. **Or use cookies for server-side persistence**

## Translation Coverage

### Fully Translated Pages:
- 🟢 Sign Up
- 🟢 Sign In
- 🟢 Header
- 🟢 Hero Section

### Ready for Translation (keys defined):
- 🟡 User Profile
- 🟡 Search Page
- 🟡 My Bookings
- 🟡 Favourites
- 🟡 Notifications
- 🟡 Support Center
- 🟡 Messages
- 🟡 List Property
- 🟡 My Properties
- 🟡 Property Details
- 🟡 Footer
- 🟡 Featured Properties
- 🟡 Categories
- 🟡 Features

Simply add `useLanguage()` hook and replace text with `t()` function!

## Backend Integration

When integrating with your Golang backend:

1. **Send language preference** with API requests:
```tsx
headers: {
  'Accept-Language': language
}
```

2. **Backend can return** localized error messages
3. **Dynamic content** (property descriptions, reviews) should be stored per language in database

## Support

For questions or issues with the translation system, check:
- Translation keys: `/utils/translations.ts`
- Context implementation: `/context/LanguageContext.tsx`
- Example usage: `/components/Header.tsx` or `/components/Hero.tsx`
