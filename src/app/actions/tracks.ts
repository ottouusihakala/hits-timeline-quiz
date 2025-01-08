'use server'

import { Jimp } from "jimp";
import spotifySession from "../spotifySession";
import jsQR from "jsqr";
import { redirect } from "next/navigation";

const HITSTER_FIN_PLAYLIST_ID = "6Nn768rDkJXxIrGg8CjyKL";

const getFromSpotify = async <T>(url: string): Promise<T> => {
  const req = await fetch(url, {
    headers: {
      'Authorization': await spotifySession.getBearerTokenHeader()
    }
  });
  const jsonRes = await req.json() as T;
  return jsonRes;
}

export const searchTracks = async (): Promise<SpotifyApi.TrackSearchResponse> => {
  const yearRange = '1970-1979';
  return getFromSpotify<SpotifyApi.TrackSearchResponse>(`https://api.spotify.com/v1/search?q=year:${yearRange}&type=track&market=FI&limit=1`);
}

type Track = {
  artists: SpotifyApi.ArtistObjectSimplified[] | undefined;
  album: {
    name: string | undefined;
    releaseDate: string | undefined;
  };
  name: string | undefined;
  spotifyUrl: string | undefined;
  uri: string | undefined;
}

export const getTracksFromHitsterPlaylist = async (): Promise<Track[]> => {
  const res = await getFromSpotify<SpotifyApi.PlaylistTrackResponse>(`https://api.spotify.com/v1/playlists/${HITSTER_FIN_PLAYLIST_ID}/tracks?market=FI`);
  const tracks: Track[] = res.items.map((item) => {
    return {
      artists: item.track?.artists,
      album: {
        name: item.track?.album.name,
        releaseDate: item.track?.album.release_date,
      },
      name: item.track?.name,
      spotifyUrl: item.track?.external_urls.spotify,
      uri: item.track?.uri
    }
  });
  return tracks;
}

const PERMITTED_FILE_TYPES = ["image/png", "image/jpeg"];

const isCorrectImageType = (formEntry: FormDataEntryValue): formEntry is File => {
  const fileType = (formEntry as File).type;
  return PERMITTED_FILE_TYPES.includes(fileType);
}

export const parseQrCodeFromFormData = async (formData: FormData): Promise<string> => {
  const file = formData.get('qrCode');  
  if (!file) {
    throw new Error("Missing file in form data");
  }
  if (file && isCorrectImageType(file)) {
    const arrBuf = await file.arrayBuffer();
    const im = await Jimp.read(arrBuf);
    const uintArr = new Uint8ClampedArray(im.bitmap.data);
    const qrCode = jsQR(uintArr, im.width, im.height);
    if (!qrCode) {
      throw new Error("No QR code found in image file")
    }
    return qrCode.data
  }
  throw new Error("File is of incorrect type");
}

export const openTrack = async (formData: FormData) => {
  try {
    const url = await parseQrCodeFromFormData(formData);
    redirect(`/?spotifyUrl=${encodeURI(url)}`)
  } catch (e: unknown) {
    throw e;
  }
}