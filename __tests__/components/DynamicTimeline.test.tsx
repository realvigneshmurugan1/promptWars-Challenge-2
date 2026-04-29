import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DynamicTimeline from '@/components/DynamicTimeline/DynamicTimeline';

describe('DynamicTimeline Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          election: {
            name: "General Election",
            electionDay: "2024-11-05"
          }
        }),
      })
    ) as jest.Mock;
  });

  it('renders the form correctly', () => {
    render(<DynamicTimeline />);
    expect(screen.getByRole('heading', { name: /Election Timeline/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your address or zip code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Timeline/i })).toBeInTheDocument();
  });

  it('fetches and displays timeline events', async () => {
    render(<DynamicTimeline />);
    
    const input = screen.getByPlaceholderText(/Enter your address or zip code/i);
    const button = screen.getByRole('button', { name: /Get Timeline/i });

    fireEvent.change(input, { target: { value: '90210' } });
    fireEvent.click(button);

    await waitFor(() => {
      // It should display the visual nodes
      expect(screen.getAllByText('General Election').length).toBeGreaterThan(0);
      // It should display the screen-reader accessible table caption
      expect(screen.getByText('Election Deadlines')).toBeInTheDocument();
    });

    // Check accessibility table
    const table = screen.getByRole('table');
    expect(table).toHaveClass('srOnly');
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' })
      })
    );

    render(<DynamicTimeline />);
    
    const input = screen.getByPlaceholderText(/Enter your address or zip code/i);
    const button = screen.getByRole('button', { name: /Get Timeline/i });

    fireEvent.change(input, { target: { value: '99999' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Failed to fetch election data/i);
    });
  });
});
