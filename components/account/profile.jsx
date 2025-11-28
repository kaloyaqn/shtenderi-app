import { IconUserCircle } from "@tabler/icons-react";
import ChangePassword from "../forms/user/ChangePassword";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function Profile({isOpen, setIsOpen}) {
  return (
    <>

      <Dialog open={isOpen} onChange={setIsOpen}>

        <DialogContent>
          <div>
            <DialogTitle>
            Твоят профил
            </DialogTitle>
            <DialogDescription>
              Управлявай профилът си от тук.
            </DialogDescription>
          </div>

          <ChangePassword />
        </DialogContent>
      </Dialog>

    </>
  )
}
