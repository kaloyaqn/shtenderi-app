import { HelpCircle } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

const stepsByPath = {
    "/dashboard": [
      {
        title: "Щендери",
        content: "Тук виждаш наличността в касата си. Това също е бутон към страницата с касата ти.",
      },
    ],
    "/dashboard/resupply": [
        {
          title: "Трансфери",
          content: <>

            <h1 className="text-xl font-semibold text-gray-900">Преместване между щандове</h1>
            <p>
                Преместването между щендери става по следния начин:
            </p>
            <ol className="list-decimal pl-6">
              <li>Избираш изходен щендер - това е щендерът, от който идва стоката</li>
              <li>Избираш дестинация щанд - това е щендерът, в който ще влезне стоката</li>
              <li>Избираш стоката сканирайки баркода на продукта, който искаш да преместиш. Колкото пъти го пиунеш, толкова бройки ще се прехвърлят {"(ако има налични в щендера)"}</li>
              <li>След като си избрал продуктите, които искаш да преместиш, натискаш "Траснфер"</li>
            
            </ol>
          </>
        },
      ],
    "/dashboard/stands": [
      {
        title: "Щендери",
        content: "Това е страницата със щендери. От тук можеш да видиш твоите зачислени щендери. Също така можеш да видиш на кой Партньор са, в кой магазин са и колко позиции има на тях.",
      },
    ],
    "/dashboard/stands/[standId]": [
      {
        title: "Детайли за щендер",
        content: "Това е страницата на конкретен щендер.",
      },
    ],
  };

function getHelpStepsForPath(pathname) {
  if (stepsByPath[pathname]) return stepsByPath[pathname];
  for (const pattern in stepsByPath) {
    const regex = new RegExp('^' + pattern.replace(/\[.*?\]/g, '[^/]+') + '$');
    if (regex.test(pathname)) {
      return stepsByPath[pattern];
    }
  }
  return [];
}

export default function HelpModal() {
  const pathname = usePathname();
  const steps = getHelpStepsForPath(pathname);

    return (
      <div className="w-full flex justify-end items-center">
        <Drawer>
          <DrawerTrigger asChild>
            <HelpCircle className="cursor-pointer text-gray-500" />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {steps[0]?.title || "Помощ"}
              </DrawerTitle>
              {/* <DrawerDescription>Това е помощен текст за тази страница.</DrawerDescription> */}
            </DrawerHeader>
            <div style={{ padding: '0 16px' }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  {step.title && idx !== 0 && <strong>{step.title}</strong>}
                  <div>{step.content}</div>
                </div>
              ))}
            </div>
            <DrawerFooter>
              <DrawerClose>
                Ок разбрах
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    )
}