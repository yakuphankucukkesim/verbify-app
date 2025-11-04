import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";

const API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "";
const API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || "";

const API_KEY = Platform.OS === "ios" ? API_KEY_IOS : API_KEY_ANDROID;

export const initializePurchases = async (userId: string) => {
  try {
    // Skip initialization if API key is not configured or is placeholder
    if (!API_KEY || API_KEY === "your_ios_api_key_here" || API_KEY === "your_android_api_key_here") {
      console.log("⏭️ RevenueCat skipped - API key not configured yet");
      return;
    }

    await Purchases.configure({
      apiKey: API_KEY,
      appUserID: userId,
    });

    // Enable debug logs in development
    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    console.log("✅ RevenueCat initialized for user:", userId);
  } catch (error) {
    console.error("Failed to initialize purchases:", error);
  }
};

export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    if (!API_KEY || API_KEY === "your_ios_api_key_here" || API_KEY === "your_android_api_key_here") {
      return null;
    }
    
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      console.log("✅ Loaded offerings:", offerings.current.identifier);
      return offerings.current;
    }
    console.warn("No current offering available");
    return null;
  } catch (error) {
    console.error("Failed to get offerings:", error);
    return null;
  }
};

export const purchasePackage = async (
  packageToPurchase: PurchasesPackage
): Promise<CustomerInfo> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    console.log("✅ Purchase successful");
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("User cancelled purchase");
    } else {
      console.error("Purchase failed:", error);
    }
    throw error;
  }
};

export const restorePurchases = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log("✅ Purchases restored");
    return customerInfo;
  } catch (error) {
    console.error("Restore failed:", error);
    throw error;
  }
};

export const checkSubscriptionStatus = async () => {
  try {
    if (!API_KEY || API_KEY === "your_ios_api_key_here" || API_KEY === "your_android_api_key_here") {
      return {
        tier: "free" as const,
        isPro: false,
        isBusiness: false,
        isTrial: false,
        expiresAt: null,
        customerInfo: null,
      };
    }
    
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlements = customerInfo.entitlements.active;

    const isPro = "pro" in entitlements;
    const isBusiness = "business" in entitlements;
    const isTrial = customerInfo.entitlements.active["pro"]?.periodType === "trial";

    let tier: "free" | "pro" | "business" = "free";
    if (isBusiness) tier = "business";
    else if (isPro) tier = "pro";

    const expiresAt =
      entitlements["pro"]?.expirationDate ||
      entitlements["business"]?.expirationDate;

    return {
      tier,
      isPro,
      isBusiness,
      isTrial,
      expiresAt,
      customerInfo,
    };
  } catch (error) {
    console.error("Failed to check subscription:", error);
    return {
      tier: "free" as const,
      isPro: false,
      isBusiness: false,
      isTrial: false,
      expiresAt: null,
      customerInfo: null,
    };
  }
};

export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    if (!API_KEY || API_KEY === "your_ios_api_key_here" || API_KEY === "your_android_api_key_here") {
      return null;
    }
    
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("Failed to get customer info:", error);
    return null;
  }
};

// Helper to check if user has active subscription
export const hasActiveSubscription = async (): Promise<boolean> => {
  const status = await checkSubscriptionStatus();
  return status.isPro || status.isBusiness;
};

// Helper to get subscription tier
export const getSubscriptionTier = async (): Promise<"free" | "pro" | "business"> => {
  const status = await checkSubscriptionStatus();
  return status.tier;
};
