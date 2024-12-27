from dotenv import load_dotenv, dotenv_values
import qrcode
import requests
import os
from base64 import b64encode

SPOTIFY_USER_NAME = "spotify"

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

limit = 100

spotify_user_playlists_res = requests.get(
    url="https://api.spotify.com/v1/users/" + SPOTIFY_USER_NAME + "/playlists?limit=" + str(limit),
    headers={"Authorization": "Bearer " + auth_token.get("access_token")},
)

spotify_user_playlists = spotify_user_playlists_res.json()

playlist_total_amount = spotify_user_playlists.get("total")

print("playlist_total_amount ", playlist_total_amount)

playlists_ids = []

for playlist in spotify_user_playlists.get("items"):
    print("playlist name ", playlist.get("name"), playlist.get("external_urls").get("spotify"))

pageAmount = playlist_total_amount / limit

print("pageAmount", pageAmount)

tracks_res = requests.get(
    url="https://api.spotify.com/v1/playlists/0NfjMqrzcGKVsbYZmhf4Md/tracks",
    headers={"Authorization": "Bearer " + auth_token.get("access_token")},
)

print("tracks_res", tracks_res.text)