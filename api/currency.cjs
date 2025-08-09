// Use 'require' instead of 'import'
const fetch = require('node-fetch');

// Use 'module.exports' instead of 'export default'
module.exports = async (req, res) => {
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR');
    
    if (!response.ok) {
      throw new Error(`Frankfurter API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching currency data:', error.message);
    res.status(500).json({ message: 'Error fetching currency data', details: error.message });
  }
};