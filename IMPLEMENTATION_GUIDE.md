# Verbify Subscription Implementation Guide

## 1. Install Dependencies

```bash
npm install react-native-purchases
npx pod-install
```

## 2. Environment Variables (.env.local)

```bash
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_api_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_api_key
```

## 3. Convex Schema Update

Add to `convex/schema.ts`:

```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  
  // Subscription fields
  subscriptionTier: v.union(
    v.literal("free"),
    v.literal("pro"), 
    v.literal("business")
  ),
  subscriptionStatus: v.optional(v.union(
    v.literal("active"),
    v.literal("past_due"),
    v.literal("canceled"),
    v.literal("trial"),
    v.literal("expired")
  )),
  subscriptionExpiresAt: v.optional(v.number()),
  revenuecat_customerId: v.optional(v.string()),
  
  // Usage tracking
  videosThisMonth: v.number(),
  monthlyResetDate: v.number(),
  totalVideosCreated: v.number(),
  
  // Trial
  trialUsed: v.boolean(),
  trialStartedAt: v.optional(v.number()),
  trialEndsAt: v.optional(v.number()),
}).index("by_clerk", ["clerkId"]),
```

## 4. Convex Mutations

Create `convex/subscriptions.ts`:

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    status: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      subscriptionTier: args.tier,
      subscriptionStatus: args.status as any,
      subscriptionExpiresAt: args.expiresAt,
    });
  },
});

export const canCreateVideo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return false;
    
    // Pro/Business users have unlimited
    if (user.subscriptionTier === "pro" || user.subscriptionTier === "business") {
      return true;
    }
    
    // Free tier: check monthly limit
    const now = Date.now();
    const monthStart = new Date(now).setDate(1);
    
    if (user.monthlyResetDate < monthStart) {
      // Reset monthly count
      await ctx.db.patch(args.userId, {
        videosThisMonth: 0,
        monthlyResetDate: now,
      });
      return true;
    }
    
    return user.videosThisMonth < 3; // Free tier limit
  },
});

export const incrementVideoCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    
    await ctx.db.patch(args.userId, {
      videosThisMonth: (user.videosThisMonth || 0) + 1,
      totalVideosCreated: (user.totalVideosCreated || 0) + 1,
    });
  },
});
```

## 5. RevenueCat Service

Create `src/services/purchases.ts`:

```typescript
import Purchases, { PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY = Platform.OS === 'ios' 
  ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!
  : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

export const initializePurchases = async (userId: string) => {
  try {
    await Purchases.configure({
      apiKey: API_KEY,
      appUserID: userId,
    });
    
    // Enable debug logs in development
    if (__DEV__) {
      await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }
  } catch (error) {
    console.error('Failed to initialize purchases:', error);
  }
};

export const getOfferings = async (): Promise<PurchasesOffering[]> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.all;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
};

export const purchasePackage = async (packageToPurchase: any) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('Purchase failed:', error);
    }
    throw error;
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
};

export const checkSubscriptionStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlements = customerInfo.entitlements.active;
    
    return {
      isPro: 'pro' in entitlements,
      isBusiness: 'business' in entitlements,
      expiresAt: entitlements['pro']?.expirationDate || 
                 entitlements['business']?.expirationDate,
    };
  } catch (error) {
    console.error('Failed to check subscription:', error);
    return { isPro: false, isBusiness: false, expiresAt: null };
  }
};
```

## 6. Paywall Component

Create `src/components/PaywallModal.tsx`:

```typescript
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Purchases from "react-native-purchases";
import type { PurchasesPackage } from "react-native-purchases";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

