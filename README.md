# Hit Song Timeline Quiz tools

App for playing a game where you have to guess the year the song was released on, and optionally the artist and song name.

For now, there are only tools.

To run Next.js app, that shows a QR code for a open.spotify url for a random track on Hitster FI playlist.

To generate QR codes for around 500 tracks across 5 playlists covering several decades of music, run `generate-cards.py` Python script.

## Running `generate-cards.py` Python script

Install pre-requisites:
* [`python-dotenv`](https://pypi.org/project/python-dotenv/)
* [`qrcode`](https://github.com/lincolnloop/python-qrcode)
* [`requests`](https://docs.python-requests.org/en/latest/index.html)
* [`Pillow](https://python-pillow.github.io/)

Create a Spotify Developer account, create a Spotify client, and get Client ID and Client Secret.

Put Client ID and Client Secret to `.env` file, in values
```
SPOTIFY_CLIENT_ID=[Client ID here]
SPOTIFY_CLIENT_SECRET=[Client Secret here]
```

Run `generate-cards.py` with Python:
```bash
python generate-cards.py
```

## Backlog

### High Priority

* Generate "cards", QR code on one side and song info on the other side
  * Fit cards on A4 sheets (300 ppi)
* QR code leads to a page in the app, that has a countdown, which redirects or switches to Spotify once countdown runs out

### Nice-to-have

* Play game on app with others

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Font Licence

https://fontlibrary.org/en/font/cooper-hewitt

OFL (SIL Open Font License)
