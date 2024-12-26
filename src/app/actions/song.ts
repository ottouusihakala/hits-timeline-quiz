'use server'

export const search = async () => {
  const yearRange = '1970-1979';
  const bearerToken = 'not-valid'
  const req = await fetch(`https://api.spotify.com/v1/search?q=year:${yearRange}&type=track&market=FI&limit=1`, {
    headers: {
      'Authorization': `Bearer ${bearerToken}`
    }
  });
  const jsonRes = await req.json();
  console.log('search jsonRes', jsonRes);
  return jsonRes;
}