'use client'

import { use } from "react";
import Timer from "./timer";

interface Properties {
  spotifyUrlPromise: Promise<string | undefined>
}

const SpotifyUrlRedirectTimer = ({ spotifyUrlPromise }: Properties) => {
  const spotifyUrl = use(spotifyUrlPromise);

  function onTimeout() {
    'use client'
    if (spotifyUrl) {
      window.location.replace(decodeURI(spotifyUrl));
    }
  }

  if (!spotifyUrl) {
    return (
      <span>Timer, no Spotify ID</span>
    )
  }

  return (
    <div>
      <span>Timer, spotify ID: {spotifyUrl}</span>
      <Timer onTimeout={onTimeout} duration={{ seconds: 3 }} />
    </div>
  );
}

export default SpotifyUrlRedirectTimer;