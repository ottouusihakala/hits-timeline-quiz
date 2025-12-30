# Hit Song Timeline Quiz tools

App for playing a game where you have to guess the year the song was released on, and optionally the artist and song name.

`hits-timeline-quiz-app` contains source code for a web app that allows redirecting to Spotify after reading a QR code and waiting for a timer to run out.

`card-gen` contains source code for tools that create cards and get data for creating cards.

The python scripts in `card-scripts` are deprecated.

## Usage

For running the web app `hits-timeline-quiz-app`, read instructions in the [README](./hits-timeline-quiz-app/README.md).

For using the card generation and track data tools, read the [following instructions under `card-gen`](./card-gen/README.md).

### Production

Not implemented yet.

## Backlog

* Consider creating a mobile app for the QR code redirect
  * Distribution of app can be an issue, application package distribution requires approval from application store front or technical know-how of installing unsigned packages

### High Priority

* Validate track data
  * Ex. the playlist user used to create track data (for card generation) is supposed to only contain 80s music
    * Mark all invalid release dates? Maybe preferable over just filtering the invalid ones out.
  * A separate command would probably be best, to keep all tools separate (and to maintain clean separation of logic)
* Figure out best way to print cards
  * One file with all, multiple files with multiple cards, or multiple files with single card per file?
* Test QR code parsed URL redirect to Spotify
  * On mobile (most likely requires authentication to prevent unwanted users to site/webapp)

### Nice-to-have

* Play game on app with others

### Implemented

* Web app that works as a way to scan QR codes and send users to Spotify
  * Timer that counts down until redirecting user to Spotify, after QR code is scanned
  * Preliminary authentication
    * All permitted users have to be added to a list in Spotify Developer API console
      * Limited to 20 in development
* Card scripts rewritten in typescript, using bun, as a single tool with multiple commands
  * Create cards functionality
  * Fetch tracks functionality