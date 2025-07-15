import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TableLink from "@/components/ui/table-link";
import { IconCashBanknote, IconCashRegister } from "@tabler/icons-react";
import { CalendarDays, CalendarIcon, User } from "lucide-react";

export default function PaymentsCardMobile({ payment }) {
  return (
    <>
      {/* <div className="border border-gray-200 rounded-md bg-white p-3">
        <p>{payment.createdAt}</p>
        <Separator />
        <div className="flex flex-col w-full gap-3 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 grid place-items-center bg-green-100  text-green-700 rounded-md">
              <IconCashRegister />
            </div>
            <div>
              <span className="text-sm text-gray-600 p-0 m-0 leading-tight">
                Каса
              </span>
              <TableLink
                className="leading-tight p-0 m-0"
                href={`/dashboard/cash-registers/${payment.cashRegister.storage.id}`}
              >
                <p>{payment.cashRegister.storage.name}</p>
              </TableLink>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 grid place-items-center bg-green-100  text-green-700 rounded-md">
              <User />
            </div>
            <div>
              <span className="text-sm text-gray-600 p-0 m-0 leading-tight">
                Потребител
              </span>
              <TableLink
                className="leading-tight p-0 m-0"
                href={`/dashboard/users/edit/${payment.cashRegister.storage.id}`}
              >
                <p>{payment.user.name}</p>
              </TableLink>
            </div>
          </div>
        <Separator />
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 grid place-items-center bg-green-100  text-green-700 rounded-md">
              <IconCashBanknote />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 p-0 m-0 leading-tight">
                Сума
              </span>
                <h2 className="text-gray-900 font-bold text-lg leading-tight">{payment.amount} лв.</h2>
            </div>
          </div>
        </div>

      </div> */}

      <div className="border border-gray-200 rounded-md bg-white p-3 flex flex-col gap-2">
        <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-1">
                <CalendarIcon size={14} className="text-gray-600"/>
                <p className="text-sm text-gray-600">
                    {new Date(payment.createdAt).toLocaleString('BG-bg')}
                </p>
                </div>
                <div>
                    {payment.method === "CASH" ? <>
                        <Badge variant={'outline'}>
                        В брой
                    </Badge>
                    </> : <>
                    <Badge variant={'outline'}>
                        Банка
                    </Badge>
                    </>}
                </div>
        </div>
        <div className="w-full flex justify-between items-center">
            <TableLink href={`/dashboard/cash-registers/${payment.cashRegister.storage.id}`}>
            <p>{payment.cashRegister.storage.name}</p>
            </TableLink>

            <p className={'text-left text-sm text-gray-700'}>
                {payment.user.name}
            </p>
        </div>
        <Separator />
        <div>
            <p className="font-semibold text-lg">{payment.amount} лв.</p>
        </div>
      </div>
    </>
  );
}
