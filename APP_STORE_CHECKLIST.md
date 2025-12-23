# App Store Submission Checklist

## Overview
This comprehensive checklist covers everything needed to submit the Astro mobile app to both Apple App Store and Google Play Store, including requirements, assets, policies, and step-by-step submission process.

---

## Table of Contents
1. [Apple App Store Requirements](#apple-app-store-requirements)
2. [Google Play Store Requirements](#google-play-store-requirements)
3. [Screenshot Requirements](#screenshot-requirements)
4. [App Description Templates](#app-description-templates)
5. [Keywords for ASO](#keywords-for-aso)
6. [Privacy Policy Requirements](#privacy-policy-requirements)
7. [Review Guidelines Compliance](#review-guidelines-compliance)
8. [Age Rating](#age-rating)
9. [Submission Checklist](#submission-checklist)

---

## Apple App Store Requirements

### Technical Requirements

- [ ] **iOS Version:** App runs on iOS 15.0 or later
- [ ] **Xcode Version:** Built with latest stable Xcode
- [ ] **Swift/Obj-C:** Compatible with latest language version
- [ ] **Architecture:** Supports arm64 (64-bit)
- [ ] **Bundle ID:** `com.astro.mobile` (matches App Store Connect)
- [ ] **Version:** Semantic versioning (e.g., 1.0.0)
- [ ] **Build Number:** Incremental (e.g., 1, 2, 3...)

### App Information

- [ ] **App Name:** "Astro - Crypto Predictions" (max 30 characters)
- [ ] **Subtitle:** "Astrology-powered trading insights" (max 30 characters)
- [ ] **Primary Language:** English (US)
- [ ] **Category:** Primary: Finance, Secondary: Lifestyle
- [ ] **Content Rights:** "This app uses RevenueCat for subscriptions"

### Build Requirements

- [ ] **IPA File:** Uploaded via Xcode or Transporter
- [ ] **TestFlight:** Beta tested with at least 5 testers
- [ ] **Crash-Free:** No crashes during TestFlight testing
- [ ] **App Size:** Under 200MB (download size)
- [ ] **Performance:** Launches in under 2 seconds
- [ ] **Memory:** No memory leaks or excessive usage

### Subscription Requirements

- [ ] **IAP Products:** Basic Monthly ($9.99), Pro Monthly ($29.99) created
- [ ] **Subscription Group:** Created and configured
- [ ] **Free Trial:** 7 days configured
- [ ] **Pricing:** Set for all required territories
- [ ] **Auto-Renewable:** Enabled
- [ ] **Restore Purchases:** Button visible and functional

### Compliance

- [ ] **Privacy Policy:** Live URL provided (accessible from app and store)
- [ ] **Terms of Service:** Live URL provided
- [ ] **COPPA Compliance:** Age gate implemented (13+)
- [ ] **Export Compliance:** Encryption declaration completed
- [ ] **Content Disclaimer:** "For entertainment purposes only" prominently displayed

---

## Google Play Store Requirements

### Technical Requirements

- [ ] **Android Version:** App runs on Android 10.0 (API 29) or later
- [ ] **Target SDK:** API 33 or higher (as required by Play Store)
- [ ] **Architecture:** Supports arm64-v8a and armeabi-v7a
- [ ] **Package Name:** `com.astro.mobile` (matches Google Play Console)
- [ ] **Version Code:** Incremental integer (e.g., 1, 2, 3...)
- [ ] **Version Name:** Semantic versioning (e.g., 1.0.0)

### App Information

- [ ] **App Name:** "Astro - Crypto Predictions" (max 50 characters)
- [ ] **Short Description:** 80 characters max
- [ ] **Full Description:** 4000 characters max
- [ ] **Default Language:** English (US)
- [ ] **Category:** Finance
- [ ] **Tags:** Finance, Lifestyle, Tools (select up to 5)

### Build Requirements

- [ ] **AAB File:** Android App Bundle uploaded
- [ ] **Internal Testing:** Tested with closed testing group
- [ ] **Pre-Launch Report:** All critical issues resolved
- [ ] **App Size:** Under 150MB (download size)
- [ ] **Performance:** Launches in under 3 seconds
- [ ] **Accessibility:** TalkBack compatible

### Subscription Requirements

- [ ] **Products:** basic_monthly ($9.99), pro_monthly ($29.99) created
- [ ] **Base Plans:** Configured with 1-month billing period
- [ ] **Free Trial:** 7-day offer created for eligible users
- [ ] **Pricing:** Set for all required countries
- [ ] **Auto-Renewing:** Enabled
- [ ] **Restore Purchases:** Functional

### Compliance

- [ ] **Privacy Policy:** URL provided (accessible from app and store)
- [ ] **Terms of Service:** URL provided
- [ ] **Data Safety:** Form completed (data collection disclosure)
- [ ] **Content Rating:** ESRB E10+ or equivalent
- [ ] **Target Audience:** 13+ selected
- [ ] **Content Disclaimer:** "For entertainment purposes" displayed

---

## Screenshot Requirements

### iOS Screenshots

#### 6.5" Display (Required) - iPhone 14 Pro Max, 15 Pro Max
**Resolution:** 1290 x 2796 pixels
**Orientation:** Portrait
**Count:** 3-10 screenshots

**Recommended Screenshots:**
1. **Onboarding/Welcome** - "Discover Your Cosmic Trading Edge"
2. **Birth Chart** - "Personalized Astrological Profile"
3. **Prediction Result** - "AI-Powered Crypto Predictions"
4. **Compatibility** - "Find Your Most Compatible Assets"
5. **Subscription** - "Unlock Unlimited Predictions"

```bash
# Capture on iPhone 15 Pro Max simulator or device
# Simulator: I/O → Screenshot
# Device: Side button + Volume Up
```

#### 5.5" Display (Optional) - iPhone 8 Plus
**Resolution:** 1242 x 2208 pixels
**Orientation:** Portrait
**Count:** Same as 6.5" (recommended for older devices)

#### iPad Pro (3rd gen) 12.9" (Recommended if iPad support)
**Resolution:** 2048 x 2732 pixels
**Orientation:** Portrait
**Count:** 3-10 screenshots

### Android Screenshots

#### Phone Screenshots (Required)
**Min Resolution:** 1080 x 1920 pixels (16:9 aspect ratio)
**Max Resolution:** 3840 x 2160 pixels
**Format:** JPEG or 24-bit PNG (no alpha)
**Count:** 2-8 screenshots

**Recommended Screenshots:** (Same content as iOS)
1. Onboarding
2. Birth Chart
3. Prediction
4. Compatibility
5. Subscription

#### 7-inch Tablet (Optional)
**Resolution:** 1200 x 1920 pixels minimum

#### 10-inch Tablet (Optional)
**Resolution:** 1920 x 2560 pixels minimum

### Screenshot Design Tips

```
✅ DO:
- Show real app content (no mockups)
- Use high-quality assets
- Include device frames (optional, looks polished)
- Add captions/annotations to highlight features
- Use consistent branding (colors, fonts)
- Show happy path (successful flows)
- Localize for different languages (if applicable)

❌ DON'T:
- Use stock photos unrelated to app
- Include pricing in screenshots (changes frequently)
- Show competitor apps or branding
- Use outdated UI
- Include personal user data
- Show blank/loading states
```

---

## App Description Templates

### Apple App Store Description

**Promotional Text** (170 characters, editable without new review):
```
Unlock cosmic trading insights! Get personalized crypto predictions based on Chinese and Western astrology. Start your 7-day free trial today.
```

**Description** (4000 characters max):
```
# Astro - Your Cosmic Crypto Companion

Combine ancient astrology with modern AI to gain unique insights into cryptocurrency markets. Astro analyzes your birth chart and matches it with crypto assets to provide personalized predictions and compatibility scores.

## ✨ Key Features

• PERSONALIZED PREDICTIONS
Get tailored crypto forecasts based on your unique astrological profile. Our AI combines Chinese astrology (BaZi) and Western astrology with market data to generate insights you won't find anywhere else.

• BIRTH CHART ANALYSIS
Input your birth date, time, and location to receive a comprehensive astrological chart. Discover your dominant elements, zodiac signs, and cosmic strengths.

• ASSET COMPATIBILITY
Find which cryptocurrencies align best with your astrological profile. View compatibility scores from 0-100 for thousands of assets.

• DAILY INSIGHTS
Receive personalized daily outlooks highlighting favorable periods for trading decisions. Know when cosmic energy is on your side.

• MULTIPLE PREDICTION TYPES
  - Macro Predictions: Long-term market outlooks
  - Timing Predictions: Optimal entry/exit windows
  - Divination: Tarot and I Ching readings for guidance

• OFFLINE MODE
Access your saved predictions and birth chart even without internet connection.

• BIOMETRIC SECURITY
Secure your account with Face ID or Touch ID for quick, safe access.

## 💎 Subscription Plans

FREE TIER
• 3 predictions per month
• Basic prediction types
• Birth chart analysis

BASIC PLAN - $9.99/month
• 50 predictions per month
• All prediction types
• Compatibility analysis
• Daily push notifications
• 7-day free trial

PRO PLAN - $29.99/month
• Unlimited predictions
• Advanced compatibility
• Custom asset alerts
• Priority support
• 7-day free trial

## ⚠️ Important Disclaimer

Astro is for ENTERTAINMENT PURPOSES ONLY. This app does not provide financial advice. Astrological predictions should not be the sole basis for investment decisions. Always do your own research and consult with a licensed financial advisor before making investment decisions.

Cryptocurrency trading carries significant risk. Only invest what you can afford to lose.

## 🔒 Privacy & Security

Your data is encrypted and never shared with third parties. We collect minimal information necessary to provide our services. Read our full privacy policy at astro.app/privacy.

## 📧 Support

Questions or feedback? Contact us at support@astro.app

---

Terms of Service: astro.app/terms
Privacy Policy: astro.app/privacy
```

### Google Play Store Description

**Short Description** (80 characters):
```
Astrology-powered crypto predictions. Find your compatible assets & insights.
```

**Full Description** (4000 characters, similar to iOS but Google Play formatting):
```
Astro - Your Cosmic Crypto Companion

Combine ancient astrology with modern AI to gain unique insights into cryptocurrency markets.

🌟 PERSONALIZED PREDICTIONS
Get tailored crypto forecasts based on your unique astrological profile using Chinese and Western astrology.

📊 BIRTH CHART ANALYSIS
Create your comprehensive astrological chart and discover your cosmic strengths.

💫 ASSET COMPATIBILITY
Find which cryptocurrencies align best with your astrological profile with compatibility scores.

🔔 DAILY INSIGHTS
Receive personalized daily outlooks highlighting favorable periods for decisions.

📱 FEATURES
✓ Multiple prediction types (Macro, Timing, Divination)
✓ Offline mode for saved content
✓ Biometric authentication
✓ Push notifications
✓ Clean, intuitive interface

💎 SUBSCRIPTION PLANS
• Free: 3 predictions/month
• Basic ($9.99/mo): 50 predictions + all features
• Pro ($29.99/mo): Unlimited predictions

⚠️ DISCLAIMER
For entertainment purposes only. Not financial advice. Consult a licensed financial advisor before making investment decisions. Crypto trading carries risk.

🔒 PRIVACY
Your data is encrypted and never shared. See our privacy policy at astro.app/privacy.

Support: support@astro.app
Terms: astro.app/terms
```

---

## Keywords for ASO

### iOS App Store Keywords (100 characters max, comma-separated)

```
astrology,crypto,predictions,horoscope,compatibility,trading,bitcoin,tarot,forecast,chinese zodiac
```

**Strategy:**
- Focus on high-volume, relevant terms
- No spaces after commas (saves characters)
- Avoid app name words (already indexed)
- Mix popular + niche terms

### Google Play Store Tags (Select up to 5)

1. **Finance**
2. **Lifestyle**
3. **Tools**
4. **Entertainment**
5. **Personalization**

**Additional SEO in Description:**
- Repeat key terms naturally: "crypto predictions", "astrology", "cryptocurrency"
- Include long-tail keywords: "crypto astrology", "birth chart crypto", "astrological trading"

### ASO Best Practices

- **App Name:** Include primary keyword (e.g., "Astro - Crypto Predictions")
- **Subtitle/Short Description:** Include secondary keywords
- **Description:** First 2-3 sentences are most important (appear in search)
- **Reviews:** Encourage users to use keywords in reviews naturally
- **Updates:** Refresh keywords based on performance data

---

## Privacy Policy Requirements

### Required Disclosures

#### Data Collection

**iOS (App Privacy section in App Store Connect):**
- [ ] **Contact Info:** Email address (for account creation)
- [ ] **User Content:** Birth chart data (date, time, location)
- [ ] **Usage Data:** App interactions, predictions created
- [ ] **Device ID:** For push notifications
- [ ] **Purchase History:** Subscription status

**Android (Data Safety section in Play Console):**
- [ ] **Personal Info:** Name, email
- [ ] **Location:** Approximate location (for birth chart)
- [ ] **App Activity:** Prediction history
- [ ] **App Info & Performance:** Crash logs, diagnostics
- [ ] **Device/Other IDs:** Advertising ID (if using ads)

#### Data Usage

```
✓ App Functionality - All collected data
✓ Analytics - Usage data only
✗ Advertising - Not used for ads (unless future ads)
✗ Third-Party Sharing - Data not shared
```

#### Privacy Policy URL

**Must Include:**
- What data is collected
- How data is used
- How data is stored and secured
- Third-party services (RevenueCat, Expo)
- User rights (access, delete, export)
- Contact information
- Effective date and update policy

**Host at:** `https://astro.app/privacy`

**Template Structure:**
```markdown
# Privacy Policy

Last Updated: [Date]

## Introduction
Astro ("we", "our") respects your privacy...

## Data We Collect
- Email address
- Birth date, time, and location
- Prediction history
- Device information
- Usage analytics

## How We Use Data
- Provide personalized predictions
- Improve our services
- Send notifications (with permission)
- Process subscriptions

## Data Storage
- Encrypted at rest and in transit
- Stored on secure servers (AWS/GCP)
- Retained until account deletion

## Third-Party Services
- RevenueCat (subscription management)
- Expo (push notifications)
- [Analytics provider]

## Your Rights
- Access your data
- Delete your data
- Export your data
- Opt out of notifications

## Contact
support@astro.app

## Children's Privacy
Not intended for users under 13.

## Changes
We may update this policy. Check regularly.
```

---

## Review Guidelines Compliance

### Apple App Store Review Guidelines

#### Key Guidelines to Follow

**4.2 Minimum Functionality**
- [ ] App is not just a website wrapper
- [ ] Provides value beyond a Safari bookmark
- [ ] Native features: push notifications, biometric auth, offline mode

**4.5.2 Astrology/Fortune Telling**
- [ ] ✅ ALLOWED: Apps for entertainment purposes with prominent disclaimer
- [ ] ❌ NOT ALLOWED: Claiming medical or health benefits
- [ ] **Compliance:** Show "For entertainment purposes only" on onboarding and before predictions

**4.7 Minigames, Contests, etc.**
- [ ] Not applicable (no gambling elements)

**5.1.1 Data Collection and Storage**
- [ ] Privacy policy URL provided
- [ ] App Privacy disclosures accurate
- [ ] User consent for data collection
- [ ] No data shared with third parties without disclosure

**5.1.2 Data Use and Sharing**
- [ ] Only collect data necessary for app functionality
- [ ] Encrypt sensitive data
- [ ] Allow users to delete account and data

**3.1.1 In-App Purchase**
- [ ] All digital goods purchased via IAP (not direct payment)
- [ ] Subscriptions auto-renewable
- [ ] Restore purchases available
- [ ] Clear pricing and terms

**3.1.2 Subscriptions**
- [ ] Free trial clearly disclosed (7 days)
- [ ] Auto-renewal clearly disclosed
- [ ] Cancellation instructions provided
- [ ] Pricing displayed in local currency

**2.3.10 Accurate Metadata**
- [ ] Screenshots show actual app content
- [ ] Description matches app functionality
- [ ] No misleading claims

### Google Play Store Policies

#### Key Policies to Follow

**Restricted Content: Gambling**
- [ ] ✅ COMPLIANT: Astrology for entertainment (not gambling)
- [ ] No real-money gambling mechanics
- [ ] No prize competitions

**Restricted Content: Financial Services**
- [ ] ❌ NOT FINANCIAL ADVICE: Clear disclaimers
- [ ] Not a trading platform (predictions only)
- [ ] No direct crypto transactions

**User Data: Privacy**
- [ ] Privacy policy URL in app and store
- [ ] Data Safety form completed
- [ ] User consent for data collection
- [ ] Secure data transmission (HTTPS)

**Subscriptions**
- [ ] Clear disclosure of pricing and terms
- [ ] Free trial period disclosed
- [ ] Cancellation policy clear
- [ ] Restore purchases functional

**Intellectual Property**
- [ ] All assets are original or licensed
- [ ] No trademark violations
- [ ] Proper attribution for third-party content

---

## Age Rating

### Apple App Store Age Rating

**Questionnaire Results:**
- Cartoon or Fantasy Violence: **None**
- Realistic Violence: **None**
- Sexual Content or Nudity: **None**
- Profanity or Crude Humor: **None**
- Alcohol, Tobacco, or Drug Use: **None**
- Mature/Suggestive Themes: **Infrequent/Mild** (fortune telling)
- Horror/Fear Themes: **None**
- Gambling: **None**
- Contests: **None**
- Uncontrolled User Generated Content: **None**

**Result:** **12+** (Due to "Infrequent/Mild Simulated Gambling" or "Realistic Themes")

**Note:** Apple may classify astrology/fortune telling as "Mature/Suggestive Themes" requiring 12+ rating.

### Google Play Content Rating

**IARC (International Age Rating Coalition) Questionnaire:**

**Violence:**
- Does your app contain violent content? **No**

**Sexuality:**
- Does your app contain sexual content? **No**

**Language:**
- Does your app contain bad language? **No**

**Controlled Substances:**
- Does your app contain drug, alcohol, or tobacco content? **No**

**Gambling:**
- Can users wager real-world money? **No**
- Does your app simulate gambling? **No** (astrology is not gambling)

**Result:** **ESRB E10+ (Everyone 10+)** or **PEGI 12**

**Select Target Audience:**
- [ ] Target age: **13+** (recommended for maturity)
- [ ] Not designed for children under 13

---

## Submission Checklist

### Pre-Submission Testing

- [ ] **Functionality:** All features work on test devices
- [ ] **IAP:** Subscriptions purchase, restore, and sync correctly
- [ ] **Push:** Notifications send and deep link correctly
- [ ] **Biometric:** Face ID/Touch ID/Fingerprint work
- [ ] **Offline:** App works offline for cached content
- [ ] **Performance:** No crashes, 60fps, <2s launch
- [ ] **Accessibility:** VoiceOver/TalkBack compatible
- [ ] **Different Devices:** Tested on iPhone, iPad, various Android devices
- [ ] **Different OS:** Tested on iOS 15-17, Android 10-14

### App Store Connect (iOS) Submission

#### Step 1: Prepare Assets
- [ ] App icon (1024x1024, no alpha)
- [ ] Screenshots (6.5" required, others optional)
- [ ] App preview video (optional, 15-30s)
- [ ] Privacy policy (live URL)
- [ ] Support URL
- [ ] Marketing URL (optional)

#### Step 2: Create App Record
1. [ ] Login to [App Store Connect](https://appstoreconnect.apple.com)
2. [ ] Click "My Apps" → "+" → "New App"
3. [ ] Fill in:
   - Platform: iOS
   - Name: Astro - Crypto Predictions
   - Primary Language: English (US)
   - Bundle ID: com.astro.mobile
   - SKU: astro-mobile-001

#### Step 3: Configure App Information
- [ ] **Category:** Primary: Finance, Secondary: Lifestyle
- [ ] **Age Rating:** Complete questionnaire → 12+
- [ ] **Copyright:** © 2025 Astro Inc.
- [ ] **Privacy Policy URL:** https://astro.app/privacy
- [ ] **App Subtitle:** Astrology-powered trading insights

#### Step 4: Configure Pricing & Availability
- [ ] **Price:** Free (with in-app purchases)
- [ ] **Availability:** All countries (or select specific ones)
- [ ] **Pre-Orders:** No

#### Step 5: Configure In-App Purchases
- [ ] Basic Monthly subscription approved and ready
- [ ] Pro Monthly subscription approved and ready
- [ ] Subscription group configured
- [ ] Free trial (7 days) configured

#### Step 6: Prepare for Submission
- [ ] **Version:** 1.0.0
- [ ] **Build:** Select uploaded build from TestFlight
- [ ] **What's New:** "Initial release with personalized crypto predictions"
- [ ] **Promotional Text:** (see template above)
- [ ] **Description:** (see template above)
- [ ] **Keywords:** (see ASO section)
- [ ] **Screenshots:** Upload all required sizes
- [ ] **App Review Information:**
   - Demo account email: demo@astro.app
   - Demo account password: Demo123!
   - Notes: "Test IAP with sandbox account"

#### Step 7: Submit for Review
- [ ] Review all information
- [ ] Click "Submit for Review"
- [ ] Monitor status daily
- [ ] Respond to any questions within 24 hours

**Expected Review Time:** 1-3 days (can be faster)

---

### Google Play Console (Android) Submission

#### Step 1: Prepare Assets
- [ ] App icon (512x512, 32-bit PNG with alpha)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone: 2-8, tablet: optional)
- [ ] Privacy policy (live URL)

#### Step 2: Create App
1. [ ] Login to [Google Play Console](https://play.google.com/console)
2. [ ] Click "Create app"
3. [ ] Fill in:
   - App name: Astro - Crypto Predictions
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free
   - Declarations: Accept

#### Step 3: Set Up App
- [ ] **App access:** Not restricted (no login required for testing)
- [ ] **Ads:** Contains ads? No (unless using ads)
- [ ] **Content rating:** Complete questionnaire → E10+
- [ ] **Target audience:** Age 13+
- [ ] **News app:** No
- [ ] **COVID-19 contact tracing:** No
- [ ] **Data safety:** Complete form (see privacy section)

#### Step 4: Store Listing
- [ ] **App name:** Astro - Crypto Predictions
- [ ] **Short description:** (80 char, see template)
- [ ] **Full description:** (see template)
- [ ] **App icon:** Upload 512x512 PNG
- [ ] **Feature graphic:** Upload 1024x500
- [ ] **Phone screenshots:** Upload 2-8
- [ ] **7-inch tablet:** Optional
- [ ] **10-inch tablet:** Optional

#### Step 5: Main Store Listing
- [ ] **App category:** Finance
- [ ] **Tags:** Select up to 5
- [ ] **Email:** support@astro.app
- [ ] **Phone:** (optional)
- [ ] **Website:** https://astro.app
- [ ] **Privacy policy:** https://astro.app/privacy

#### Step 6: Pricing & Distribution
- [ ] **Countries:** All countries (or select)
- [ ] **Price:** Free (with in-app purchases)
- [ ] **Distributed on:** Google Play Store
- [ ] **Content guidelines:** Accept
- [ ] **US export laws:** Accept

#### Step 7: Configure In-App Products
- [ ] Create basic_monthly subscription
- [ ] Create pro_monthly subscription
- [ ] Configure free trial offers
- [ ] Activate subscriptions

#### Step 8: Create Release
- [ ] **Production track** (or internal/closed for testing)
- [ ] **Release name:** 1.0.0
- [ ] **Release notes:** "Initial release"
- [ ] **Upload AAB:** Upload Android App Bundle
- [ ] Review warnings (resolve critical ones)

#### Step 9: Rollout
- [ ] **Staged rollout:** 10% initially (recommended)
- [ ] **Review release:** Check all info
- [ ] **Start rollout to production**

**Expected Review Time:** 1-7 days (typically 1-3 days)

---

## Post-Submission Monitoring

### iOS
- [ ] Check status in App Store Connect daily
- [ ] Respond to any reviewer questions within 24 hours
- [ ] Monitor crash reports in Xcode Organizer
- [ ] Check TestFlight for any issues
- [ ] Prepare for potential rejection and resubmission

### Android
- [ ] Check status in Play Console
- [ ] Monitor pre-launch report
- [ ] Check for policy violations
- [ ] Monitor crash reports in Play Console
- [ ] Gradually increase rollout percentage

---

## Common Rejection Reasons & Solutions

### iOS Rejections

**Guideline 2.1 - Performance: App Completeness**
- *Reason:* App crashes or has major bugs
- *Solution:* Test thoroughly, fix crashes, resubmit

**Guideline 4.3 - Spam**
- *Reason:* Too similar to existing apps
- *Solution:* Highlight unique features (astrology + crypto combo)

**Guideline 5.1.1 - Privacy**
- *Reason:* Privacy policy missing or inaccurate
- *Solution:* Ensure policy is live and matches App Privacy disclosures

**Guideline 3.1.1 - IAP**
- *Reason:* Restore purchases not working or not visible
- *Solution:* Add prominent "Restore Purchases" button, test thoroughly

### Android Rejections

**Violation of Google Play Policies**
- *Reason:* Misleading content or gambling
- *Solution:* Add clear disclaimers, remove any gambling-like mechanics

**Privacy Policy Issues**
- *Reason:* Privacy policy not accessible or incomplete
- *Solution:* Ensure URL works and covers all data collection

**Target Audience**
- *Reason:* App contains content not suitable for selected age
- *Solution:* Adjust age rating or remove inappropriate content

---

## Resources

### Apple
- [App Store Connect](https://appstoreconnect.apple.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [TestFlight](https://developer.apple.com/testflight/)

### Google
- [Google Play Console](https://play.google.com/console)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Material Design](https://material.io/design)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)

### ASO Tools
- [App Annie](https://www.appannie.com/)
- [Sensor Tower](https://sensortower.com/)
- [App Radar](https://appradar.com/)

### Testing
- [TestFlight (iOS)](https://testflight.apple.com/)
- [Google Play Internal Testing](https://support.google.com/googleplay/android-developer/answer/9845334)

---

## Final Checklist

Before hitting "Submit for Review":

- [ ] All features thoroughly tested
- [ ] No crashes or major bugs
- [ ] IAP subscriptions working perfectly
- [ ] Privacy policy live and accurate
- [ ] Terms of service live
- [ ] Support email active (support@astro.app)
- [ ] Demo account credentials provided (for reviewers)
- [ ] Entertainment disclaimer visible
- [ ] Age rating appropriate
- [ ] All screenshots uploaded
- [ ] App description compelling and accurate
- [ ] Keywords optimized
- [ ] Restore purchases button visible
- [ ] Biometric auth working
- [ ] Push notifications configured
- [ ] Offline mode functional
- [ ] Deep linking tested
- [ ] Team ready to respond to reviewer questions

**Good luck with your submission! 🚀**
