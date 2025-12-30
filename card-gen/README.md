# Cardgen, or card tools

Consists of 
* `createCards`, which generates a bunch of card image files
* `getTracks`, which fetches track data from Spotify using a Spotify playlist ID

## Prerequisites

Install [bun](https://bun.com/) if you don't have it yet. Run `bun install` to install dependencies.

## Usage

First, create a YAML file with track information. Ex. the following content from the [tracks.yaml file](./tracks.yaml):

```yaml
- name: "Africa"
  artist: "TOTO"
  releaseDate: 1983-06-25
  spotifyUrl: https://open.spotify.com/track/2374M0fQpWi3dLnB54qaLX?si=7d7b91ee0f374ceb
- name: "Cheri Cheri Lady"
  artist: "Modern Talking"
  releaseDate: 1985-07-02
  spotifyUrl: https://open.spotify.com/track/2aEuA8PSqLa17Y4hKPj5rr?si=142cd8f2ba524319
```

Convert the tracks into image files for cards, in the root directory run the following command:

```bash
bun run ./src/index.ts [YAML file]
```

with YAML file being for instance the `tracks.yaml` file, ex.

```bash
bun run ./src/index.ts createCards tracks.yaml
```

This will create a bunch of files with names in format `output[number].png`, with the number being the index of the track. Each PNG file contains both the front and back of a card.

### Getting data for tracks

If you need something to start from, you can use the `getTracks` command.

First, you need a Spotify playlist Id. To get this, you can copy a Spotify playlist URL, which looks like this:

```
// this is Flashback Hits "80s Pop Hits!". You cannot use Spotify's own playlists, as these cannot be accessed through the Spotify API.
https://open.spotify.com/playlist/49PAThhKRCCTXeydvq9uAp?si=d82db5ca9cfc4771
```

The playlist ID is the first parameter:

```
https://open.spotify.com/playlist/[playlist ID]?si=d82db5ca9cfc4771
```

so in the case of the aforementioned playlist, it would be `49PAThhKRCCTXeydvq9uAp`.

In the root directory of this subproject, run

```bash
bun run ./src/index.ts getTracks 49PAThhKRCCTXeydvq9uAp [name of the output file]
```

ex.

```bash
bun run ./src/index.ts getTracks 49PAThhKRCCTXeydvq9uAp 80s_tracks.yaml
```

Now you should have a file called `80s_tracks.yaml`. This can be given to the `createCards` command to create cards out of it.