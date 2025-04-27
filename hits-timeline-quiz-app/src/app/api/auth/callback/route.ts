import { homeUrl, redirectUrl, spotifyTokenUrl } from '@/app/constants';
import { encryptSession } from '@/app/lib/auth';
import { Session } from '@/app/types';
import { getErrorUrl } from '@/util';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server'

type SpotifyAccessTokenSuccess = {
  access_token: string;
  token_type: 'Bearer';
  scope: string;
  expires_in: number;
  refresh_token: string;
}

type SpotifyApiError = {
  error: string;
  error_description: string;
}

function spotifyAccessTokenToSession(accessTokenResponse: SpotifyAccessTokenSuccess): Session {
  const currentDateInMs = new Date().getTime();
  const expirationTime = currentDateInMs + (accessTokenResponse.expires_in * 1000);
  return {
    accessToken: accessTokenResponse.access_token,
    expiresIn: accessTokenResponse.expires_in,
    created: currentDateInMs,
    expirationTime,
    refreshToken: accessTokenResponse.refresh_token
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.has('error')) {
    console.error('Spotify returned error', searchParams.get('error'));
    return NextResponse.redirect(getErrorUrl('error'))
  }

  if (!searchParams.has('state')) {
    console.error('Spotify auth state mismatch, state: ', searchParams.get('state'));
    return NextResponse.redirect(getErrorUrl('error'));
  }

  if (searchParams.has('code')) {
    try {
      const authBody = new URLSearchParams({
        code: searchParams.get('code') as string,
        redirect_uri: redirectUrl,
        grant_type: 'authorization_code'
      })
    
      const clientCredentials = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  
      const authRes = await fetch(spotifyTokenUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${clientCredentials}`
        },
        body: authBody
      });

      const authResBody: SpotifyAccessTokenSuccess | SpotifyApiError = await authRes.json();
      if ((authResBody as SpotifyApiError).error) {
        throw new Error('Error in Spotify API response', { cause: authResBody });
      }
      const session = spotifyAccessTokenToSession(authResBody as SpotifyAccessTokenSuccess);
      const cookieStore = await cookies();
      const sessionCookieValue = await encryptSession(session);
      cookieStore.set('token', sessionCookieValue);
      const response = NextResponse.redirect(homeUrl);
      response.cookies.set('token', sessionCookieValue);
      return response;
    } catch (e: unknown) {
      console.error('Tried to acquire access token from Spotify API, but encountered error', e);
      return NextResponse.redirect(getErrorUrl('error'));
    }
  }

  console.error('Spotify authentication response missing code');

  return NextResponse.redirect(getErrorUrl('error'));
}