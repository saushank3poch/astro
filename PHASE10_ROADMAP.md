# Phase 10: Mobile App Development - Roadmap

## Overview
Build a full-featured React Native/Expo mobile application with feature parity to the web app, using in-app purchases (IAP) for subscriptions instead of crypto payments.

**Timeline:** 4 weeks
**Target Platforms:** iOS 15+ and Android 10+
**Tech Stack:** Expo SDK 51+, React Native, TypeScript, Expo Router

---

## Week 1: Foundation & Authentication (Days 1-7)

### Day 1-2: Project Setup
- **Initialize Expo project**
  - `npx create-expo-app@latest astro-mobile --template tabs`
  - Configure TypeScript
  - Set up Expo Router for file-based navigation
  - Configure app.json (bundle ID, version, permissions)
  - Set up environment variables (.env files)

- **Development environment**
  - Install iOS Simulator / Android Emulator
  - Configure EAS Build for cloud builds
  - Set up development certificates
  - Create GitHub repo for mobile app

- **Project structure**
  ```
  app/
    (auth)/
      login.tsx
      register.tsx
      forgot-password.tsx
    (tabs)/
      index.tsx (home/predictions)
      profile.tsx
      compatibility.tsx
      settings.tsx
    _layout.tsx
  components/
  services/
    api.ts
    auth.ts
    storage.ts
  store/
    useAuthStore.ts
    useUserStore.ts
  constants/
  utils/
  ```

### Day 3-4: Authentication System
- **Email/Password Auth**
  - Login screen UI
  - Registration screen UI
  - Forgot password flow
  - Form validation (react-hook-form)
  - API integration with backend /auth endpoints

- **OAuth Integration**
  - Google Sign-In (Expo AuthSession)
  - Apple Sign-In (iOS only, required if OAuth present)
  - Platform-specific configuration
  - Token exchange with backend

- **Secure Storage**
  - Expo SecureStore for tokens
  - Auth state persistence
  - Auto-login on app launch
  - Logout functionality

### Day 5-6: Biometric Authentication
- **Implementation**
  - Expo LocalAuthentication setup
  - Face ID / Touch ID (iOS)
  - Fingerprint (Android)
  - Biometric settings toggle
  - Fallback to password

- **Auth State Management**
  - Zustand store for auth state
  - Token refresh logic
  - Session timeout handling
  - Protected route middleware

### Day 7: Navigation Architecture
- **Expo Router Setup**
  - Tab navigation (Home, Profile, Compatibility, Settings)
  - Stack navigation for nested screens
  - Auth flow vs Main flow separation
  - Deep linking configuration
  - Navigation guards for protected routes

- **Testing**
  - Test all auth flows on iOS
  - Test all auth flows on Android
  - Test biometric fallback scenarios
  - Test token persistence

**Week 1 Deliverables:**
- ✅ Working Expo project with navigation
- ✅ Email/Password authentication
- ✅ Google & Apple Sign-In
- ✅ Biometric authentication
- ✅ Secure token storage
- ✅ Auth state management

---

## Week 2: Core Features (Days 8-14)

### Day 8-9: Birth Chart & Profile
- **Birth Chart Input**
  - Birth date picker (native)
  - Birth time picker
  - Birth location autocomplete (Google Places API)
  - Timezone detection
  - Form validation and submission

- **Chart Display**
  - Chinese astrology chart view
  - Western astrology chart view
  - Element badges (visual components)
  - Zodiac sign display
  - SVG visualizations (react-native-svg)

- **Profile Management**
  - View profile screen
  - Edit profile screen
  - Update birth chart
  - Profile photo upload (expo-image-picker)
  - Save changes API integration

### Day 10-11: Predictions
- **Prediction Types**
  - Macro predictions screen
  - Timing predictions screen
  - Divination predictions (Tarot, I Ching)
  - Asset-specific predictions
  - Prediction cards UI component

- **Prediction Flow**
  - Select prediction type
  - Choose asset (search/dropdown)
  - Show loading state
  - Display prediction result
  - Save to history
  - Native share functionality (Expo Sharing)

- **Prediction History**
  - List all past predictions
  - Filter by type/asset
  - Sort by date
  - Re-view prediction details
  - Delete predictions

