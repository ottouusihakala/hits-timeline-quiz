'use server'

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'
import { redirectUrl, spotifyAuthScope, spotifyAuthUrl } from '@/app/constants';
import { generateRandomString, getErrorUrl } from '@/util';
import { Session } from '@/app/types';
import { InvalidTokenError } from '../invalidTokenError';

function redirectToSpotify() {
  const state = generateRandomString(16);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: spotifyAuthScope,
    redirect_uri: redirectUrl,
    state
  });

  redirect(`${spotifyAuthUrl}?${params}`);
}

const fiveMinutes = 300 * 1000;

export async function checkCookie() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');
  
  if (!tokenCookie || !tokenCookie?.value) {
    console.info('Missing token cookie, redirecting to Spotify for authentication');
    redirectToSpotify();
  }

  try {
    const session = JSON.parse(Buffer.from(tokenCookie?.value as string, 'base64').toString('utf-8')) as Session;
    if (!session.accessToken) {
      throw new InvalidTokenError('Spotify Access Token is invalid, missing accessToken');
    }

    const currentTime = new Date().getTime();
    if (currentTime > session.expirationTime) {
      throw new InvalidTokenError('Spotify Access Token has expired');
    }

    // five minutes until expiration
    if (currentTime > (session.expirationTime - fiveMinutes)) {
      // TODO: refresh token here
      // except cannot be done here during SSR, has to be done as a server action
    }
  } catch (e: unknown) {
    console.error('Tried to process session token, encountered error', e);
    if (InvalidTokenError.isInvalidTokenError(e)) {
      // TODO: remove cookie
      // except cannot be done, for same reasons
      redirect('/logged-out');
    } else {
      redirect(getErrorUrl('error'));
    }
  }
}

