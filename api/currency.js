export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR');

    if (!response.ok) {
      throw new Error(`Frankfurter API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching currency data:', error.message);
    res.status(500).json({
      message: 'Error fetching currency data',
      details: error.message
    });
  }
}
