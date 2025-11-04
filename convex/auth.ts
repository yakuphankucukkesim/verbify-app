import { ConvexError } from "convex/values";
import { Id } from './_generated/dataModel';
import { MutationCtx, QueryCtx } from "./_generated/server";

export async function getUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
        throw new ConvexError('You must be logged in to access this resource.')
    }

    const user = await ctx.db
    .query('users')
    .withIndex('byExternalId', (q: any) => q.eq('externalId', identity.subject))
    .first();

    if(!user){
        throw new ConvexError('User not found');
    }

    return user;
}

export async function authorizeProject(ctx: QueryCtx | MutationCtx, projectId: Id<'projects'>) {
  const user = await getUser(ctx);

  const project = await ctx.db.get(projectId);

  if (!project) {
    throw new ConvexError('Project not found');
  }

  if (project.userId !== user._id) {
    throw new ConvexError("You don't have access to this project");
  }

  return { user, project };
}