from PIL import Image, ImageDraw, ImageFont
import qrcode
import math
import json

TRACK_MAX_COUNT_PER_PLAYLIST = 100

CARD_WIDTH = 600
CARD_HEIGHT = 900

# Width of the full image (card canvas) is 
# the card width * max amount of tracks in a playlist, which is 100 * 2 (there are 2 sides to a card, front and back)
CANVAS_X = CARD_WIDTH * (TRACK_MAX_COUNT_PER_PLAYLIST * 2)

COOPER_HEWITT_BOLD_FONT = "CooperHewitt-Bold.otf"

font = ImageFont.truetype(COOPER_HEWITT_BOLD_FONT, size=20)

TEXT_PADDING = 50

def render_qr_code_on_image(img: Image.Image, spotify_url: str):
    qr_code = qrcode.make(spotify_url)
    qr_im = qr_code.get_image()
    qr_padding = math.floor((CARD_WIDTH - qr_im.size[0]) / 2)
    img.paste(qr_im, (qr_padding, qr_padding))

def render_artists(im_draw: ImageDraw.ImageDraw, artists):
    artists = ", ".join(map(lambda artist: artist.get("name"), artists))
    im_draw.text((TEXT_PADDING, TEXT_PADDING * 2), text=artists, font=font, fill="black", align="left")

def render_release_date(im_draw: ImageDraw.ImageDraw, release_date: str):
    released = "Julkaistu % s" % release_date
    im_draw.text((TEXT_PADDING, TEXT_PADDING * 3), text=released, font=font, fill="black", align="left")

def render_track_info_on_image(img: Image.Image, track):
    draw = ImageDraw.Draw(img)
    draw.text((TEXT_PADDING, TEXT_PADDING), text=track.get("track").get("name"), font=font, fill="black", align="left")
    render_artists(draw, track.get("track").get("artists"))
    render_release_date(draw, track.get("track").get("album").get("release_date"))

def render_card_front_and_back(full_im: Image.Image, coords: tuple[int, int], track):
    x, y = coords
    front = Image.new(mode="RGB", size=(CARD_WIDTH, CARD_HEIGHT), color="black")
    render_qr_code_on_image(front, track.get("track").get("external_urls").get("spotify"))
    back = Image.new(mode="RGB", size=(CARD_WIDTH, CARD_HEIGHT), color="white")
    render_track_info_on_image(back, track)
    full_im.paste(front, (x, y))
    full_im.paste(back, (x + CARD_WIDTH, y))


with open("tracks.json", "r") as f:
    tracks_by_decades = json.load(f)
    canvas_y = CARD_HEIGHT * len(tracks_by_decades)
    full_im = Image.new(mode="RGB", size=(CANVAS_X, canvas_y), color="white")
    for decade_index, decade_tracks in enumerate(tracks_by_decades.values()):
        # Where to place the card image on y axis
        y_coord = CARD_HEIGHT * decade_index
        for track_index, track in enumerate(decade_tracks):
            # Where to place the card image on x axis
            x_coord = (CARD_WIDTH * 2) * track_index
            render_card_front_and_back(full_im, (x_coord, y_coord), track)

    full_im.save("all-cards-test.png")