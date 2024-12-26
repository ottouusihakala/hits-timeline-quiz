'server-only'

export const getSpotifyClientId = () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;

  if (!clientId) {
    throw new Error("Spotify Client ID is not defined in environment variables!");
  }

  return clientId;
}

export const getSpotifyClientSecret = () => {
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error("Spotify Client Secret is not defined in environment variables!");
  }

  return clientSecret;
}