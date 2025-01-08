'use client'

import { use } from "react";
import Timer from "./timer";

interface Properties {
  spotifyUrlPromise: Promise<string | undefined>
}

const SpotifyUrlRedirectTimer = ({ spotifyUrlPromise }: Properties) => {
  const spotifyUrl = use(spotifyUrlPromise);

  if (!spotifyUrl) {
    return (
      <span>Timer, no Spotify ID</span>
    )
  }

  return (
    <div>
      <span>Timer, spotify ID: {spotifyUrl}</span>
      <Timer onTimeout={() => console.log("Test timer countdown completion")} duration={{ seconds: 10 }} />
    </div>
  );
}

export default SpotifyUrlRedirectTimer;