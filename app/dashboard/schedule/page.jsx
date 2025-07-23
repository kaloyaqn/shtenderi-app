"use client";

import BasicHeader from "@/components/BasicHeader";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Draggable } from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";


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

  const weekdayMap = ["su", "mo", "tu", "we", "th", "fr", "sa"];


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
    const startDate = new Date(store.schedule);
    const weekday = startDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  
    return {
      id: store.id.toString(),
      title: store.name,
      rrule: {
        freq: "weekly",
        byweekday: weekdayMap[weekday],
        dtstart: startDate.toISOString(), // first visible occurrence
      },
      allDay: true,
      color: store.color || getRandomColor(),
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
      fetchStores();
    } catch (err) {
      console.log(err);
    }
  };

  function getRandomColor() {
    const colors = [
      "#f87171",
      "#facc15",
      "#34d399",
      "#60a5fa",
      "#c084fc",
      "#f472b6",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <>
      <BasicHeader
        title={"График"}
        subtitle={"Това е страницата с графиците за всеки магазин."}
      />

      <div className="grid grid-cols-12 gap-2">
        <div id="external-events"
        className="col-span-2"
        ref={sidebarRef}>
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

          <div className="col-span-10">

        <FullCalendar
          viewClassNames={"h-50 "}
          plugins={[dayGridPlugin, interactionPlugin, rrulePlugin]}
          initialView="dayGridWeek"
          editable={true}
          droppable={true}
          locale={"bg"}
          locales={"bg"}
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
          </div>
      </div>
    </>
  );
}
