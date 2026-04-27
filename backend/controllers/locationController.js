/**
 * @desc    Detect user location via IP and determine region
 * @route   GET /api/location/detect
 */
exports.detectLocation = async (req, res, next) => {
  try {
    const { COVERED_COUNTRIES } = await import('../../shared/pricing.js');
    
    // Get IP from request (handling proxies)
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (ip === '::1' || ip === '127.0.0.1' || !ip) {
      ip = ''; 
    } else {
      ip = ip.split(',')[0].trim();
    }

    // Call free IP API
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    
    if (data && data.status === 'success') {
      const countryCode = data.countryCode.toUpperCase();
      const region = COVERED_COUNTRIES.includes(countryCode) ? 'covered' : 'other';
      
      return res.status(200).json({
        country: countryCode,
        region: region
      });
    }

    // Fallback if IP detection fails
    return res.status(200).json({
      country: 'US',
      region: 'other'
    });

  } catch (error) {
    console.error('Location detection error:', error);
    return res.status(200).json({
      country: 'US',
      region: 'other'
    });
  }
};
