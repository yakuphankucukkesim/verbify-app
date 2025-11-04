import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const { data, type} = await request.json();

  switch (type) {
    case "user.created":
      await ctx.runMutation(internal.users.upsertFromClerk, {data});
    case "user.deleted":
      await ctx.runMutation(internal.users.deleteFromClerk, {clerkUserId: data.id});
    case 'user.updated':
      await ctx.runMutation(internal.users.upsertFromClerk, {data});
    default:
      console.log(`Unhandled event type: ${type}`)
      break;
  }
  return new Response(null, { status: 200});
})
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook
});

export default http;