- **Credit System**
  - Display remaining credits
  - Show tier limits
  - Block prediction if no credits
  - Prompt upgrade to paid tier

### Day 12-13: Compatibility
- **User-Asset Matching**
  - Compatibility list screen
  - Top compatible assets
  - Compatibility score visualization
  - Filter by asset type
  - Search assets

- **Asset Details**
  - Asset detail page
  - Compatibility explanation
  - Elemental analysis
  - Historical data chart (if available)
  - "Get Prediction" CTA

- **UI Components**
  - Asset card component
  - Compatibility meter
  - Element badge
  - Asset type icons

### Day 14: Offline Mode
- **Offline-First Strategy**
  - Async storage setup
  - Cache birth chart data
  - Cache last 10 predictions
  - Cache compatibility results
  - Queue actions when offline (optimistic updates)

- **Sync Logic**
  - Detect network status (NetInfo)
  - Sync queue on reconnect
  - Show offline indicator
  - Handle conflicts (server wins)
  - Background sync

**Week 2 Deliverables:**
- ✅ Birth chart input and display
- ✅ Profile management
- ✅ All prediction types working
- ✅ Prediction history
- ✅ Compatibility matching
- ✅ Asset details
- ✅ Offline mode basics

---

## Week 3: IAP Subscriptions & Notifications (Days 15-21)

### Day 15-16: RevenueCat Integration
- **RevenueCat Setup**
  - Create RevenueCat account
  - Configure iOS app (App Store Connect)
  - Configure Android app (Google Play Console)
  - Install react-native-purchases
  - Initialize SDK with API keys

- **Product Configuration**
  - Create products in RevenueCat
  - iOS Product IDs:
    - `astro_basic_monthly` - $9.99/mo
    - `astro_pro_monthly` - $29.99/mo
  - Android Product IDs:
    - `astro_basic_monthly` - $9.99/mo
    - `astro_pro_monthly` - $29.99/mo
  - Configure 7-day free trial
  - Set up offerings (Basic, Pro)

- **Entitlements**
  - `predictions_basic`: 50/month
  - `predictions_pro`: Unlimited
  - `priority_support`: Pro only

### Day 17: Subscription UI
- **Paywall Screen**
  - Display subscription tiers
  - Show current tier badge
  - Feature comparison table
  - Pricing display (localized)
  - "Start Free Trial" CTA
  - Terms & Privacy links

- **Purchase Flow**
  - Select tier (Basic or Pro)
  - Initiate purchase
  - Show loading state
  - Handle success/failure
  - Update UI immediately
  - Sync with backend

- **Subscription Management**
  - View current subscription
  - Manage subscription (deep link to App Store/Play Store)
  - Restore purchases button
  - Cancel subscription info
  - Renewal date display

### Day 18: Backend Subscription Sync
- **Receipt Validation**
  - POST /v1/mobile/validate-receipt endpoint
  - Send receipt to backend
  - Backend validates with RevenueCat webhook
  - Update user tier in database
  - Return updated credits

- **Subscription Status**
  - GET /v1/mobile/subscription-status endpoint
  - Check user's current tier
  - Get credit balance
  - Get renewal date
  - Grace period handling

- **Webhook Integration**
  - RevenueCat webhook to backend
  - Listen for subscription events:
    - INITIAL_PURCHASE
    - RENEWAL
    - CANCELLATION
    - EXPIRATION
    - BILLING_ISSUE
  - Update user tier in database
  - Send notification if needed

### Day 19-20: Push Notifications
- **Expo Notifications Setup**
  - Install expo-notifications
  - Configure iOS (APNs certificate)
  - Configure Android (FCM)
  - Request permissions
  - Get push token
  - Send token to backend (POST /v1/mobile/push-token)

- **Notification Types**
  - Daily insight (7am local time)
  - Favorable period alert
  - Low credit warning (1 credit left)
  - Subscription expiry (3 days before)
  - Custom asset alerts

- **Notification Handling**
  - Foreground notifications (toast)
  - Background notifications (badge)
  - Notification tap handling
  - Deep linking to relevant screen
  - Notification preferences screen

