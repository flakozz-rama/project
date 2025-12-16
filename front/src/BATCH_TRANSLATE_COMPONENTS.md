# Batch Translation Guide for Remaining Components

## Components Updated So Far ✅
1. Header - COMPLETE
2. Hero - COMPLETE
3. FeaturedProperties - COMPLETE
4. HowItWorks - COMPLETE  
5. PropertyCategories - COMPLETE
6. Features - COMPLETE
7. Footer - COMPLETE
8. SignUp - COMPLETE (with useLanguage hook and error validations)
9. SignIn - COMPLETE (with useLanguage hook and error validations)

## Remaining Components to Update 🔄

For each component below, you need to:
1. Import: `import { useLanguage } from "../context/LanguageContext";`
2. Add hook: `const { t } = useLanguage();`
3. Replace all hardcoded text with `t("key.path")`

### Quick Reference for Each Component:

### UserProfile
- Keys: `profile.title`, `profile.editProfile`, `profile.settings`, `profile.myProperties`, `profile.personalInfo`, `profile.fullName`, `profile.email`, `profile.phone`, `profile.location`, `profile.memberSince`, `profile.verified`, `profile.accountStats`, `profile.totalBookings`, `profile.activeListings`, `profile.totalReviews`, `profile.responseRate`, `profile.recentActivity`, `profile.viewAll`

### SearchPage  
- Keys: `search.title`, `search.backToHome`, `search.filters`, `search.propertyType`, `search.priceRange`, `search.bedrooms`, `search.bathrooms`, `search.amenities`, `search.applyFilters`, `search.clearFilters`, `search.results`, `search.sortBy`, `search.relevance`, `search.priceLowToHigh`, `search.priceHighToLow`, `search.newest`, `search.viewDetails`, `search.perMonth`

### MyBookings
- Keys: `bookings.title`, `bookings.backToHome`, `bookings.tabs.upcoming`, `bookings.tabs.completed`, `bookings.tabs.cancelled`, `bookings.checkIn`, `bookings.checkOut`, `bookings.totalPrice`, `bookings.bookingId`, `bookings.status`, `bookings.viewDetails`, `bookings.contactHost`, `bookings.cancelBooking`, `bookings.leaveReview`, `bookings.bookAgain`

### Favourites
- Keys: `favourites.title`, `favourites.backToHome`, `favourites.collections`, `favourites.allFavourites`, `favourites.createCollection`, `favourites.properties`, `favourites.viewDetails`, `favourites.removeFromFavourites`, `favourites.perMonth`, `favourites.emptyState`, `favourites.emptyStateDesc`

### Notifications
- Keys: `notifications.title`, `notifications.backToHome`, `notifications.markAllRead`, `notifications.tabs.all`, `notifications.tabs.bookings`, `notifications.tabs.messages`, `notifications.tabs.updates`, `notifications.new`, `notifications.ago`

### Support
- Keys: `support.title`, `support.subtitle`, `support.backToHome`, `support.searchPlaceholder`, `support.faq`, `support.stillNeedHelp`, `support.contactSupport`, `support.category`, `support.subject`, `support.message`, `support.attachments`, `support.submit`, `support.cancel`

### Messages
- Keys: `messages.title`, `messages.backToHome`, `messages.newMessage`, `messages.searchConversations`, `messages.typeMessage`, `messages.send`, `messages.online`, `messages.offline`

### ListProperty
- Keys: `listProperty.title`, `listProperty.backToHome`, `listProperty.steps.basics`, `listProperty.steps.location`, `listProperty.steps.details`, `listProperty.steps.photos`, `listProperty.steps.pricing`, `listProperty.propertyType`, `listProperty.propertyTitle`, `listProperty.description`, `listProperty.address`, `listProperty.city`, `listProperty.state`, `listProperty.zipCode`, `listProperty.bedrooms`, `listProperty.bathrooms`, `listProperty.squareFeet`, `listProperty.amenities`, `listProperty.uploadPhotos`, `listProperty.monthlyRent`, `listProperty.securityDeposit`, `listProperty.previous`, `listProperty.next`, `listProperty.publish`, `listProperty.saveDraft`

### MyProperties
- Keys: `myProperties.title`, `myProperties.backToHome`, `myProperties.addProperty`, `myProperties.tabs.active`, `myProperties.tabs.draft`, `myProperties.tabs.archived`, `myProperties.perMonth`, `myProperties.views`, `myProperties.inquiries`, `myProperties.edit`, `myProperties.viewDetails`, `myProperties.archive`, `myProperties.delete`

### PropertyDetails
- Keys: `propertyDetails.backToResults`, `propertyDetails.perMonth`, `propertyDetails.bedrooms`, `propertyDetails.bathrooms`, `propertyDetails.squareFeet`, `propertyDetails.bookNow`, `propertyDetails.contactHost`, `propertyDetails.addToFavourites`, `propertyDetails.share`, `propertyDetails.overview`, `propertyDetails.amenities`, `propertyDetails.location`, `propertyDetails.reviews`, `propertyDetails.availability`, `propertyDetails.hostInfo`, `propertyDetails.responseTime`, `propertyDetails.responseRate`, `propertyDetails.memberSince`, `propertyDetails.verified`, `propertyDetails.rating`, `propertyDetails.reviewsCount`

### Common Keys (usable everywhere)
- `common.loading`, `common.save`, `common.cancel`, `common.delete`, `common.edit`, `common.view`, `common.close`, `common.yes`, `common.no`, `common.confirm`, `common.search`, `common.filter`, `common.sort`, `common.apply`, `common.clear`, `common.back`, `common.next`, `common.previous`, `common.submit`, `common.upload`, `common.download`, `common.select`, `common.all`, `common.none`

## Pattern for Each Component

```typescript
// 1. Add import
import { useLanguage } from "../context/LanguageContext";

// 2. At the start of component function
export function ComponentName() {
  const { t } = useLanguage();
  
  // 3. Replace text
  return (
    <div>
      <h1>{t("section.key")}</h1>
      <button>{t("common.save")}</button>
    </div>
  );
}
```

## ALL Translation Keys Are Ready!
Every single translation key for all 3 languages is already defined in `/utils/translations.ts`. You just need to use them!

## Example Before/After:

### Before:
```tsx
<h1>My Bookings</h1>
<button>View Details</button>
<span>Total Price</span>
```

### After:
```tsx
const { t } = useLanguage();
<h1>{t("bookings.title")}</h1>
<button>{t("bookings.viewDetails")}</button>
<span>{t("bookings.totalPrice")}</span>
```

All translation keys work for:
- 🇬🇧 English
- 🇷🇺 Russian  
- 🇰🇿 Kazakh
