import { NextResponse } from 'next/server';
import { validateAddress } from '@/utils/validation';
import cache from '@/lib/cache';

const GOOGLE_CIVIC_API_KEY = process.env.GOOGLE_API_KEY;
const CIVIC_API_URL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const validation = validateAddress(address);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitizedAddress = validation.data;
    const cacheKey = `civic_${sanitizedAddress.toLowerCase()}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    if (!GOOGLE_CIVIC_API_KEY) {
      console.warn("GOOGLE_API_KEY is not set. API will likely fail.");
    }

    const apiUrl = `${CIVIC_API_URL}?address=${encodeURIComponent(sanitizedAddress)}&key=${GOOGLE_CIVIC_API_KEY}&electionId=2000`; // 2000 is for VIP Test Election or default

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Civic API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch civic data', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    // We only need specific fields for neutrality and privacy
    // Filter out candidates/parties if any leak through, but 'voterinfo' with electionId=2000 usually just gives polling places and state info
    const filteredData = {
      election: data.election,
      pollingLocations: data.pollingLocations || [],
      earlyVoteSites: data.earlyVoteSites || [],
      dropOffLocations: data.dropOffLocations || [],
      state: data.state ? data.state.map((s: any) => ({
        name: s.name,
        electionAdministrationBody: s.electionAdministrationBody
      })) : []
    };

    cache.set(cacheKey, filteredData);

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Error in /api/civic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