- **Backend Implementation**
  - Store device tokens in database
  - Create notification service
  - Schedule daily insights (cron job)
  - Send alerts based on triggers
  - Handle iOS vs Android differences

### Day 21: Testing & Refinement
- **IAP Testing**
  - Test sandbox accounts (iOS & Android)
  - Test purchase flow
  - Test restore purchases
  - Test subscription upgrades
  - Test cancellation
  - Test free trial

- **Notification Testing**
  - Test all notification types
  - Test deep linking
  - Test permissions flow
  - Test Android vs iOS
  - Test notification scheduling

**Week 3 Deliverables:**
- ✅ RevenueCat fully integrated
- ✅ IAP purchase flow working
- ✅ Subscription management
- ✅ Receipt validation with backend
- ✅ Push notifications configured
- ✅ All notification types working
- ✅ Sandbox testing complete

---

## Week 4: Polish, Testing & App Store Prep (Days 22-28)

### Day 22: Mobile-Specific Features
- **Home Screen Widget (iOS)**
  - Create widget extension (if time permits)
  - Display daily outlook
  - Show lucky color/direction
  - Update daily

- **Native Share**
  - Share predictions via Expo Sharing
  - Generate shareable image
  - Include app link
  - Social media optimization

- **Deep Linking**
  - Universal links (iOS)
  - App links (Android)
  - Link structure:
    - `astro://prediction/:id`
    - `astro://asset/:symbol`
    - `astro://paywall`
  - Handle incoming links
  - Test link handling

### Day 23: Performance Optimization
- **Bundle Size**
  - Analyze bundle (React Native DevTools)
  - Remove unused dependencies
  - Optimize images (compress, WebP)
  - Code splitting where possible
  - Target: <50MB total

- **Launch Time**
  - Optimize initial load
  - Lazy load screens
  - Reduce initial API calls
  - Splash screen optimization
  - Target: <2 seconds

- **Runtime Performance**
  - Profile with Flipper
  - Optimize re-renders (React.memo)
  - Use FlatList for long lists
  - Optimize animations (useNativeDriver)
  - Target: 60fps

### Day 24: Testing
- **Unit Tests**
  - Auth flows (Jest)
  - API services
  - State management (Zustand)
  - Utility functions
  - Target: 70% coverage

- **Integration Tests**
  - User flows (Detox)
  - Purchase flow
  - Prediction flow
  - Profile update flow

- **Manual Testing**
  - iOS devices (iPhone 14, iPhone SE, iPad)
  - Android devices (various manufacturers)
  - Different OS versions
  - Portrait & landscape
  - Dark mode & light mode

- **Edge Cases**
  - Offline mode
  - Poor network
  - Expired subscription
  - No credits
  - API errors
  - Permission denials

### Day 25-26: App Store Preparation
- **Screenshots**
  - 6.5" iPhone (1242x2688)
    - Onboarding
    - Birth chart
    - Prediction result
    - Compatibility
    - Subscription tiers
  - 5.5" iPhone (1242x2208)
  - iPad Pro (2048x2732)
  - Android (various sizes via Google Play)

- **App Preview Videos**
  - iOS: 15-30 seconds
  - Android: 30 seconds
  - Show key features
  - Show prediction flow
  - Show subscriptions

- **Store Listings**
  - App name: "Astro - Crypto Predictions"
  - Subtitle: "Astrology-powered trading insights"
  - Keywords: "astrology, crypto, predictions, trading, horoscope, compatibility"
  - Description (see APP_STORE_CHECKLIST.md)
  - Category: Finance / Lifestyle
  - Age rating: 4+ (13+ with gate)

- **Privacy & Legal**
  - Privacy policy (in-app + web)
  - Terms of service (in-app + web)
  - Data collection disclosure
  - COPPA compliance (age gate)
  - GDPR compliance (data export/delete)
  - Entertainment disclaimer

### Day 27: App Store Connect & Google Play Console
- **iOS (App Store Connect)**
  - Create app record
  - Upload screenshots & videos
  - Fill store listing
  - Configure IAP products
  - Set pricing & availability
  - Add privacy policy URL
  - Add support URL
  - Submit for review

