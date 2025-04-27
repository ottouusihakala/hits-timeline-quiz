export const homeUrl = 'http://127.0.0.1:3000';
export const errorUrl = `${homeUrl}/error`;
export const authUrl = `${homeUrl}/auth`

export const spotifyAuthScope = 'user-read-email';
export const spotifyAuthUrl = 'https://accounts.spotify.com/authorize';
export const spotifyTokenUrl = 'https://accounts.spotify.com/api/token';
export const redirectUrl = `${homeUrl}/api/auth/callback`;

export const invalidSpotifyCredentialsError = 'incorrect_spotify_credentials';