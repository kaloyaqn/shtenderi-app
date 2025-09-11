"use client"

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export default function CommandProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, error, isLoading } = useSWR(
    searchQuery ? `/api/products/search?q=${encodeURIComponent(searchQuery)}` : null,
    fetcher
  );

  const handleKeyPress = useCallback((event) => {
    
    if (
      event.ctrlKey &&
      (event.key === "k" || event.key === "K" || event.key === "К" || event.key === "к")
    ) {
      event.preventDefault();
      setIsOpen(true);
    }
  }, []);

  const handleSearch = () => {
    setSearchQuery(input);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <>
      {children}

      <Dialog className="w-full! " open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="py-5! px-5! max-w-7xl!">
          <div>
            <DialogTitle>
              Номенклатура
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-1">
              Потърси номенклатура по баркод, продуктов код, име и второ име.
            </DialogDescription>
          </div>

          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Потърси"
            onKeyDown={e => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            Потърси
          </Button>

          <div className="mt-4">
            {isLoading && <div>Зареждане...</div>}
            {error && <div className="text-red-500">Грешка при търсене.</div>}
            {data && Array.isArray(data) && data.length === 0 && (
              <div>Няма намерени резултати.</div>
            )}
            {data && Array.isArray(data) && data.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left font-semibold">Име</TableHead>
                    <TableHead className="text-left font-semibold">Код</TableHead>
                    <TableHead className="text-left font-semibold">Баркод</TableHead>

                    <TableHead className="text-left font-semibold">Доставна</TableHead>
                    <TableHead className="text-left font-semibold">Продажна</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((product) => (
                    <TableRow key={product.id} className="border-b">
                      <TableCell className="py-2 ">{product.name}</TableCell>
                      <TableCell className="py-2 ">{product.pcode}</TableCell>
                      <TableCell className="py-2 ">{product.barcode}</TableCell>

                      <TableCell className="py-2">{product.deliveryPrice} лв.</TableCell>
                      <TableCell className="py-2">{product.clientPrice} лв.</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}