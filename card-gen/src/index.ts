import { readFile } from 'node:fs/promises';
import { YAML } from 'bun';
import * as z from 'zod';
import sharp from 'sharp';
import QrCode from 'qrcode';

const CARD_WIDTH = 600;
const CARD_HEIGHT = 900;

// const stringToDate = z.codec(z.iso.date(), z.date(), {
//   decode: (isoDate: string) => new Date(isoDate),
//   encode: (date) => date.toISOString(),
// });

const trackSchema = z.object({
  name: z.string(),
  artist: z.string(),
  releaseDate: z.iso.date(),
  spotifyUrl: z.url(),
});

const trackFileSchema = z.array(trackSchema).nonempty();

type Track = z.infer<typeof trackSchema>;

const parseTracks = async (filePath: URL): Promise<Track[]> => {
  // const filePath = new URL('../tracks.yaml', import.meta.url);
  const contents = await readFile(filePath, { encoding: 'utf8' });
  console.log(contents);
  const yaml = YAML.parse(contents);
  console.log(yaml);
  const tracks: Track[] = trackFileSchema.parse(yaml);
  return tracks;
}

const createQRCode = async (spotifyUrl: string) => {
  const qrBufferPromise = new Promise<Buffer<ArrayBufferLike>>((resolve, reject) => {
    QrCode.toBuffer(spotifyUrl, (err, qrBuffer) => {
      if (err) {
        reject(err);
      }
      resolve(qrBuffer);
    })
  });

  return qrBufferPromise;
}

const createCardFront = async (spotifyUrl: string, backgroundSpecs: sharp.Create) => {
  const qrCode = await createQRCode(spotifyUrl);

  const background = sharp({
    create: backgroundSpecs,
  });

  const cardFront = background.composite([{ input: qrCode }]);

  return cardFront.png().toFile('output.png');
}

const getTextSvg = (text: string, width: number, height: number, fontSize: number) => {
  return Buffer.from(`<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <text x="0%" y="50%" text-anchor="start" font-size="${fontSize}" font-family="Arial" fill="#000">${text}</text>
  </svg>`);
}

const createCardBack = async (track: Track, backgroundSpecs: sharp.Create) => {
  const background = sharp({
    create: backgroundSpecs,
  });
  
  const textElementHeight = 100;
  const fontSize = 50;

  const trackNameSvg = getTextSvg(`Name: ${track.name}`, backgroundSpecs.width, textElementHeight, fontSize);
  const artistNameSvg = getTextSvg(`Artist: ${track.artist}`, backgroundSpecs.width, textElementHeight, fontSize);
  const releaseDateSvg = getTextSvg(`Release Date: ${track.releaseDate}`, backgroundSpecs.width, textElementHeight, fontSize);


  const cardBackComposed = background.composite([
    {
      input: trackNameSvg,
      top: 0,
      left: 0,
    },
    {
      input: artistNameSvg,
      top: fontSize,
      left: 0,
    },
    {
      input: releaseDateSvg,
      top: fontSize * 2,
      left: 0,
    },
  ]);

  return cardBackComposed.png().toFile('cardBackOutput.png');
}

const colors = {
  BLACK: { r: 0, g: 0, b: 0 },
  WHITE: { r: 254, g: 254, b: 254 },
}

const getBackgroundStyle = (height: number, width: number, color: sharp.Colour): sharp.Create => {
  const channels = 3;
  const cardFrontBackground: sharp.Create = {
    height,
    width,
    channels,
    background: color,
  };
  return cardFrontBackground;
}

const main = async () => {
  try {
    const filePath = new URL('../tracks.yaml', import.meta.url);
    const tracks = await parseTracks(filePath);
    const firstTrack = tracks[0];
    console.log('firstTrack', firstTrack);
    if (firstTrack) {
      const height = 900;
      const width = 600;
      const cardFrontBackground: sharp.Create = getBackgroundStyle(height, width, colors.BLACK)
      await createCardFront(firstTrack.spotifyUrl, cardFrontBackground);
      const cardBackBackground: sharp.Create = getBackgroundStyle(height, width, colors.WHITE)
      await createCardBack(firstTrack, cardBackBackground);
    }
  } catch (err) {
    console.error(err);
  }
}

await main();