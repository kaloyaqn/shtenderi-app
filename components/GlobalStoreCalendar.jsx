"use client";

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Building } from 'lucide-react';

export default function GlobalStoreCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/schedules?format=fullcalendar');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      toast.error('Error loading schedules');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle event drop (drag & drop)
  const handleEventDrop = async (dropInfo) => {
    const { event } = dropInfo;
    
    try {
      const response = await fetch(`/api/stores/${event.extendedProps.storeId}/schedules/${event.id}`, {
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
      const response = await fetch(`/api/stores/${event.extendedProps.storeId}/schedules/${event.id}`, {
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
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  // Handle date click (to add new event)
  const handleDateClick = (dateClickInfo) => {
    const { date } = dateClickInfo;
    console.log('Date clicked:', date);
    // You can open a modal here to add a new event
    toast.info('Click on a store to add a schedule for this date');
  };

  // Get event color based on type
  const getEventColor = (type) => {
    switch (type) {
      case 'check':
        return '#3b82f6';
      case 'delivery':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading calendar...</div>;
  }

  return (
    <>
      <div className="h-[700px]">
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
          eventContent={(arg) => (
            <div className="flex items-center gap-1 text-xs">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getEventColor(arg.event.extendedProps.type) }}
              />
              <span className="truncate">{arg.event.title}</span>
            </div>
          )}
        />
      </div>

      {/* Event Details Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(selectedEvent.start).toLocaleDateString('bg-BG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{selectedEvent.extendedProps.storeName}</span>
                </div>
                
                {selectedEvent.extendedProps.storeAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedEvent.extendedProps.storeAddress}</span>
                  </div>
                )}

                {selectedEvent.extendedProps.partnerName && (
                  <div className="text-sm text-gray-600">
                    Partner: {selectedEvent.extendedProps.partnerName}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: getEventColor(selectedEvent.extendedProps.type),
                    color: getEventColor(selectedEvent.extendedProps.type)
                  }}
                >
                  {selectedEvent.extendedProps.type || 'schedule'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Navigate to store page
                    window.open(`/dashboard/stores/${selectedEvent.extendedProps.storeId}`, '_blank');
                  }}
                >
                  View Store
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEventDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 