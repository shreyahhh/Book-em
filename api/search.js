export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract query parameters and forward them to Open Library
    const queryString = new URLSearchParams(req.query).toString();
    const openLibraryUrl = `https://openlibrary.org/search.json?${queryString}`;

    console.log('Proxying request to:', openLibraryUrl);

    const response = await fetch(openLibraryUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BookFinder/1.0 (Vercel Proxy)',
      },
    });

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the data
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch from Open Library',
      message: error.message 
    });
  }
}
