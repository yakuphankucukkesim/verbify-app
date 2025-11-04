# Verbify Monetization Plan

## Pricing Strategy

### Free Tier
- 3 videos per month
- Basic AI captions
- Export with watermark
- Standard processing speed
- Community support

### Pro Tier - $9.99/month or $79.99/year (Save 33%)
- Unlimited videos
- AI voice generation
- No watermark
- Priority processing
- Advanced caption styles
- Custom fonts & colors
- Email support

### Business Tier - $29.99/month or $249.99/year
- Everything in Pro
- Bulk video processing
- API access (coming soon)
- Team collaboration (up to 5 users)
- Custom branding
- Priority support
- Early access to new features

## Implementation Steps

### 1. App Store Connect Setup
1. Create subscription groups
2. Set up subscription products
3. Configure pricing for different countries
4. Set up promotional offers

### 2. RevenueCat Integration
```typescript
// Install
npm install react-native-purchases

// Configure
import Purchases from 'react-native-purchases';

await Purchases.configure({
  apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY!,
});
```

### 3. Convex Schema Update
```typescript
// users table
subscriptionTier: v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("business")
),
subscriptionStatus: v.union(
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("trial")
),
subscriptionExpiresAt: v.optional(v.number()),
videosThisMonth: v.number(), // Reset monthly
trialEndsAt: v.optional(v.number()),
```

### 4. Usage Tracking
Track usage in Convex:
- Videos created this month
- Captions generated
- AI voice generations
- Export count

### 5. Paywall Screens
Create paywall screens:
- After 3rd video (free tier limit)
- When trying to use pro features
- On profile page
- After successful caption generation (upsell)

## Revenue Projections

### Conservative Estimate (6 months)
- 1,000 downloads
- 5% conversion to Pro ($9.99/mo) = 50 users = $499.50/mo
- 1% conversion to Business ($29.99/mo) = 10 users = $299.90/mo
- **Total: ~$800/month = $9,600/year**

### Optimistic Estimate (1 year)
- 10,000 downloads
- 7% conversion to Pro = 700 users = $6,993/mo
- 2% conversion to Business = 200 users = $5,998/mo
- **Total: ~$13,000/month = $156,000/year**

## Key Features to Gate

### Free → Pro Upgrades
1. Remove watermark
2. AI voice generation
3. Unlimited videos
4. Advanced caption styles
5. Custom fonts & colors
6. Priority processing

### Pro → Business Upgrades
1. Team collaboration
2. Bulk processing
3. API access
4. Custom branding
5. White-label options

## Marketing Strategy

### App Store Optimization
- Screenshots showing before/after
- Video preview demonstrating AI features
- Highlight "No watermark" in Pro tier
- Show speed comparison

### Launch Promotion
- 7-day free trial for Pro
- 50% off first month
- Lifetime deal for early adopters

### Retention
- Send usage reports monthly
- Feature highlight emails
- Success stories
- Tips & tricks

## Technical Implementation Priority

1. **Week 1-2**: RevenueCat setup + Basic paywall
2. **Week 3**: Usage tracking in Convex
3. **Week 4**: Paywall UI/UX polish
4. **Week 5**: Analytics & A/B testing setup
5. **Week 6**: App Store submission

## Additional Revenue Streams

### Future Opportunities
1. **One-time purchases**
   - Premium caption packs ($2.99)
   - Voice bundles ($4.99)
   - Template collections ($9.99)

2. **Enterprise/API**
   - Custom pricing for high-volume users
   - White-label solutions

3. **Affiliate/Referral**
   - Give 1 month free for referrals
   - Earn commission from ElevenLabs referrals

## Cost Considerations

### Monthly Costs (estimated)
- ElevenLabs API: $0-500 (usage based)
- Convex: $0-25 (free tier initially)
- RevenueCat: $0 (free up to 10k subscribers)
- Apple Developer: $99/year
- **Total: ~$100-600/month**

### Break-even
- Need ~10-60 Pro subscribers to break even
- Should achieve in first 1-2 months

## Legal Requirements

### Must Have
- Privacy Policy ✓ (already created)
- Terms of Service ✓ (already created)
- EULA (End User License Agreement)
- Refund policy
- Subscription terms clearly stated

### Apple Requirements
- Clearly show subscription duration
- Show price in user's currency
- Cancel anytime message
- Auto-renewal information
- Free trial terms

## Success Metrics

### Track These KPIs
1. Download to trial conversion
2. Trial to paid conversion
3. Monthly recurring revenue (MRR)
4. Customer lifetime value (LTV)
5. Churn rate
6. Average revenue per user (ARPU)

### Target Metrics
- Trial to paid: >25%
- Monthly churn: <5%
- LTV: >$100
- CAC (Customer Acquisition Cost): <$30

## Next Steps

1. ✅ Create pricing strategy
2. ⬜ Set up RevenueCat account
3. ⬜ Configure App Store Connect subscriptions
4. ⬜ Update Convex schema for subscriptions
5. ⬜ Build paywall components
6. ⬜ Implement usage tracking
7. ⬜ Add subscription management to profile
8. ⬜ Test purchase flow
9. ⬜ Submit to App Store for review
10. ⬜ Launch with promotional pricing

## Resources

- RevenueCat Docs: https://www.revenuecat.com/docs
- Apple Subscriptions: https://developer.apple.com/app-store/subscriptions/
- Pricing Psychology: https://www.priceintelligently.com/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
