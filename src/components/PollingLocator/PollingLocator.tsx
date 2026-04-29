"use client";

import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import styles from './PollingLocator.module.css';

interface Place {
  id: string;
  displayName: { text: string; languageCode: string };
  formattedAddress: string;
  location?: { latitude: number; longitude: number };
}

export default function PollingLocator() {
  const [zipCode, setZipCode] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlaces([]);

    try {
      const res = await fetch(`/api/places?zipCode=${encodeURIComponent(zipCode)}`);
      if (!res.ok) {
        throw new Error('Failed to find locations for this zip code.');
      }
      
      const data = await res.json();
      setPlaces(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.locatorContainer}>
      <h2 className={styles.heading}>Find Polling Locations</h2>
      <p className={styles.description}>
        Enter your zip code to find nearby official polling places or ballot drop boxes.
      </p>

      <form onSubmit={searchLocations} className={styles.form}>
        <label htmlFor="zip-input" className={styles.srOnly}>Enter Zip Code</label>
        <input
          id="zip-input"
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="e.g., 90210"
          className={styles.input}
          required
          pattern="^\d{5}(-\d{4})?$"
          title="5 digit US zip code"
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {places.length > 0 && (
        <ul className={styles.resultsList} aria-live="polite">
          {places.map((place, index) => (
            <li key={place.id || index} className={styles.resultItem}>
              <MapPin className={styles.icon} aria-hidden="true" />
              <div className={styles.placeDetails}>
                <h3 className={styles.placeName}>{place.displayName?.text || 'Official Location'}</h3>
                <p className={styles.placeAddress}>{place.formattedAddress}</p>
                {place.location && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLink}
                  >
                    View on Map
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && places.length === 0 && zipCode.length === 5 && (
        <p className={styles.noResults} aria-live="polite">
          No locations found. Try a different zip code or check closer to the election date.
        </p>
      )}
    </div>
  );
}