- **Android (Google Play Console)**
  - Create app record
  - Upload screenshots & videos
  - Fill store listing
  - Configure IAP products
  - Set pricing & availability
  - Add privacy policy URL
  - Content rating questionnaire
  - Submit for review

- **Final Builds**
  - iOS: `eas build --platform ios --profile production`
  - Android: `eas build --platform android --profile production`
  - Upload to App Store Connect
  - Upload to Google Play Console

### Day 28: Final Review & Submit
- **Pre-Submission Checklist**
  - All features working
  - No console errors
  - No crashes
  - Performance targets met
  - Screenshots uploaded
  - Store listings complete
  - Privacy policy live
  - Terms of service live
  - IAP products configured
  - Push notifications working

- **Submit for Review**
  - Submit iOS app
  - Submit Android app
  - Monitor review status
  - Respond to any questions

- **Documentation**
  - Internal docs for maintenance
  - API documentation updates
  - Known issues / limitations
  - Future enhancements list

**Week 4 Deliverables:**
- ✅ All mobile-specific features
- ✅ Performance optimized
- ✅ Comprehensive testing complete
- ✅ App Store assets ready
- ✅ Store listings complete
- ✅ Privacy & legal docs ready
- ✅ Apps submitted for review

---

## Testing Strategy

### Platforms to Test
**iOS:**
- iPhone 14 Pro (iOS 17)
- iPhone SE (iOS 15)
- iPad Pro (iOS 17)

**Android:**
- Google Pixel 7 (Android 13)
- Samsung Galaxy S21 (Android 12)
- OnePlus device (Android 11)

### Testing Checklist

#### Functional Testing
- [ ] User registration & login
- [ ] Google Sign-In
- [ ] Apple Sign-In (iOS)
- [ ] Biometric authentication
- [ ] Birth chart creation
- [ ] Birth chart editing
- [ ] All prediction types
- [ ] Prediction history
- [ ] Compatibility matching
- [ ] Asset search
- [ ] Profile updates
- [ ] IAP purchase (Basic tier)
- [ ] IAP purchase (Pro tier)
- [ ] Restore purchases
- [ ] Subscription management
- [ ] Push notifications (all types)
- [ ] Offline mode
- [ ] Native share
- [ ] Deep linking

#### Non-Functional Testing
- [ ] Performance (60fps, <2s launch)
- [ ] Bundle size (<50MB)
- [ ] Memory usage
- [ ] Battery consumption
- [ ] Network usage
- [ ] Accessibility (VoiceOver, TalkBack)
- [ ] Dark mode
- [ ] Different screen sizes
- [ ] Landscape orientation
- [ ] Localization (if applicable)

#### Security Testing
- [ ] Secure token storage
- [ ] API authentication
- [ ] Receipt validation
- [ ] No sensitive data in logs
- [ ] No hardcoded secrets
- [ ] SSL pinning (optional)

#### Edge Cases
- [ ] No internet connection
- [ ] Poor network (slow 3G)
- [ ] App backgrounded during API call
- [ ] App killed during purchase
- [ ] Expired session
- [ ] Subscription expired
- [ ] Zero credits remaining
- [ ] API rate limiting
- [ ] Server errors (500, 503)
- [ ] Invalid birth chart data

---

## Success Criteria

### Technical Requirements
- ✅ App runs on iOS 15+ and Android 10+
- ✅ All web features available on mobile
- ✅ IAP subscriptions working in sandbox
- ✅ Push notifications deliver reliably (>95%)
- ✅ Offline mode works smoothly
- ✅ 60fps animations
- ✅ <2 second launch time
- ✅ <50MB app size
- ✅ No critical bugs
- ✅ Crash rate <1%

### Feature Completeness
- ✅ Authentication (email, OAuth, biometric)
- ✅ Birth chart (input, display, edit)
- ✅ Predictions (all types, history, share)
- ✅ Compatibility (matching, assets, details)
- ✅ Subscriptions (Free, Basic, Pro)
- ✅ Push notifications (5 types)
- ✅ Offline mode (cache, sync)
- ✅ Profile management

