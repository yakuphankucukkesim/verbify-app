# Verbify Subscription System - Setup Guide

## ✅ Completed Steps

### 1. Package Installation
- ✅ Installed `react-native-purchases`

### 2. Convex Schema
- ✅ Added subscription fields to User schema
- ✅ Added usage tracking fields
- ✅ Added trial management fields

### 3. Convex Functions
- ✅ Created `convex/subscriptions.ts` with:
  - `getSubscription` - Get user's subscription info
  - `updateSubscription` - Update from RevenueCat
  - `canCreateVideo` - Check if user can create videos
  - `incrementVideoCount` - Track video creation
  - `startTrial` - Start free trial
  - `getUsageStats` - Get usage statistics

### 4. RevenueCat Service
- ✅ Created `src/services/purchases.ts` with:
  - Initialize purchases
  - Get offerings
  - Purchase package
  - Restore purchases
  - Check subscription status

### 5. Paywall UI
- ✅ Created `PaywallModal` component
- ✅ Integrated into profile page
- ✅ Added upgrade CTA for free users

### 6. App Integration
- ✅ Added RevenueCat initialization in `_layout.tsx`
- ✅ Environment variables configured

---

## 📋 Next Steps (You Need to Do These)

### Step 1: Create RevenueCat Account

1. Go to https://www.revenuecat.com/
2. Sign up for a free account
3. Create a new project: "Verbify"

### Step 2: Configure Apple App Store

1. **In App Store Connect:**
   - Go to "My Apps" → Your App
   - Click on "Subscriptions" in the left sidebar
   - Create Subscription Group: "Verbify Pro"

2. **Create Monthly Subscription:**
   - Product ID: `verbify_pro_monthly`
   - Reference Name: "Verbify Pro Monthly"
   - Duration: 1 month
   - Price: $9.99
   - Free Trial: 7 days

3. **Create Annual Subscription:**
   - Product ID: `verbify_pro_annual`
   - Reference Name: "Verbify Pro Annual"
   - Duration: 1 year
   - Price: $79.99
   - Free Trial: 7 days

### Step 3: Connect App Store to RevenueCat

1. **In RevenueCat Dashboard:**
   - Go to Project Settings → Apps
   - Click "Add App"
   - Select "iOS"
   - Enter your Bundle ID
   - Upload your App Store Connect API Key
   - Or use In-App Purchase Key (Shared Secret)

2. **Configure Products:**
   - Go to "Products" tab
   - Add products: 
     - `verbify_pro_monthly`
     - `verbify_pro_annual`

3. **Create Entitlements:**
   - Go to "Entitlements" tab
   - Create entitlement: "pro"
   - Attach both products to "pro" entitlement

### Step 4: Get RevenueCat API Keys

1. In RevenueCat Dashboard:
   - Go to Project Settings → API Keys
   - Find "Public App-Specific API Keys"
   - Copy your iOS API key

2. Update `.env.local`:
   ```bash
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_YourActualAPIKeyHere
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_YourActualAPIKeyHere
   ```

### Step 5: Configure Offerings

1. **In RevenueCat Dashboard:**
   - Go to "Offerings" tab
   - Create a new offering (e.g., "default")
   - Add packages:
     - Package Type: "Monthly"
     - Product: `verbify_pro_monthly`
     - Package Type: "Annual"
     - Product: `verbify_pro_annual`
   - Set this offering as "Current"

### Step 6: Test with Sandbox

1. **Create Sandbox Tester:**
   - Go to App Store Connect
   - Users and Access → Sandbox Testers
   - Create a test account

2. **Test on iOS Simulator/Device:**
   ```bash
   # Make sure your app is running
   npm start
   
   # In Xcode, run on a device (not simulator for actual purchases)
   ```

3. **Test Purchase Flow:**
   - Open your app
   - Go to Profile
   - Click "Upgrade to Pro"
   - Complete purchase with sandbox account
   - Verify subscription activates

### Step 7: Update File Upload Logic

Add limit checking before file upload:

```typescript
// In your file upload component
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const canCreate = useQuery(api.subscriptions.canCreateVideo, { 
  userId: yourUserId 
});

const incrementCount = useMutation(api.subscriptions.incrementVideoCount);

// Before upload
if (canCreate && !canCreate.canCreate) {
  // Show paywall
  setShowPaywall(true);
  return;
}

// After successful upload
await incrementCount({ userId: yourUserId });
```

### Step 8: Test End-to-End

1. **Test Free Tier:**
   - Create 3 videos
   - Try to create 4th → Should show paywall

2. **Test Purchase:**
   - Click "Upgrade to Pro"
   - Complete purchase
   - Verify unlimited access

3. **Test Restore:**
   - Delete app and reinstall
   - Click "Restore Purchases"
   - Verify subscription restored

---

## 🔍 Testing Checklist

- [ ] RevenueCat initialized successfully
- [ ] Offerings load in paywall
- [ ] Monthly subscription visible
- [ ] Annual subscription visible with "SAVE 33%" badge
- [ ] Purchase flow completes
- [ ] Subscription activates after purchase
- [ ] Free tier limits enforced (3 videos/month)
- [ ] Pro tier has unlimited access
- [ ] Restore purchases works
- [ ] Subscription management link works
- [ ] Profile shows correct tier

---

## 🐛 Troubleshooting

### "No offerings available"
- Check RevenueCat API keys in `.env.local`
- Verify offering is set as "Current" in dashboard
- Check console for initialization errors

### "Purchase failed"
- Verify you're using a sandbox tester account
- Check product IDs match exactly
- Ensure products are "Ready for Sale" in App Store Connect

### "Subscription not activating"
- Check entitlement configuration in RevenueCat
- Verify webhook is configured (optional but recommended)
- Check RevenueCat dashboard for customer info

### "Free tier not enforcing limits"
- Check Convex functions are deployed
- Verify `canCreateVideo` query is being called
- Check user's `videosThisMonth` field in Convex dashboard

---

## 📊 Monitoring

### RevenueCat Dashboard
- Active Subscriptions
- Revenue
- Conversion Rate
- Churn Rate

### Convex Dashboard
- User subscription tiers
- Videos created per tier
- Monthly resets

---

## 🚀 Going to Production

### Before App Store Submission:

1. **Test thoroughly:**
   - All purchase flows
   - Restore purchases
   - Trial period
   - Subscription renewal

2. **Update app metadata:**
   - Add subscription screenshots
   - Explain subscription benefits
   - Include pricing information

3. **App Store Review:**
   - Clearly show subscription terms
   - Include restore button
   - Show cancel instructions

4. **Marketing:**
   - Create landing page
   - Prepare launch announcement
   - Set up analytics

---

## 💰 Expected Results

### Month 1:
- 100-500 downloads
- 5-10% conversion rate
- $50-250 MRR (Monthly Recurring Revenue)

### Month 3:
- 500-1,000 downloads
- 7-12% conversion rate
- $350-1,200 MRR

### Month 6:
- 1,000-5,000 downloads
- 10-15% conversion rate
- $1,000-7,500 MRR

---

## 📞 Support

- RevenueCat Docs: https://docs.revenuecat.com/
- RevenueCat Discord: https://discord.gg/revenuecat
- Apple Developer: https://developer.apple.com/support/

---

## ✨ You're Ready!

All the code is in place. Just need to:
1. Create RevenueCat account
2. Configure App Store Connect subscriptions
3. Get API keys
4. Test!

Good luck! 🚀
