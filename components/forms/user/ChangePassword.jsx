import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { IconLockPassword } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  async function submit() {
    const { data, error } = await authClient.changePassword({
      newPassword,
      currentPassword,
      revokeOtherSessions: true,
    });

    console.log(data, error);

    if (!error) {
      toast.success("Паролата е сменена успешно!");
    } else {
      toast.error(error.message || "Грешка при смяна на паролата");
    }
  }

  return (
    <div className="w-full">
      <h3 className="mb-4 text-xl font-semibold">Смяна на парола</h3>

      {/* CURRENT PASSWORD */}
      <div className="mb-3">
        <Label className="mb-2">Текуща парола</Label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Въведи текуща парола"
        />
      </div>

      {/* NEW PASSWORD */}
      <div className="mb-3">
        <Label className="mb-2">Нова парола</Label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Въведи нова парола"
        />
      </div>

      <Button className="w-full mt-4" onClick={submit}>
        <IconLockPassword /> Промени парола
      </Button>
    </div>
  );
}
