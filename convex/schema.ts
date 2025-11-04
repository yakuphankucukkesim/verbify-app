import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const captionSegmentValidator = v.object({
  text: v.string(),
  start: v.number(),
  end: v.number(),
  type: v.union(v.literal('word'), v.literal('spacing'), v.literal('audio_event')),
  speaker_id: v.string(),
  characters: v.optional(
    v.array(
      v.object({
        text: v.string(),
        start: v.number(),
        end: v.number(),
      })
    )
  ),
});

export const User = {
    email: v.string(),
    externalId: v.string(),
    imageUrl: v.optional(v.string()),
    name: v.optional(v.string()),
    
    // Subscription fields
    subscriptionTier: v.optional(v.union(
        v.literal('free'),
        v.literal('pro'),
        v.literal('business')
    )),
    subscriptionStatus: v.optional(v.union(
        v.literal('active'),
        v.literal('trial'),
        v.literal('past_due'),
        v.literal('canceled'),
        v.literal('expired')
    )),
    subscriptionExpiresAt: v.optional(v.number()),
    revenueCatCustomerId: v.optional(v.string()),
    
    // Usage tracking
    videosThisMonth: v.optional(v.number()),
    monthlyResetDate: v.optional(v.number()),
    totalVideosCreated: v.optional(v.number()),
    
    // Trial
    trialUsed: v.optional(v.boolean()),
    trialStartedAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
};

const captionSettingsValidator = v.object({
  fontSize: v.number(),
  position: v.union(v.literal('top'), v.literal('middle'), v.literal('bottom')),
  color: v.string(),
});

export default defineSchema({
    users: defineTable(User).index("byExternalId", ["externalId"]),
    projects: defineTable({
        userId: v.id('users'),
        name: v.string(),
        lastUpdate: v.number(),
        videoSize: v.number(),
        videoFileId: v.id('_storage'),
        language: v.optional(v.string()),
        status: v.union(
            v.literal('pending'),
            v.literal('processing'),
            v.literal('ready'),
            v.literal('failed')
        ),
        captions: v.optional(v.array(captionSegmentValidator)),
        captionSettings: v.optional(captionSettingsValidator),
        script: v.optional(v.string()),
        audioFileId: v.optional(v.id('_storage')),
        generatedVideoFileId: v.optional(v.id('_storage')),
        error: v.optional(v.string()),
    })
    .index('by_lastUpdate', ['lastUpdate'])
    .index('by_user', ['userId'])
});