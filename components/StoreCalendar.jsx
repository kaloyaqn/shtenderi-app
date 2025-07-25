"use client";

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'sonner';

export default function StoreCalendar({ storeId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events
  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}/schedules?format=fullcalendar`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      toast.error('Error loading schedule');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [storeId]);

  // Handle event drop (drag & drop)
  const handleEventDrop = async (dropInfo) => {
    const { event } = dropInfo;
    
    try {
      const response = await fetch(`/api/stores/${storeId}/schedules/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: event.start,
          type: event.extendedProps.type,
          notes: event.extendedProps.notes
        })
      });

      if (!response.ok) throw new Error('Failed to update event');
      
      toast.success('Schedule updated successfully');
      await fetchEvents(); // Refresh events
    } catch (error) {
      toast.error('Error updating schedule');
      console.error('Error updating event:', error);
      await fetchEvents(); // Refresh to revert changes
    }
  };

  // Handle event resize
  const handleEventResize = async (resizeInfo) => {
    const { event } = resizeInfo;
    
    try {
      const response = await fetch(`/api/stores/${storeId}/schedules/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: event.start,
          end: event.end,
          type: event.extendedProps.type,
          notes: event.extendedProps.notes
        })
      });

      if (!response.ok) throw new Error('Failed to update event');
      
      toast.success('Schedule updated successfully');
      await fetchEvents(); // Refresh events
    } catch (error) {
      toast.error('Error updating schedule');
      console.error('Error updating event:', error);
      await fetchEvents(); // Refresh to revert changes
    }
  };

  // Handle event click
  const handleEventClick = (clickInfo) => {
    const { event } = clickInfo;
    console.log('Event clicked:', event);
    // You can open a modal here to edit the event
  };

  // Handle date click (to add new event)
  const handleDateClick = (dateClickInfo) => {
    const { date } = dateClickInfo;
    console.log('Date clicked:', date);
    // You can open a modal here to add a new event
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading calendar...</div>;
  }

  return (
    <div className="h-[600px]">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="100%"
      />
    </div>
  );
} 