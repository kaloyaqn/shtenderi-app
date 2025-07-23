"use client";

import BasicHeader from "@/components/BasicHeader";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Draggable } from "@fullcalendar/interaction";

import { useEffect, useRef, useState } from "react";
import { addDays } from "date-fns";

export default function SchedulePage() {
  const [stores, setStores] = useState([]);

  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!sidebarRef.current) return;

    new Draggable(sidebarRef.current, {
      itemSelector: ".fc-draggable",
      eventData: (eventEl) => ({
        title: eventEl.innerText,
        id: eventEl.getAttribute("data-id"),
      }),
    });
  }, []);

  const events = stores.map((store) => {
    const offset = dayMap[store.visit_day]; // get index of day
    // const visitDate = addDays(schedule, offset);
    return {
      id: store.id.toString(),
      title: store.name,
      start: new Date(store.schedule).toISOString().split("T")[0],
      allDay: true,
    };
  });

  async function fetchStores() {
    try {
      const res = await fetch("/api/stores");
      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      setStores(data);
      console.log(data);
    } catch (err) {
      throw new Error(err);
    }
  }

  // Accept storeId directly, not the whole store object
  const moveDate = async (schedule, storeId) => {
    const id = storeId;
    const data = {
      schedule: schedule,
    };

    console.log(id);

    try {
      const res = await fetch(`/api/stores/${id}?schedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error);
      }
      console.log("stana mai");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <>
      <BasicHeader
        title={"График"}
        subtitle={"Това е страницата с графиците за всеки магазин."}
      />



      <div id="external-events" ref={sidebarRef}>

      {stores.map((store) => {
          return (
              <div
                key={store.id}
                className="fc-draggable bg-blue-200 p-1 mb-2 cursor-pointer"
                data-id={`${store.id}`}
              >
                {store.name}
              </div>
          );
      })}
      </div>

      <FullCalendar
        viewClassNames={"h-50"}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridWeek"
        editable={true}
        droppable={true}
        events={events}
        dateClick={(e) => console.log("клик", e.dateStr)}
        eventReceive={(info) => {
          console.log("Dropped external event:", info.event);
          // Optionally persist it in your state or backend
          const id = info.event._def.publicId;
          const newDate = moveDate(
            new Date(info.event._instance.range.start).toISOString(),
            id
          );
          console.log("преместен", newDate, id);
        }}
        eventDrop={(info) => {
          const id = info.event._def.publicId;
          const newDate = moveDate(
            new Date(info.event._instance.range.start).toISOString(),
            id
          );
          console.log("преместен", newDate, id);
        }}
      />
    </>
  );
}
