"use client";

import LogoStendo from "@/public/svg/LogoStendo";
import { useMemo, useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import styled, { createGlobalStyle } from "styled-components";
import { Button } from "../ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import BarcodeVisualization from "../ui/BarcodeVisualization";
import Image from "next/image";

// Global style for print font-size override
const PrintFontSizeOverride = createGlobalStyle`
  @media print {
    .offer-table th,
    .offer-table td {
      font-size: 10px !important;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  &.offer-table th,
  &.offer-table td {
    font-size: 14px;
  }
`;

const Th = styled.th`
  border-bottom: 2px solid #e5e7eb;
  font-weight: semibold;
  padding: 0.2rem;
  text-align: left;
  background: #f9fafb;
  font-size: 14px;
`;

const Td = styled.td`
  border-bottom: 1px solid #e5e7eb;
  padding: 0rem;
  font-size: 14px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #f3f4f6;
  }
`;

const Input = styled.input`
  width: 60px;
  padding: 0.25rem 0.5rem;
`;

export default function ProductOffer({ checkedProducts, products }) {
  const [quantities, setQuantities] = useState({});
  const [type, setType] = useState("/стандарт/");
  const tableRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: tableRef,
  });

  const sameItems = useMemo(() => {
    if (!Array.isArray(checkedProducts) || !Array.isArray(products)) return [];
    return products.filter((p) => checkedProducts.includes(p.id));
  }, [checkedProducts, products]);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const initialRows = sameItems.map((item) => ({
      type: "product",
      item,
    }));
    setRows(initialRows);
  }, [sameItems]);

  function addRow(index) {
    const newRows = [...rows];
    newRows.splice(index + 1, 0, { type: "text", value: "" });
    setRows(newRows);
  }

  // Add a custom row before the first row
  function addRowAtStart() {
    setRows((prevRows) => [{ type: "text", value: "" }, ...prevRows]);
  }

  // Remove a custom row (only if it's a text row)
  function removeRow(index) {
    setRows((prevRows) => {
      if (prevRows[index] && prevRows[index].type === "text") {
        const newRows = [...prevRows];
        newRows.splice(index, 1);
        return newRows;
      }
      return prevRows;
    });
  }

  let totalQuantity = 0;
  let sumClientPrice = 0;
  let sumPcd = 0;

  rows.forEach((row) => {
    if (row.type === "product") {
      const quantity = parseInt(quantities[row.item.id], 10) || 0;
      totalQuantity += quantity;
      sumClientPrice += quantity * (row.item.clientPrice || 0);
      sumPcd += quantity * (row.item.pcd || 0);
    }
  });

  return (
    <>
      <PrintFontSizeOverride />
      <Button onClick={() => handlePrint()}>Принт</Button>
      <Button
        variant="outline"
        className="ml-2 mb-2"
        onClick={addRowAtStart}
        type="button"
      >
        <PlusIcon className="mr-2" />
        Добави ред в началото
      </Button>

      <div ref={tableRef}>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2 items-center">
              <LogoStendo className="size-13!" />
              <div>
                <h3 className="font-semibold text-2xl leading-tight text-gray-900">
                  Stendo
                </h3>
                <p className="text-gray-600 text-sm">
                  Щендери, които работят за теб.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl text-right uppercase font-semibold">
                Оферта щендер
              </h3>
              <input
                type="text"
                className="text-right text-2xl font-medium text-gray-600"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Table className="offer-table">
          <thead>
            <tr>
              <Th>Снимка</Th>
              <Th>Продуктово наименование</Th>
              <Th className="w-30">Кол.</Th>
              <Th>ЦД с ДДС</Th>
              <Th style={{ textAlign: "right" }}>ПЦД с ДДС</Th>
              <Th style={{ textAlign: "right" }}>Надценка %</Th>
              <Th style={{ textAlign: "right" }}>Баркод</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) =>
              row.type === "product" ? (
                <Tr
                  className={`relative group${
                    !quantities[row.item.id] || Number(quantities[row.item.id]) === 0
                      ? " bg-red-100!"
                      : "bg-white"
                  }`}
                  key={row.item.id}
                >
                  <Td>
                    
                    <img src={row.item.image} alt={row.item.name} width={120} height={120} />
                  </Td>
                  <Td>{row.item.name}</Td>
                  <Td>
                    <Input
                      min="0"
                      type="number"
                      placeholder="0"
                      value={quantities[row.item.id] || ""}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [row.item.id]: e.target.value,
                        }))
                      }
                    />
                  </Td>
                  <Td>{row.item.clientPrice} лв.</Td>
                  <Td className="text-right">{row.item.pcd} лв.</Td>

                  <Td className="text-right">
                    {row.item.clientPrice && row.item.pcd
                      ? `${(
                          ((row.item.pcd - row.item.clientPrice) /
                            row.item.clientPrice) *
                          100
                        ).toFixed(1)}%`
                      : "—"}
                  </Td>
                  <Td className="text-right w-36 px-4">
                  <BarcodeVisualization className="bg-transparent px-4" barcode={row.item.barcode} />

                  </Td>
                  {/* Centered plus button, appears on row hover */}
                  <td
                    colSpan={5}
                    style={{
                      position: "absolute",
                      left: 0,
                      width: "100%",
                      height: "100%",
                      top: 0,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      className="flex justify-center items-center h-full"
                      style={{
                        height: "100%",
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      <Button
                        size="icon"
                        onClick={() => addRow(i)}
                        className="print:hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          pointerEvents: "auto",
                        }}
                        tabIndex={-1} // Make the button not focusable with tab
                        aria-hidden="true" // Optional: hide from screen readers as well
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </td>
                </Tr>
              ) : (
                <Tr key={`text-${i}`}>
                  <Td colSpan={6} className="relative">
                    <input
                      style={{
                        width: "100%",
                        minHeight: "10px",
                        fontSize: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        textAlign: "center",
                      }}
                      placeholder="Добави описание / коментар..."
                      className="bg-[#1A9552] text-gray-900 font-bold"
                      value={row.value}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[i].value = e.target.value;
                        setRows(newRows);
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeRow(i)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 print:hidden"
                      style={{
                        pointerEvents: "auto",
                      }}
                      tabIndex={0}
                      aria-label="Премахни ред"
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </Td>
                </Tr>
              )
            )}

            <Tr>
              <Td colSpan={2}></Td>
              <Td colSpan={2} style={{ textAlign: "left" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <div>Брой аксесоари:</div>
                  <div>Общо ПЦД:</div>
                  <div>Общо покупна цена:</div>
                  <div>Брутна разлика:</div>
                </div>
              </Td>
              <Td colSpan={2} style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <div>{totalQuantity} бр.</div>
                  <div>{sumPcd.toFixed(2)} лв.</div>
                  <div>{sumClientPrice.toFixed(2)} лв.</div>
                  <b>{(sumPcd - sumClientPrice).toFixed(2)} лв.</b>
                </div>
              </Td>
            </Tr>
          </tbody>
        </Table>

        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-gray-800 text-sm">
              <span className="font-medium">
                Асен Хаджиев: +359 999 955 000
              </span>
              <br />
              <span className="text-xs font-bold">
                /Мениджър търговска мрежа /
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-800 text-sm text-right">
              <span className="font-medium">
              Пламена Ташева : +359 877 974 439

              </span>
              <br />
              <span className="text-xs font-bold">
                /Търговски Представител /
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
