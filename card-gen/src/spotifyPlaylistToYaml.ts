import type { HeadersInit } from 'bun';
import { URLSearchParams } from 'node:url';
import * as z from 'zod';
import type { Track } from './schema';
import { YAML } from 'bun';

const fieldsFilter = "items(id,track(name,album(name,release_date,release_date_precision),artists(name),external_urls(spotify),external_ids(isrc))),total"

const spotifyPlaylistToYamlEnvVarsSchema = z.object({
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  SPOTIFY_AUTH_TOKEN_URL: z.string(),
});

type SpotifyEnvVars = z.infer<typeof spotifyPlaylistToYamlEnvVarsSchema>;

const spotifyAuthTokenJsonSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
});

type SpotifyAuthToken = z.infer<typeof spotifyAuthTokenJsonSchema>;

const spotifyTrackSchema = z.object({
  album: z.object({
    name: z.string(),
    release_date: z.string(),
  }),
  artists: z.array(z.object({
    name: z.string(),
  })),
  external_urls: z.object({
    spotify: z.url(),
  }),
  name: z.string(),
});

const spotifyTrackResponseSchema = z.object({
  track: spotifyTrackSchema,
});

const spotifyPlaylistItemsResponseSchema = z.object({
  items: z.array(spotifyTrackResponseSchema),
});

type SpotifyPlaylist = z.infer<typeof spotifyPlaylistItemsResponseSchema>;

const getEnvVariables = (): SpotifyEnvVars => {
  const { data, error } = spotifyPlaylistToYamlEnvVarsSchema.safeParse(process.env);
  if (error) {
    const invalidEnvVars = error.issues.flatMap((issue) => issue.path);
    if (invalidEnvVars.length) {
      throw new Error(`Invalid environment variables, invalid variables: ${invalidEnvVars.join(', ')}`);
    }
    throw new Error('Invalid environment variables', error);
  }

  return data;
}

const getClientCredentials = (): string => {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = getEnvVariables();
  const clientCreds = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`;
  const clientCredsB64 = btoa(clientCreds);
  return clientCredsB64;
}

const getAuthToken = async (): Promise<SpotifyAuthToken> => {
  const { SPOTIFY_AUTH_TOKEN_URL } = getEnvVariables();
  const clientCreds = getClientCredentials();
  const headers: HeadersInit = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${clientCreds}`,
  };

  const body: URLSearchParams = new URLSearchParams({
    'grant_type': 'client_credentials',
  });

  const authTokenRes = await fetch(SPOTIFY_AUTH_TOKEN_URL, {
    method: 'POST',
    headers,
    body,
  });

  const authTokenJson = await authTokenRes.json();
  const authToken = spotifyAuthTokenJsonSchema.parse(authTokenJson);
  return authToken;
}

const getPlaylistUrl = (playlistId: string) => {
  return `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=${fieldsFilter}`;
}

const getPlaylist = async (playlistId: string, accessToken: SpotifyAuthToken): Promise<SpotifyPlaylist> => {
  const url = getPlaylistUrl(playlistId);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken.access_token}`
    },
  });

  const resJson = await res.json();
  const playlist = spotifyPlaylistItemsResponseSchema.parse(resJson);
  return playlist;
}

const transformTracks = (playlist: SpotifyPlaylist): Track[] => {
  return playlist.items.map((track) => {
    return {
      name: track.track.name,
      artist: track.track.artists.map((artist) => artist.name).join(', '),
      releaseDate: track.track.album.release_date,
      spotifyUrl: track.track.external_urls.spotify,
    };
  })
}

const writeTracksToYaml = (tracks: Track[], outputFile: Bun.PathLike) => {
  const space = 2;
  const asYaml = YAML.stringify(tracks, null, space);
  return Bun.write(outputFile, asYaml);
}

export const spotifyPlaylistTracksToYaml = async (playlistId: string, outputFile: Bun.PathLike) => {
  try {
    const authToken = await getAuthToken();
    const playlist = await getPlaylist(playlistId, authToken);
    const tracks = transformTracks(playlist);
    await writeTracksToYaml(tracks, outputFile);
  } catch (err: unknown) {
    console.error('Failed create YAML from Spotify playlist', err);
  }
}