### App Store Readiness
- ✅ Screenshots (all required sizes)
- ✅ App preview videos
- ✅ Store listings (iOS + Android)
- ✅ Privacy policy (accessible in-app)
- ✅ Terms of service (accessible in-app)
- ✅ COPPA compliance (age gate)
- ✅ GDPR compliance (data export/delete)
- ✅ Entertainment disclaimer
- ✅ No App Store guideline violations
- ✅ Ready for submission

### User Experience
- ✅ Intuitive navigation
- ✅ Smooth animations
- ✅ Fast load times
- ✅ Clear error messages
- ✅ Helpful onboarding
- ✅ Easy subscription management
- ✅ Accessible design

---

## Risk Mitigation

### High-Risk Items
1. **App Store Rejection**
   - **Risk:** Apple/Google reject due to astrology/gambling concerns
   - **Mitigation:** Prominent "entertainment only" disclaimer, no gambling elements, clear privacy policy

2. **IAP Integration Issues**
   - **Risk:** RevenueCat integration bugs, receipt validation failures
   - **Mitigation:** Thorough sandbox testing, error handling, fallback to backend validation

3. **Push Notification Delivery**
   - **Risk:** Notifications not delivered reliably
   - **Mitigation:** Use Expo's push notification service, test thoroughly, provide in-app alerts as backup

4. **Performance on Older Devices**
   - **Risk:** Slow performance on iOS 15 / Android 10 devices
   - **Mitigation:** Test on minimum supported devices, optimize early, reduce animations if needed

### Medium-Risk Items
1. **Cross-Platform Differences**
   - **Risk:** Features work on one platform but not the other
   - **Mitigation:** Parallel testing on both platforms, use Expo's cross-platform APIs

2. **Offline Sync Conflicts**
   - **Risk:** Data conflicts when syncing offline changes
   - **Mitigation:** Server wins strategy, clear conflict messages, test offline scenarios

3. **Subscription Status Sync**
   - **Risk:** User's subscription status out of sync between app and backend
   - **Mitigation:** Regular status checks, webhook integration, force refresh on app launch

---

## Post-Launch Plan

### Week 5-6: Monitoring & Iteration
- Monitor crash reports (Sentry / Firebase Crashlytics)
- Track analytics (Expo Analytics / Mixpanel)
- Monitor App Store reviews
- Fix critical bugs
- Respond to user feedback

### Future Enhancements (Phase 11+)
- Home screen widget (iOS)
- Watch app (Apple Watch)
- Tablet optimization (iPad, Android tablets)
- Localization (Chinese, Spanish, etc.)
- Social features (share charts, leaderboards)
- Advanced charts (natal chart wheel)
- More divination methods
- AI chat for astrology questions
- Family sharing support

---

## Team & Resources

### Required Roles
- 1 React Native Developer (full-time, 4 weeks)
- 1 Backend Developer (part-time, support IAP endpoints)
- 1 Designer (part-time, screenshots, app icon)
- 1 QA Tester (part-time, week 3-4)

### Tools & Services
- Expo SDK 51+
- RevenueCat (Starter plan: $0/mo for first $2.5k MRR)
- Expo EAS Build (for cloud builds)
- Apple Developer Account ($99/year)
- Google Play Developer Account ($25 one-time)
- TestFlight (iOS beta testing, free)
- Google Play Internal Testing (Android beta, free)

### Budget Estimate
- Development: 4 weeks × developer rate
- RevenueCat: Free tier initially
- Apple Developer: $99/year
- Google Play: $25 one-time
- Expo EAS: ~$99/mo (optional, can build locally)
- Total: Primarily developer time + $124 in fees

---

## Conclusion

This 4-week roadmap provides a comprehensive plan to build a feature-complete mobile app with parity to the web application. The phased approach ensures foundational elements (auth, navigation) are solid before building core features and monetization.

Key success factors:
1. **Start simple:** Get basic auth and navigation working first
2. **Test early:** Test on both platforms from Day 1
3. **IAP focus:** Prioritize RevenueCat integration and testing
4. **App Store prep:** Don't underestimate the time needed for store assets
5. **Performance:** Monitor performance throughout, not just at the end

With this roadmap, the team should be able to launch a high-quality mobile app on both iOS and Android app stores by the end of Week 4.
