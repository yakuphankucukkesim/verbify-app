'use node';

import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { action } from './_generated/server';

const MICROSERVICE_URL = process.env.MICROSERVICE_URL as string;

// Generate a video with burned-in captions
export const generateCaptionedVideo = action({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    console.log('Starting video caption generation for project:', args.id);

    // Get project details
    const project = await ctx.runQuery(internal.projects.getProjectById, {
      id: args.id as Id<'projects'>,
    });

    if (!project) {
      throw new ConvexError('Project not found');
    }
    if (!project.captions || !project.captionSettings) {
      throw new ConvexError('Project must have captions and caption settings');
    }

    // Get video URL
    const videoUrl = await ctx.runQuery(internal.projects.getFileUrlById, {
      id: project.videoFileId,
    });

    if (!videoUrl) {
      throw new ConvexError('Video URL not found');
    }

    // Get audio URL if it exists
    let audioUrl: string | undefined;
    if (project.audioFileId) {
      const url = await ctx.runQuery(internal.projects.getFileUrlById, {
        id: project.audioFileId,
      });
      if (url) {
        audioUrl = url;
        console.log('Retrieved audio URL:', { hasUrl: true });
      } else {
        console.log('Audio file exists but URL could not be retrieved');
      }
    }

    try {
      // Validate microservice URL
      if (!MICROSERVICE_URL) {
        throw new ConvexError('MICROSERVICE_URL is not configured. Please set it in your .env file.');
      }

      console.log('Sending request to microservice:', MICROSERVICE_URL);

      // Make request to microservice
      const response = await fetch(MICROSERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputUrl: videoUrl,
          outputFormat: 'mp4',
          captions: project.captions,
          captionSettings: {
            fontSize: Math.floor(project.captionSettings.fontSize * 0.75), // Scale down font size to match preview
            position: project.captionSettings.position,
            color: project.captionSettings.color,
          },
          audioUrl, // Include audioUrl if it exists
        }),
      });

      console.log('Microservice response status:', response.status);

      if (!response.ok) {
        // Try to parse error response
        const contentType = response.headers.get('content-type');
        let errorMessage = `Microservice error (${response.status})`;
        
        // Provide user-friendly error messages for common issues
        if (response.status === 404) {
          errorMessage = 'Video processing service is not available. Please ensure the microservice is running and the URL is correct.';
        } else if (response.status === 502 || response.status === 503) {
          errorMessage = 'Video processing service is temporarily unavailable. Please try again later.';
        } else {
          try {
            if (contentType?.includes('application/json')) {
              const error = await response.json();
              errorMessage = error.error || error.message || errorMessage;
            } else {
              const textError = await response.text();
              // Don't include HTML error pages in the message
              if (!textError.includes('<!DOCTYPE')) {
                errorMessage = `${errorMessage}: ${textError.substring(0, 200)}`;
              }
            }
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
          }
        }
        
        throw new ConvexError(errorMessage);
      }

      // Get video data from response
      const videoBuffer = await response.arrayBuffer();

      // Upload to Convex storage with proper content type
      const storageId = await ctx.storage.store(new Blob([videoBuffer], { type: 'video/mp4' }));

      // Update project with new video ID
      await ctx.runMutation(internal.projects.updateProjectById, {
        id: args.id,
        generatedVideoFileId: storageId,
      });

      // Get the URL for the generated video
      const finalVideoUrl = await ctx.storage.getUrl(storageId);
      return finalVideoUrl;
    } catch (error) {
      console.error('Error in video generation:', error);
      throw error;
    }
  },
});