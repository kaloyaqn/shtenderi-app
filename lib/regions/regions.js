import { mutate } from "swr";

  export async function createRegion(name) {
    try {
      const res = await fetch("/api/regions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) throw new Error("Грешка при създаване на регион")

      const newRegion = await res.json();

      mutate("/api/regions");
      return newRegion;

    }
    catch (err) {
      return err
    }
  }
