'use client'

import { useMemo, useState } from "react";
import styled from "styled-components";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
`;

const Th = styled.th`
  border-bottom: 2px solid #e5e7eb;
  font-weight: semibold;
  padding: 0.5rem;
  text-align: left;
  background: #f9fafb;
`;

const Td = styled.td`
  border-bottom: 1px solid #e5e7eb;
  padding: 0.5rem;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #f3f4f6;
  }
`;

const Input = styled.input`
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

export default function ProductOffer({ checkedProducts, products }) {
  // Store all input values individually by product id
  const [quantities, setQuantities] = useState({});

  const sameItems = useMemo(() => {
    if (!Array.isArray(checkedProducts) || !Array.isArray(products)) return [];
    return products.filter((p) => checkedProducts.includes(p.id));
  }, [checkedProducts, products]);

  // Calculate total quantity
  const totalQuantity = sameItems.reduce(
    (sum, item) => sum + (parseInt(quantities[item.id], 10) || 0),
    0
  );

  return (
    <>
      <Table>
        <thead>
          <tr>
          <Th>Снимка</Th>

            <Th>Продуктово наименование</Th>
            <Th className="w-30">Кол.</Th>
            <Th>ЦД с ДДС</Th>
            <Th>ПЦД с ДДС</Th>
          </tr>
        </thead>
        <tbody>
          {sameItems.map((item) => (
            <Tr key={item.id}>
              <Td>
                {item.image && (
                    <img
                    className="border rounded-sm"
                    src={item.image} width={50}
                    />
                )}
              </Td>
              <Td>{item.name}</Td>
              <Td className="max-w-10">
                <Input
                  min="0"
                  type="number"
                  name={`quantity-${item.id}`}
                  placeholder="0"
                  value={quantities[item.id] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQuantities((prev) => ({
                      ...prev,
                      [item.id]: value,
                    }));
                  }}
                />
              </Td>
              <Td>{item.clientPrice} лв.</Td>
              <Td>{item.pcd} лв.</Td>
            </Tr>
          ))}
          <Tr>
            <td></td>
            <td></td>
            <Td>
              Общ брой: {totalQuantity}
            </Td>
            <Td>
                {sameItems.forEach(item => {
                  // You can add your logic here for each item, e.g. summing or displaying info
                  // Example: console.log(item);
                  let sum;
                })}
            </Td>
          </Tr>
        </tbody>
      </Table>
      {/* {JSON.stringify(sameItems)} */}
    </>
  );
}
