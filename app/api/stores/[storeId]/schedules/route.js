import { NextResponse } from 'next/server';
import { getStoreSchedules, addStoreSchedule } from '@/lib/stores/store';

export async function GET(req, { params }) {
  const { storeId } = await params;
  
  try {
    const schedules = await getStoreSchedules(storeId);
    
    // Convert to FullCalendar format if requested
    const url = new URL(req.url);
    const format = url.searchParams.get('format');
    
    if (format === 'fullcalendar') {
      const fullCalendarEvents = schedules.map(schedule => ({
        id: schedule.id,
        title: schedule.notes || schedule.type || 'Schedule',
        start: schedule.date,
        end: schedule.date, // Single day events
        allDay: true,
        backgroundColor: getEventColor(schedule.type),
        borderColor: getEventColor(schedule.type),
        extendedProps: {
          type: schedule.type,
          notes: schedule.notes,
          storeId: schedule.storeId
        }
      }));
      
      return NextResponse.json(fullCalendarEvents);
    }
    
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to get event colors based on type
function getEventColor(type) {
  switch (type) {
    case 'check':
      return '#3b82f6'; // blue
    case 'delivery':
      return '#10b981'; // green
    case 'maintenance':
      return '#f59e0b'; // yellow
    default:
      return '#6b7280'; // gray
  }
}

export async function POST(req, { params }) {
  const { storeId } = await params;
  const body = await req.json();
  const { date, type, notes } = body;
  
  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }
  
  try {
    const schedule = await addStoreSchedule(storeId, date, type, notes);
    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 