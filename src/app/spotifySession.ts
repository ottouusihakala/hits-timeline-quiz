'server-only'

import { add, isAfter } from "date-fns";
import { getSpotifyClientId, getSpotifyClientSecret } from "./env";

type AuthToken = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

class SpotifySession {
  currentToken: AuthToken | undefined;
  expiresIn: Date | undefined;

  private async requestToken(): Promise<AuthToken> {
    const credentials = `${getSpotifyClientId()}:${getSpotifyClientSecret()}`;
    const base64Encoded = Buffer.from(credentials).toString('base64');
    const req = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        'Authorization': `Basic ${base64Encoded}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
      })
    });
    return (await req.json()) as AuthToken;
  }

  async setupToken() {
    const token = await this.requestToken();
    this.currentToken = token;
    this.expiresIn = add(new Date(), { seconds: token.expires_in });
  }

  async getBearerToken(): Promise<string> {
    if (!this.currentToken || !this.expiresIn || isAfter(new Date(), this.expiresIn)) {
      await this.setupToken(); 
    }
    return this.currentToken!.access_token;
  }

  async getBearerTokenHeader() {
    return `Bearer ${await this.getBearerToken()}`;
  }
}

const spotifySession = new SpotifySession();

await spotifySession.setupToken();

export default spotifySession;