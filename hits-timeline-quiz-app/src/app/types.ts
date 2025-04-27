export type Session = {
  accessToken: string;
  expiresIn: number; // seconds until expires
  created: number; // timestamp in MILLISECONDS FROM EPOCH
  expirationTime: number; // timestamp in ms when token expires
  refreshToken: string;
}