import NodeCache from 'node-cache';

// Cache for 1 hour by default
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export default cache;
