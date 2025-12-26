import * as z from 'zod';

const trackSchema = z.object({
  name: z.string(),
  artist: z.string(),
  releaseDate: z.iso.date(),
  spotifyUrl: z.url(),
});

export const trackFileSchema = z.array(trackSchema).nonempty();

export type Track = z.infer<typeof trackSchema>;