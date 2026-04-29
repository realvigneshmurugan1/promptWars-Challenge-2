import { NextResponse } from 'next/server';
import { validateZipCode } from '@/utils/validation';
import cache from '@/lib/cache';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode');

    if (!zipCode) {
      return NextResponse.json({ error: 'Zip Code is required' }, { status: 400 });
    }

    const validation = validateZipCode(zipCode);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitizedZipCode = validation.data;
    const cacheKey = `places_${sanitizedZipCode}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("GOOGLE_API_KEY is not set.");
    }

    const apiUrl = 'https://places.googleapis.com/v1/places:searchText';
    const requestBody = {
      textQuery: `official ballot drop box OR polling place near ${sanitizedZipCode}`,
      languageCode: 'en'
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY || '',
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Places API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch places data', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    cache.set(cacheKey, data.places || []);

    return NextResponse.json(data.places || []);
  } catch (error) {
    console.error('Error in /api/places:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
