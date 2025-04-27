import styles from '../page.module.css';

interface Properties {
  searchParams: Promise<{ 
    [key: string]: string | string[] | undefined;
    error: string | undefined;
  }>
}

export default async function ErrorPage({ searchParams }: Properties) {
  const error = (await searchParams).error
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p>Error: {error}</p>
      </main>
    </div>
  )
}