export const PaywallModal = ({
  visible,
  onClose,
  onPurchaseSuccess,
}: PaywallModalProps) => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
        // Pre-select annual package
        const annual = offerings.current.availablePackages.find(
          (p) => p.packageType === "ANNUAL"
        );
        setSelectedPackage(annual || offerings.current.availablePackages[0]);
      }
    } catch (error) {
      console.error("Failed to load offerings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      if (customerInfo.entitlements.active["pro"] || 
          customerInfo.entitlements.active["business"]) {
        Alert.alert(
          "Success!",
          "Welcome to Verbify Pro! You now have unlimited access.",
          [{ text: "Get Started", onPress: onPurchaseSuccess }]
        );
        onClose();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert("Error", "Purchase failed. Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        Alert.alert(
          "Restored!",
          "Your subscription has been restored.",
          [{ text: "OK", onPress: onPurchaseSuccess }]
        );
        onClose();
      } else {
        Alert.alert("No Purchases", "No active subscriptions found.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to restore purchases.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-dark">
        <View className="flex-row justify-between items-center p-6">
          <Text className="text-white text-2xl font-Poppins_700Bold">
            Upgrade to Pro
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Features */}
          <View className="mb-8">
            <Feature icon="infinite" text="Unlimited videos" />
            <Feature icon="sparkles" text="AI voice generation" />
            <Feature icon="color-wand" text="Advanced caption styles" />
            <Feature icon="download" text="Export without watermark" />
            <Feature icon="flash" text="Priority processing" />
            <Feature icon="mail" text="Email support" />
          </View>

          {/* Packages */}
          {loading ? (
            <ActivityIndicator size="large" color="#3B82F6" />
          ) : (
            <View className="mb-6">
              {packages.map((pkg) => (
                <PackageOption
                  key={pkg.identifier}
                  package={pkg}
                  selected={selectedPackage?.identifier === pkg.identifier}
                  onSelect={() => setSelectedPackage(pkg)}
                />
              ))}
            </View>
          )}

          {/* Purchase Button */}
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={!selectedPackage || purchasing}
            className="bg-primary rounded-xl p-4 mb-4"
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-Poppins_600SemiBold">
                Start Free Trial
              </Text>
            )}
          </TouchableOpacity>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} className="mb-4">
            <Text className="text-gray-400 text-center font-Poppins_500Medium">
              Restore Purchases
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text className="text-gray-500 text-xs text-center mb-8">
            7-day free trial, then {selectedPackage?.product.priceString}/
            {selectedPackage?.packageType === "ANNUAL" ? "year" : "month"}.
            Cancel anytime. Terms apply.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

const Feature = ({ icon, text }: { icon: string; text: string }) => (
  <View className="flex-row items-center mb-4">
    <Ionicons name={icon as any} size={24} color="#3B82F6" />
    <Text className="text-white text-base font-Poppins_500Medium ml-3">
      {text}
    </Text>
  </View>
);

const PackageOption = ({ package: pkg, selected, onSelect }: any) => (
  <TouchableOpacity
    onPress={onSelect}
    className={\`rounded-xl p-4 mb-3 border-2 \${
      selected ? "border-primary bg-primary/10" : "border-gray-700 bg-[#1A1A1A]"
    }\`}
  >
    <View className="flex-row justify-between items-center">
      <View>
        <Text className="text-white text-lg font-Poppins_600SemiBold">
          {pkg.product.title}
        </Text>
        <Text className="text-gray-400 text-sm font-Poppins_400Regular">
          {pkg.product.description}
        </Text>
      </View>
      <Text className="text-white text-xl font-Poppins_700Bold">
        {pkg.product.priceString}
      </Text>
    </View>
    {pkg.packageType === "ANNUAL" && (
      <View className="bg-green-500/20 rounded-full px-3 py-1 self-start mt-2">
        <Text className="text-green-500 text-xs font-Poppins_600SemiBold">
          SAVE 33%
        </Text>
      </View>
    )}
  </TouchableOpacity>
);
```

## 7. Usage in App

Update `src/app/_layout.tsx`:

```typescript
import { initializePurchases } from '@/services/purchases';

useEffect(() => {
  if (user?.id) {
    initializePurchases(user.id);
  }
}, [user]);
```

Update file upload to check limits:

```typescript
const canCreate = await canCreateVideo({ userId });

if (!canCreate) {
  setShowPaywall(true);
  return;
}

// Continue with upload...
await incrementVideoCount({ userId });
```

## 8. App Store Connect Configuration

### Create Subscription Group
1. Go to App Store Connect
2. My Apps → Your App → Subscriptions
3. Create Subscription Group: "Verbify Pro"

### Add Subscriptions
1. **Pro Monthly**: $9.99/month
   - Reference Name: "Pro Monthly"
   - Product ID: "verbify_pro_monthly"
   - Subscription Duration: 1 month
   - Free Trial: 7 days

2. **Pro Annual**: $79.99/year
   - Reference Name: "Pro Annual"  
   - Product ID: "verbify_pro_annual"
   - Subscription Duration: 1 year
   - Free Trial: 7 days

### Configure in RevenueCat
1. Create account at revenuecat.com
2. Add your app
3. Configure Apple App Store
4. Create entitlements: "pro", "business"
5. Link products to entitlements

## 9. Testing

```typescript
// Test paywall
<PaywallModal 
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
  onPurchaseSuccess={() => {
    // Refresh user data
    refetchUser();
  }}
/>
```

## 10. Analytics to Track

- Paywall impressions
- Conversion rate
- Revenue
- Churn rate
- Feature usage by tier
- Trial to paid conversion

## Next Steps

1. Implement usage limits
2. Add paywall at key points
3. Test purchase flow (sandbox)
4. Submit for App Store review
5. Monitor analytics
6. Iterate on pricing
