import { readFile } from 'node:fs/promises';
import { YAML } from 'bun';
import sharp from 'sharp';
import QrCode from 'qrcode';
import { trackFileSchema, type Track } from './schema';
import type { PathLike } from 'node:fs';

const parseTracks = async (filePath: PathLike): Promise<Track[]> => {
  // const filePath = new URL('../tracks.yaml', import.meta.url);
  const contents = await readFile(filePath, { encoding: 'utf8' });
  const yaml = YAML.parse(contents);
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

  return cardFront;
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

  return cardBackComposed;
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

const getCardSides = async (track: Track, height: number, width: number) => {
  const cardFrontBackground: sharp.Create = getBackgroundStyle(height, width, colors.BLACK)
  const { data: front } = await createCardFront(track.spotifyUrl, cardFrontBackground)
    .then((sharpImg) => sharpImg.png().toBuffer({ resolveWithObject: true }));
  const cardBackBackground: sharp.Create = getBackgroundStyle(height, width, colors.WHITE)
  const { data: back } = await createCardBack(track, cardBackBackground)
    .then((sharpImg) => sharpImg.png().toBuffer({ resolveWithObject: true }));

  return { front, back };
}

const composeCard = (sides: { front: Buffer<ArrayBufferLike>, back: Buffer<ArrayBufferLike> }, height: number, width: number) => {
  const { front, back } = sides;
  const cardBackground = sharp({
    create: {
      height,
      width: width * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const card = cardBackground.composite([
    {
      input: front,
      top: 0,
      left: 0,
    },
    {
      input: back,
      top: 0,
      left: width,
    },
  ]);

  return card;
}

const writeCard = (card: sharp.Sharp, index: number) => {
  return card.png().toFile(`output${index}.png`);
}

export const createCards = async (tracksYamlFilePath: PathLike) => {
  try {
    const tracks = await parseTracks(tracksYamlFilePath);

    tracks.map(async (track, index) => {
      const height = 900;
      const width = 600;
      const sides = await getCardSides(track, height, width);
      const card = composeCard(sides, height, width);

      await writeCard(card, index);
    });
  } catch (err) {
    console.error(err);
  }
}