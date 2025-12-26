import * as z from 'zod';
import type { ZodSchema } from 'zod/v3';
import { createCards } from './createCards';
import { spotifyPlaylistTracksToYaml } from './spotifyPlaylistToYaml';
import path from 'node:path';

const INPUT_FILE_FLAG = '--inputFile';
const SPOTIFY_PLAYLIST_ID = '--spotifyPlaylistId';

const operationArgSchema = z.union([z.literal('createCards'), z.literal('getTracks')]);

type OperationArg = z.infer<typeof operationArgSchema>;

const getOperationArg = (): OperationArg => {
  const firstArg = process.argv.at(2);
  const operation = operationArgSchema.parse(firstArg);
  return operation;
}

const chooseEntry = (operationArg: OperationArg): () => Promise<void> => {
  switch (operationArg) {
    case 'createCards': {
      const inputFileFlagArgIndex = process.argv.findIndex((arg) => arg === INPUT_FILE_FLAG);
      if (inputFileFlagArgIndex < 2) {
        throw new Error('No input file defined. An input YAML format file is required for creating cards.');
      }
      const inputFileArg = process.argv.at(inputFileFlagArgIndex + 1);
      if (!inputFileArg) {
        throw new Error('No input file defined. An input YAML format file is required for creating cards.');
      }

      console.log('process.argv', process.argv)
      console.log('process.execArgv', process.execArgv)
      console.log('process.execPath', process.execPath)
      const inputFileUrl = new URL(inputFileArg, import.meta.url);      
      return () => {
        return createCards(inputFileUrl);
      }
    }
    case 'getTracks': {
      const spotifyPlaylistIdFlagArgIndex = process.argv.findIndex((arg) => arg === SPOTIFY_PLAYLIST_ID);
      if (spotifyPlaylistIdFlagArgIndex < 2) {
        throw new Error('No Spotify playlist ID defined. A Spotify playlist ID is required to generate a valid YAML file with track information.');
      }
      const spotifyPlaylistIdArg = process.argv.at(spotifyPlaylistIdFlagArgIndex + 1);
      if (!spotifyPlaylistIdArg) {
        throw new Error('No Spotify playlist ID defined. A Spotify playlist ID is required to generate a valid YAML file with track information.');
      }

      return () => {
        return spotifyPlaylistTracksToYaml(spotifyPlaylistIdArg);
      }
    }
    default: {
      throw new Error(`No operation is defined for given argument`);
    }
  }
}

const main = async () => {
  try {
    if (process.argv.length < 3) {
      throw new Error('Provided no arguments, exiting.');
    }

    const operationArg = getOperationArg();
    const operation = chooseEntry(operationArg);
    await operation();
  } catch (err) {
    console.error('Failed,', err);
  }
}

await main();