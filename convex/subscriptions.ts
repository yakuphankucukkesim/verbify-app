import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get user's subscription info
export const getSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      tier: user.subscriptionTier || "free",
      status: user.subscriptionStatus || "active",
      expiresAt: user.subscriptionExpiresAt,
      videosThisMonth: user.videosThisMonth || 0,
      totalVideos: user.totalVideosCreated || 0,
    };
  },
});

// Update subscription from RevenueCat webhook
export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    status: v.string(),
    expiresAt: v.optional(v.number()),
    revenueCatCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      subscriptionTier: args.tier,
      subscriptionStatus: args.status as any,
      subscriptionExpiresAt: args.expiresAt,
      revenueCatCustomerId: args.revenueCatCustomerId,
    });

    return { success: true };
  },
});

// Check if user can create a video
export const canCreateVideo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { canCreate: false, reason: "User not found" };

    // Pro/Business users have unlimited
    const tier = user.subscriptionTier || "free";
    if (tier === "pro" || tier === "business") {
      return { canCreate: true, videosRemaining: -1 }; // -1 = unlimited
    }

    // Free tier: check monthly limit
    const now = Date.now();
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const resetDate = user.monthlyResetDate || 0;
    let videosThisMonth = user.videosThisMonth || 0;

    // Reset if new month
    if (resetDate < monthStart.getTime()) {
      videosThisMonth = 0;
    }

    const FREE_TIER_LIMIT = 3;
    const remaining = FREE_TIER_LIMIT - videosThisMonth;

    return {
      canCreate: remaining > 0,
      videosRemaining: remaining,
      limit: FREE_TIER_LIMIT,
      reason: remaining <= 0 ? "Monthly limit reached" : undefined,
    };
  },
});

// Increment video count after creation
export const incrementVideoCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const now = Date.now();
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const resetDate = user.monthlyResetDate || 0;
    let videosThisMonth = user.videosThisMonth || 0;

    // Reset if new month
    if (resetDate < monthStart.getTime()) {
      videosThisMonth = 0;
    }

    await ctx.db.patch(args.userId, {
      videosThisMonth: videosThisMonth + 1,
      monthlyResetDate: now,
      totalVideosCreated: (user.totalVideosCreated || 0) + 1,
    });

    return { success: true };
  },
});

// Start trial
export const startTrial = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    if (user.trialUsed) {
      throw new Error("Trial already used");
    }

    const now = Date.now();
    const trialEndDate = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.patch(args.userId, {
      subscriptionTier: "pro",
      subscriptionStatus: "trial",
      trialUsed: true,
      trialStartedAt: now,
      trialEndsAt: trialEndDate,
      subscriptionExpiresAt: trialEndDate,
    });

    return { success: true, expiresAt: trialEndDate };
  },
});

// Get usage stats for profile
export const getUsageStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const tier = user.subscriptionTier || "free";
    const videosThisMonth = user.videosThisMonth || 0;
    const totalVideos = user.totalVideosCreated || 0;

    let limit = 3; // Free tier
    if (tier === "pro" || tier === "business") {
      limit = -1; // Unlimited
    }

    return {
      tier,
      videosThisMonth,
      totalVideos,
      limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - videosThisMonth),
    };
  },
});
