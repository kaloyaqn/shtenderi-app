import { NextResponse } from 'next/server';
import { getStoresWithSchedules, getStoresByScheduleDate } from '@/lib/stores/store';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get('format');
    const date = url.searchParams.get('date');
    
    let schedules;
    
    // If specific date is provided, get stores with schedules on that date
    if (date) {
      schedules = await getStoresByScheduleDate(date);
    } else {
      // Get all stores with their schedules
      const storesWithSchedules = await getStoresWithSchedules();
      
      // Flatten the schedules from all stores
      schedules = storesWithSchedules.flatMap(store => 
        store.schedules.map(schedule => ({
          ...schedule,
          store: {
            id: store.id,
            name: store.name,
            address: store.address,
            partner: store.partner
          }
        }))
      );
    }
    
    // Convert to FullCalendar format if requested
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
          storeId: schedule.storeId,
          storeName: schedule.store?.name || 'Unknown Store',
          storeAddress: schedule.store?.address,
          partnerName: schedule.store?.partner?.name
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