from dotenv import load_dotenv, dotenv_values
import qrcode
import requests
import os
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

load_dotenv()

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

tracks_res = requests.get(
    url="https://api.spotify.com/v1/playlists/19PgP2QSGPcm6Ve8VhbtpG/tracks",
    headers={"Authorization": "Bearer " + auth_token.get("access_token")},
)

print("tracks_res", tracks_res.text)