import { NextResponse } from 'next/server';
import { updateStoreScheduleItem, deleteStoreSchedule } from '@/lib/stores/store';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { scheduleId } = await params;
  
  try {
    const schedule = await prisma.storeSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        store: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    
    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { scheduleId } = await params;
  const body = await req.json();
  
  // Handle FullCalendar event format
  // FullCalendar typically sends: { start, end, title, allDay, etc. }
  const updateData = {
    date: body.start || body.date,
    type: body.type || body.eventType,
    notes: body.notes || body.title || body.description
  };
  
  // Remove undefined values
  Object.keys(updateData).forEach(key => 
    updateData[key] === undefined && delete updateData[key]
  );
  
  try {
    const schedule = await updateStoreScheduleItem(scheduleId, updateData);
    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { scheduleId } = await params;
  
  try {
    await deleteStoreSchedule(scheduleId);
    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 