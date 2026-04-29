import { NextResponse } from 'next/server';
import { format, parseISO } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const title = searchParams.get('title') || 'Election Day';
    const description = searchParams.get('description') || 'Remember to vote!';

    if (!dateParam) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Google Calendar expects dates in format YYYYMMDD for all-day events, or YYYYMMDDTHHMMSSZ for specific times
    let parsedDate;
    try {
      parsedDate = parseISO(dateParam);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const formattedDate = format(parsedDate, 'yyyyMMdd');
    // Using an all-day event format since election deadlines are typically all day
    const dates = `${formattedDate}/${format(new Date(parsedDate.getTime() + 86400000), 'yyyyMMdd')}`;

    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: title,
      dates: dates,
      details: description,
    });

    const googleCalendarUrl = `${baseUrl}&${params.toString()}`;

    return NextResponse.json({ url: googleCalendarUrl });
  } catch (error) {
    console.error('Error in /api/calendar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
