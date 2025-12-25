import styles from '@/app/page.module.css';

interface Properties {
  searchParams: Promise<{ 
    [key: string]: string | string[] | undefined;
    reason: string | undefined;
  }>
}

export default async function LoggedOutPage({ searchParams }: Properties) {
  const {reason} = await searchParams
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p>Logged out{reason && <span>: {reason}</span>}</p>
      </main>
    </div>
  )
}