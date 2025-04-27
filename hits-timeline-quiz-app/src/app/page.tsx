import Form from "next/form";
import styles from "./page.module.css";
import { openTrack } from "./actions/tracks";
import SpotifyUrlRedirectTimer from "./components/spotifyUrlRedirectTimer";
import { checkCookie } from "./actions/auth";

interface Properties {
  searchParams: Promise<{ 
    [key: string]: string | string[] | undefined;
    spotifyUrl: string | undefined;
  }>
}

export default async function Home({ searchParams }: Properties) {
  await checkCookie();
  const spotifyUrl = searchParams.then((sp) => sp.spotifyUrl)

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SpotifyUrlRedirectTimer spotifyUrlPromise={spotifyUrl} />
        <Form action={openTrack}>
          <div>
            <label htmlFor="qrCodeInput">QR Code</label>
            <input id="qrCodeInput" type="file" name="qrCode" />
            <button type="submit">Submit</button>
          </div>
        </Form>
      </main>
    </div>
  );
}
