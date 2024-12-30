from dotenv import load_dotenv
import qrcode
import requests
import os
import json
from PIL import Image
from base64 import b64encode

FILTR_US_80S_HITS_TOP_100_PLAYLIST_ID = "19PgP2QSGPcm6Ve8VhbtpG"
FILTR_US_70S_HITS_TOP_100_PLAYLIST_ID = "5KmBulox9POMt9hOt3VV1x"
# Last checked (2024-12-27) the following playlist contained 256 tracks
FILTR_SWE_60S_HITS_PLAYLIST_ID = "4ZuX2YvKAlym0a8VozqV1U"
FILTR_US_90S_HITS_TOP_100_PLAYLIST_ID = "3C64V048fGyQfCjmu9TIGA"
# Has only 97 tracks (2024-12-27)
FILTR_00S_HITS_PLAYLIST_ID = "1U3x51O0LQ4TtaD5CgxuGL"
# Has 538 tracks (2024-12-27)
BANGERS_2010S_PLAYLIST_ID = "357fWKFTiDhpt9C69CMG4q"

playlist_ids = [
    FILTR_SWE_60S_HITS_PLAYLIST_ID, 
    FILTR_US_70S_HITS_TOP_100_PLAYLIST_ID, 
    FILTR_US_80S_HITS_TOP_100_PLAYLIST_ID, 
    FILTR_US_90S_HITS_TOP_100_PLAYLIST_ID,
    FILTR_00S_HITS_PLAYLIST_ID,
    BANGERS_2010S_PLAYLIST_ID
]

load_dotenv()

# Authenticate, get an access token from the auth endpoint to run the following requests
client_creds = os.environ.get("SPOTIFY_CLIENT_ID") + ":" + os.environ.get("SPOTIFY_CLIENT_SECRET")
client_creds_base64 = b64encode(client_creds.encode("utf-8")).decode("utf-8")
auth_token_res = requests.post(
    url="https://accounts.spotify.com/api/token",
    headers={
        "Content-Type": "application/x-www-form-urlencoded", 
        "Authorization": "Basic " + client_creds_base64
    },
    data={"grant_type": "client_credentials"},
)
auth_token = auth_token_res.json()

# Initial collection for collecting tracks into, by grouping them by decade
tracks_by_decades = {
    "60s": [],
    "70s": [],
    "80s": [],
    "90s": [],
    "2000s": [],
    "2010s": []
}

# Limiting filter for fields, we don't need all the data from the Spotify API
fields_filter = "items(id,track(name,album(name,release_date,release_date_precision),artists(name),external_urls(spotify))),total"

for playlist_id in playlist_ids:
    tracks_res = requests.get(
        url="https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks?fields=" + fields_filter,
        headers={"Authorization": "Bearer " + auth_token.get("access_token")},
    )
    tracks_json = tracks_res.json()
    tracks_amount = tracks_json.get("total")
    tracks = tracks_json.get("items")
    # Limit amount of tracks, if there are more than 100 tracks in the playlist
    if tracks_amount > 100:
        tracks = tracks[0:100]
    # Group tracks from the playlist by release decade
    for track in tracks:
        release_year = int(track.get("track").get("album").get("release_date")[0:4])
        if release_year >= 1960 and release_year < 1970:
            tracks_by_decades["60s"].append(track)
        elif release_year >= 1970 and release_year < 1980:
            tracks_by_decades["70s"].append(track)
        elif release_year >= 1980 and release_year < 1990:
            tracks_by_decades["80s"].append(track)
        elif release_year >= 1990 and release_year < 2000:
            tracks_by_decades["90s"].append(track)
        elif release_year >= 2000 and release_year < 2010:
            tracks_by_decades["2000s"].append(track)
        elif release_year >= 2010 and release_year < 2020:
            tracks_by_decades["2010s"].append(track)

# Write tracks JSON to file
with open("tracks.json", "w") as f:
    json.dump(tracks_by_decades, f)
