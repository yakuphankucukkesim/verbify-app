import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import { internalMutation, QueryCtx } from "./_generated/server";

export const upsertFromClerk = internalMutation({
    args: { data: v.any() as Validator<UserJSON>},
    handler: async (ctx, {data}) => {
        const userAttributes = {
            name: `${data.first_name} ${data.last_name}`,
            email: data.email_addresses[0].email_address,
            externalId: data.id,
            imageUrl: data.image_url,
        }
        const user = await userByExternalId(ctx, userAttributes.externalId);
        if(user === null) {
            await ctx.db.insert("users", userAttributes);
        } else {
            await ctx.db.patch(user._id, userAttributes);
        }
    }
})

export const deleteFromClerk = internalMutation({
    args: { clerkUserId: v.string() },
    handler: async (ctx, {clerkUserId}) => {
        const user = await userByExternalId(ctx, clerkUserId);
        if(user === null) {
            return;
        }
        await ctx.db.delete(user._id);
    }
})

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}