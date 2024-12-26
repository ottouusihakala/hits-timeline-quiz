'use server'

import spotifySession from "../spotifySession";

export const search = async (): Promise<SpotifyApi.TrackSearchResponse> => {
  const yearRange = '1970-1979';
  const req = await fetch(`https://api.spotify.com/v1/search?q=year:${yearRange}&type=track&market=FI&limit=1`, {
    headers: {
      'Authorization': await spotifySession.getBearerTokenHeader()
    }
  });
  const jsonRes = await req.json() as SpotifyApi.TrackSearchResponse;
  console.log('search jsonRes', jsonRes);
  return jsonRes;
}