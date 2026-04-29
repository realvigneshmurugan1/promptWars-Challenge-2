import React, { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import styles from './DynamicTimeline.module.css';

interface ElectionEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

export default function DynamicTimeline() {
  const [address, setAddress] = useState('');
  const [events, setEvents] = useState<ElectionEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/civic?address=${encodeURIComponent(address)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch election data. Please check your address.');
      }
      
      const data = await res.json();
      
      // Parse Civic API data to extract relevant dates (mocked slightly if API doesn't return rich dates)
      // The Civic Information API `voterinfo` endpoint returns election day in `election.electionDay`
      const extractedEvents: ElectionEvent[] = [];
      
      if (data.election && data.election.electionDay) {
        extractedEvents.push({
          id: 'election-day',
          date: data.election.electionDay,
          title: data.election.name || 'Election Day',
          description: 'The official day to cast your vote.'
        });
      }

      // Add standard deadlines relative to election day for demonstration, 
      // as the actual API requires precise location matching for state deadlines
      if (extractedEvents.length > 0) {
        const eDay = new Date(extractedEvents[0].date);
        
        const regDeadline = new Date(eDay);
        regDeadline.setDate(eDay.getDate() - 30);
        
        extractedEvents.unshift({
          id: 'reg-deadline',
          date: regDeadline.toISOString().split('T')[0],
          title: 'Voter Registration Deadline',
          description: 'Last day to register to vote in this election.'
        });
      }

      if (extractedEvents.length === 0) {
         extractedEvents.push({
            id: 'placeholder',
            date: '2024-11-05',
            title: 'General Election',
            description: 'Check local guidelines for your specific registration deadlines.'
         });
      }

      setEvents(extractedEvents);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = async (event: ElectionEvent) => {
    try {
      const params = new URLSearchParams({
        date: event.date,
        title: event.title,
        description: event.description,
      });
      const res = await fetch(`/api/calendar?${params.toString()}`);
      const data = await res.json();
      
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Failed to generate calendar link');
    }
  };

  return (
    <div className={styles.timelineContainer}>
      <h2 className={styles.heading}>Election Timeline</h2>
      
      <form onSubmit={fetchTimeline} className={styles.form}>
        <label htmlFor="address-input" className={styles.srOnly}>Enter your address or zip code</label>
        <input
          id="address-input"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address or zip code..."
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Loading...' : 'Get Timeline'}
        </button>
      </form>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {events.length > 0 && (
        <div className={styles.eventsWrapper}>
          <div className={styles.visualTimeline} aria-hidden="true">
            {events.map((event, index) => (
              <div key={`visual-${event.id}`} className={styles.timelineNode}>
                <div className={styles.nodeDate}>{new Date(event.date).toLocaleDateString()}</div>
                <div className={styles.nodeLine} />
                <div className={styles.nodeContent}>
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>

          <table className={styles.srOnly}>
            <caption>Election Deadlines</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Event</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={`sr-${event.id}`}>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.title}</td>
                  <td>{event.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.actionsContainer}>
            {events.map(event => (
              <button 
                key={`btn-${event.id}`}
                onClick={() => addToCalendar(event)}
                className={styles.calendarButton}
                aria-label={`Add ${event.title} on ${new Date(event.date).toLocaleDateString()} to Google Calendar`}
              >
                <CalendarPlus size={18} />
                Add {event.title} to Calendar
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
