from dotenv import load_dotenv
import requests
import os
import json
from base64 import b64encode
import time

FILTR_US_80S_HITS_TOP_100_PLAYLIST_ID = "19PgP2QSGPcm6Ve8VhbtpG"
FILTR_US_70S_HITS_TOP_100_PLAYLIST_ID = "5KmBulox9POMt9hOt3VV1x"
# Last checked (2024-12-27) the following playlist contained 256 tracks
FILTR_SWE_60S_HITS_PLAYLIST_ID = "4ZuX2YvKAlym0a8VozqV1U"
FILTR_US_90S_HITS_TOP_100_PLAYLIST_ID = "3C64V048fGyQfCjmu9TIGA"
# Has only 97 tracks (2024-12-27)
FILTR_00S_HITS_PLAYLIST_ID = "1U3x51O0LQ4TtaD5CgxuGL"
# Has 538 tracks (2024-12-27)
BANGERS_2010S_PLAYLIST_ID = "357fWKFTiDhpt9C69CMG4q"

playlists_intended_decade = [
    { "id": FILTR_SWE_60S_HITS_PLAYLIST_ID, "decade": { "start": 1960, "end": 1970 } },
    { "id": FILTR_US_70S_HITS_TOP_100_PLAYLIST_ID, "decade": { "start": 1970, "end": 1980 } },
    { "id": FILTR_US_80S_HITS_TOP_100_PLAYLIST_ID, "decade": { "start": 1980, "end": 1990 } },
    { "id": FILTR_US_90S_HITS_TOP_100_PLAYLIST_ID, "decade": { "start": 1990, "end": 2000 } },
    { "id": FILTR_00S_HITS_PLAYLIST_ID, "decade": { "start": 2000, "end": 2010 } },
    { "id": BANGERS_2010S_PLAYLIST_ID, "decade": { "start": 2010, "end": 2020 } }
]

# Limiting filter for fields, we don't need all the data from the Spotify API
fields_filter = "items(id,track(name,album(name,release_date,release_date_precision),artists(name),external_urls(spotify),external_ids(isrc))),total"

load_dotenv()

def get_request(url, auth_token):
    res = requests.get(
        url=url,
        headers={ "Authorization": f'Bearer {auth_token.get("access_token")}' }
    )
    return res.json()

def get_playlist_tracks_request(playlist_id, auth_token):
    tracks_url = f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks?fields={fields_filter}'
    return get_request(tracks_url, auth_token)

# Authenticate, get an access token from the auth endpoint to run the following requests
def get_auth_token():
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
    return auth_token

def adjust_item(track_item):
    track = track_item.get("track")
    track["release_date"] = track.get("album").get("release_date")
    track["isrc"] = track.get("external_ids").get("isrc")
    return track

def get_playlist_tracks(playlist_id, auth_token):
    tracks_json = get_playlist_tracks_request(playlist_id, auth_token)
    tracks_amount = tracks_json.get("total")
    tracks = tracks_json.get("items")
    # adjust data structure
    formatted = []
    for item in tracks:
        formatted.append(adjust_item(item))
    return tracks

def get_tracks_by_isrc(isrc, auth_token):
    url = f"https://api.spotify.com/v1/search?q=isrc%3A{isrc}&type=track&market=FI&offset=0&limit=10"
    results = get_request(url, auth_token)
    oldest_release = None
    for item in results.get("tracks").get("items"):
        track = adjust_item(item)
        if oldest_release == None and track.get("release_date") != None:
            oldest_release = track
        else:
            release_date = track.get("release_date")
            release_year = int(release_date[0:4])
            oldest_release_year = int(oldest_release.get("release_date")[0:4])
            if oldest_release == None or oldest_release_year > release_year:
                oldest_release = track
    
    return oldest_release

def get_tracks_with_corrected_release_dates(tracks, auth_token):
    corrected = []
    for track in tracks:
        isrc = track.get("isrc")
        oldest_track = get_tracks_by_isrc(isrc, auth_token)
        if oldest_track != None:
            corrected.append(oldest_track)
        else:
            corrected.append(track)
    
    return corrected

# MusicBrainz API stuff

# MusicBrainz allows 50 requests per second
# https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting

def get_with_isrc(isrc):
    return requests.get(f"https://musicbrainz.org/ws/2/recording/?query=isrc:{isrc}&fmt=json").json()

def get_artist_names(artist_credit):
    artist_names = []
    for artist in artist_credit:
        print("recording artist", artist.get("name"))
        artist_names.append(artist.get("name"))
    return ", ".join(artist_names)

def get_oldest_release_date_from_releases(releases):
    oldest_release_date = None
    for release in releases:
        release_date = release.get("date")
        if oldest_release_date == None and release_date != None:
            oldest_release_date = release_date
        elif oldest_release_date != None and release_date != None and len(release_date.strip()) >= 4 and int(oldest_release_date[0:4]) > int(release_date[0:4]):
            oldest_release_date = release_date
    return release_date

