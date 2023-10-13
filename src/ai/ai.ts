import { contentModeration, imageModeration } from '../ai/moderation';

export class AI {
  moderation = {
    image: (params: any) => imageModeration(params),
    content: (params: any) => contentModeration(params),
    // Add other moderation functions here
  };

  // Add other categories like moderation here
}
