import math
import qrcode
from PIL import Image, ImageDraw2, ImageDraw, ImageFont

track = {
    "track": {
        "artists": [{ "name": "The Tokens" }, { "name": "Dummy Artist" }],
        "album": {
            "name": "The Lion Sleeps Tonight",
            "release_date": "1994-08-11",
            "release_date_precision": "day"
        },
        "external_urls": {
            "spotify": "https://open.spotify.com/track/2QbSGkb3TgghEHpjKCsznm"
        },
        "name": "The Lion Sleeps Tonight (Wimoweh)"
    }
}

CARD_WIDTH = 600
CARD_HEIGHT = 900
COOPER_HEWITT_BOLD_FONT = "CooperHewitt-Bold.otf"

font = ImageFont.truetype(COOPER_HEWITT_BOLD_FONT, size=20)

IMAGE_FULL_WIDTH = CARD_WIDTH * 2
TEXT_PADDING = 50

full_im = Image.new(mode="RGB", size=(IMAGE_FULL_WIDTH, CARD_HEIGHT), color=(255, 255, 255))
front = Image.new(mode="RGB", size=(CARD_WIDTH, CARD_HEIGHT), color="black")
qr_code = qrcode.make(track.get("track").get("external_urls").get("spotify"))
qr_im = qr_code.get_image()
qr_padding = math.floor((CARD_WIDTH - qr_im.size[0]) / 2)
front.paste(qr_im, (qr_padding, qr_padding))
back = Image.new(mode="RGB", size=(CARD_WIDTH, CARD_HEIGHT), color="white")
back_draw = ImageDraw.Draw(back)
back_draw.text((TEXT_PADDING, TEXT_PADDING), text=track.get("track").get("name"), font=font, fill="black", align="left")
artists = ", ".join(map(lambda artist: artist.get("name"), track.get("track").get("artists")))
back_draw.text((TEXT_PADDING, TEXT_PADDING * 2), text=artists, font=font, fill="black", align="left")
released = "Julkaistu % s" % track.get("track").get("album").get("release_date")
back_draw.text((TEXT_PADDING, TEXT_PADDING * 3), text=released, font=font, fill="black", align="left")
full_im.paste(front, (0, 0))
full_im.paste(back, (front.size[0], 0))
full_im.save("test-card-image.png")