def get_data(recording):
    data = {}
    release_date = recording.get("first-release-date")
    if release_date == None:
        release_date = get_oldest_release_date_from_releases(recording.get("releases"))
    data["release_date"] = release_date
    data["title"] = recording.get("title")
    data["artists"] = get_artist_names(recording.get("artist-credit"))
    return data

def get_oldest_release_date(recording):
    first_release_date = recording.get("first-release-date")
    releases_release_date = get_oldest_release_date_from_releases(recording.get("releases"))
    oldest_release_date = first_release_date
    if first_release_date == None:
        oldest_release_date = releases_release_date
    elif first_release_date != None and releases_release_date != None:
        first_release_year = int(first_release_date[0:4])
        releases_release_year = int(releases_release_date[0:4])
        if first_release_year > releases_release_year:
            oldest_release_date = releases_release_date
    
    return oldest_release_date


def get_oldest_recording(isrc):
    recordings = get_with_isrc(isrc).get("recordings")
    print("get_oldest_recording recordings", recordings)
    print("get_oldest_recording isrc", isrc)

    oldest = None
    for recording in recordings:
        if oldest == None:
            oldest = get_data(recording)
        
        recording_release_date = get_oldest_release_date(recording)
        print("recording_release_date", recording_release_date)
        if int(oldest.get("release_date")[0:4]) > int(recording_release_date[0:4]):
            oldest = get_data(recording)

    return oldest

def get_tracks_with_isrc_throttled(tracks):
    count = 0
    corrected = []
    for track in tracks:
        if count == 48:
            time.sleep(2) # wait of 2 seconds to permit more requests to musicbrainz API
        isrc = track.get("isrc")
        musicbrainz_data = get_oldest_recording(isrc)
        count += 1

        # fix data
        track["release_date"] = musicbrainz_data.get("release_date")
        track["name"] = musicbrainz_data.get("title")
        corrected.append(track)
    return corrected

# MusicBrainz API stuff ends here

def filter_wrong_release_date_tracks(tracks, decade):
    filtered = []
    filtered_out = []
    for item in tracks:
        track = item
        if item.get("track") != None:
            track = item.get("track")
        release_year = int(track.get("release_date")[0:4])
        if decade.get('start') <= release_year and release_year < decade.get('end'):
            filtered.append(item)
        else:
            filtered_out.append(item)
    return { "filtered": filtered, "filtered_out": filtered_out }

def group_tracks_by_decade(initial_dict, tracks):
    tracks_by_decades = initial_dict
    for item in tracks:
        track = item
        if item.get("track") != None:
            track = item.get("track")
        print("group_tracks_by_decade track", track)
        release_year = int(track.get("release_date")[0:4])
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
    return tracks_by_decades

def main():
    auth_token = get_auth_token()
    # Initial collection for collecting tracks into, by grouping them by decade
    tracks_by_decades = {
        "60s": [],
        "70s": [],
        "80s": [],
        "90s": [],
        "2000s": [],
        "2010s": []
    }

    for playlist_item in playlists_intended_decade:
        tracks = get_playlist_tracks(playlist_item.get("id"), auth_token)

        # tracks_release_dates_corrected = get_tracks_with_corrected_release_dates(tracks, auth_token)

        filter_results = filter_wrong_release_date_tracks(tracks, playlist_item.get("decade"))
        print("filter_results filtered", len(filter_results.get("filtered")))
        print("filter_results filtered out", len(filter_results.get("filtered_out")))

        filtered_out_with_corrected_dates = get_tracks_with_corrected_release_dates(filter_results.get("filtered_out"), auth_token)

        refiltered_results = filter_wrong_release_date_tracks(filtered_out_with_corrected_dates, playlist_item.get("decade"))
        print("refiltered_results filtered len ", len(refiltered_results.get("filtered")))
        print("refiltered_results filtered out len ", len(refiltered_results.get("filtered_out")))

        combined = filter_results.get("filtered") + refiltered_results.get("filtered")
        print("combined len asdasd", len(combined))

        fixed_with_musicbrainz = get_tracks_with_isrc_throttled(refiltered_results.get("filtered_out"))
        print("fixed_with_musicbrainz ", fixed_with_musicbrainz)

        # with open(f"filtered_out_tracks_{playlist_item.get("decade").get("start")}.json", "w") as f:
        #     json.dump(results.get("filtered_out"), f)
        
        # Group tracks from the playlist by release decade
        group_tracks_by_decade(tracks_by_decades, combined)

    # Write tracks JSON to file
    with open("tracks.json", "w") as f:
        json.dump(tracks_by_decades, f)

if __name__ == "__main__":
    main()