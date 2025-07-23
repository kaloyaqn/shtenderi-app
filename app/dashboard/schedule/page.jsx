"use client";

import BasicHeader from "@/components/BasicHeader";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";

export default function SchedulePage() {
  const [stores, setStores] = useState([]);

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

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <>
      <BasicHeader
        title={"График"}
        subtitle={"Това е страницата с графиците за всеки магазин."}
      />

      <FullCalendar
        viewClassNames={"h-50"}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridWeek"
        editable={true}
        events={[{ title: "Магазин София", start: "2025-07-24" }]}
        dateClick={(e) => console.log("клик", e.dateStr)}
        eventDrop={(info) => console.log("преместен", info.event)}
      />
    </>
  );
}
