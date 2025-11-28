"use client"

import { Edit, EllipsisVertical, Check, X, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function RegionsModal() {

  const [isEditing, setIsEditing] = useState(null);
  const [editValue, setEditValue] = useState("");

  const { data, isLoading, error } = useSWR('/api/regions', fetcher);

  async function editRegion(id) {
    try {

      const res = await fetch(`/api/regions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editValue }),
      });
      if (!res.ok) {
        throw new Error(`Failed to edit region ${id}: ${res.statusText}`);
      }
      const updated = await res.json();
      mutate("/api/regions");
      toast.success("Обновихте региона")

    } catch(err) {
      toast.error(err);
      throw new Error(err)
    }
  }

  async function deleteRegion(id) {
    try {
      const res = await fetch(`/api/regions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to edit region ${id}: ${res.statusText}`);
      }

      mutate("/api/regions");
      toast.success("Изтрихте региона!");

    } catch(err) {
      toast.error(err);
      throw new Error(err)
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full h-full" size="sm" variant="outline">
            <EllipsisVertical className="text-black" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div>
            <DialogTitle>Региони</DialogTitle>
            <DialogDescription>
              Създавай, редактирай, изтривай региони.
            </DialogDescription>
          </div>

          <div className="flex flex-col gap-2">
            {data?.map((region) => (
              <div
                className="p-2 bg-gray-50 border-gray-500 border rounded-sm flex items-center justify-between"
                key={region.id}
              >

                {/* EDITING MODE */}
                {isEditing === region.id ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 mr-2"
                    />

                    <div className="flex gap-1">
                      <Button variant="outline" className='h-8!' size="sm" onClick={() => setIsEditing(null)}>
                        <X />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        console.log("save:", editValue);
                        editRegion(region.id)
                        setIsEditing(null);
                      }}>
                        <Check />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{region.name}</span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(region.id);
                          setEditValue(region.name);
                        }}
                      >
                        <Edit />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          deleteRegion(region.id);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </>
                )}

              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
