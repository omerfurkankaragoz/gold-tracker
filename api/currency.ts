import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Hedef API'ye istek atıyoruz
    const response = await fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR');
    
    // API'den gelen yanıt başarılı değilse, hatayı yakalayıp bildiriyoruz
    if (!response.ok) {
      throw new Error(`Frankfurter API Error: ${response.status} ${response.statusText}`);
    }
    
    // Başarılı yanıtı JSON formatına çeviriyoruz
    const data = await response.json();
    
    // Tarayıcının veriyi 1 saat boyunca cache'lemesini (önbelleğe almasını) söylüyoruz
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    // Başarılı veriyi tarayıcıya gönderiyoruz
    res.status(200).json(data);

  } catch (error: any) {
    // Herhangi bir hata olursa, sunucu hatası olarak bildiriyoruz
    console.error('Error fetching currency data:', error);
    res.status(500).json({ message: 'Error fetching currency data', details: error.message });
  }
}