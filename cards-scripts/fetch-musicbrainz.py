import requests

test_isrc = "USSM19902991" # MJ Billie Jean

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

    oldest = None
    for recording in recordings:
        if oldest == None:
            oldest = get_data(recording)
        
        recording_release_date = get_oldest_release_date(recording)
        print("recording_release_date", recording_release_date)
        if int(oldest.get("release_date")[0:4]) > int(recording_release_date[0:4]):
            oldest = get_data(recording)

    return oldest


get_oldest_recording(test_isrc)
