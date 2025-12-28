import * as z from 'zod';
import { createCards } from './createCards';
import { spotifyPlaylistTracksToYaml } from './spotifyPlaylistToYaml';
import { Command } from 'commander';

const yamlFileNameSchema = z.string().regex(/\.yaml|\.yml$/);
const spotifyPlaylistIdSchema = z.string();

const program = new Command();

program
  .command('createCards').description('Create card image files from given YAML file')
  .argument('<inputFile>', 'YAML file with track data', (inputFileValue) => yamlFileNameSchema.parse(inputFileValue))
  .action(async (inputFileArg) => {
    const inputFileUrl = new URL(inputFileArg, import.meta.url); 
    await createCards(inputFileUrl);
  });

program
  .command('getTracks').description('Get track data from a Spotify playlist, with given Spotify playlist ID')
  .argument('<spotifyPlaylistId>', 'Spotify playlist ID', (spotifyPlaylistIdValue) => spotifyPlaylistIdSchema.parse(spotifyPlaylistIdValue))
  .argument('<outputFile>', 'File name where to write YAML based on Spotify data', (outputFileValue) => yamlFileNameSchema.parse(outputFileValue))
  .action(async (spotifyPlaylistIdArg, outputFileArg) => {
    await spotifyPlaylistTracksToYaml(spotifyPlaylistIdArg, outputFileArg);
  });

program.parse();