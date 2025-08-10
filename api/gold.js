export default async function handler(req, res) {
  try {
    const response = await fetch('https://finance.truncgil.com/api/today.json');

    if (!response.ok) {
      throw new Error(`Truncgil API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching gold data:', error.message);
    res.status(500).json({
      message: 'Error fetching gold data',
      details: error.message
    });
  }
}
