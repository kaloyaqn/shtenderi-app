"use client";

import { Label } from "@/components/ui/label";
import { MultiCombobox } from "@/components/ui/multi-combobox";

export default function EntityFilter({ 
  stands,
  selectedStand,
  setSelectedStand,
  users,
  selectedUser,
  setSelectedUser,
  partners,
  selectedPartner,
  setSelectedPartner,
  hidePartners = false,
  hideStands = false,
  hideUsers = false
}) {
  const standOptions = [
    ...(stands.length > 0
      ? stands.map((stand) => ({
          value: stand.id,
          label: stand.name,
        }))
      : []),
  ];

  const userOptions = [
    ...users.map((user) => ({
      value: user.id,
      label: user.name,
    })),
  ];

  const partnerOptions = [
    ...partners.map((partner) => ({
      value: partner.id,
      label: partner.name,
    })),
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {!hidePartners && (
        <div className="w-full">
          <Label className="mb-2">Партньори</Label>
          <MultiCombobox
            options={partnerOptions}
            value={selectedPartner}
            onValueChange={setSelectedPartner}
            placeholder={"Избери партньор..."}
            emptyText="Няма намерени партньори..."
            className="w-full"
          />
        </div>
      )}
      {!hideStands && (
        <div className="w-full">
          <Label className="mb-2">Щендер</Label>
          <MultiCombobox
            options={standOptions}
            value={selectedStand}
            onValueChange={setSelectedStand}
            placeholder="Избери щендер..."
            searchPlaceholder="Търси щендери..."
            emptyText="Няма намерени щендери."
            className="w-full"
          />
        </div>
      )}
      {!hideUsers && (
        <div className="w-full">
          <Label className="mb-2">Потребител</Label>
          <MultiCombobox
            options={userOptions}
            value={selectedUser}
            onValueChange={setSelectedUser}
            placeholder={"Избери потребител..."}
            emptyText="Няма намерени потребители..."
            className="w-full"
          />
        </div>
      )}
    </div>
  );
} 