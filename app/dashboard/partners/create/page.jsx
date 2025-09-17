"use client";

import BaseForm from "@/components/forms/BaseForm";
import { fetcher } from "@/lib/utils";
import { partnerSchema } from "@/lib/validations/partnerScheme";
import { useState } from "react";


export default function CreatePartnerPage({ fetchPartners }) {
  const [percentageDiscount, setPercentageDiscount] = useState(0);

  const handlePercentageDiscountChange = (e) => {
    const value = e.target.value;

    setPercentageDiscount(value === "" ? 0 : Number(value));
  };

  const fields = [
    { name: "name", label: "Име на фирмата", placeholder: "Въведете име", type: "text", required: true },
    { name: "bulstat", label: "ЕИК/Булстат", placeholder: "Въведете булстат", type: "text" },
    { name: "country", label: "Държава", placeholder: "Въведете държава", type: "text" },
    { name: "city", label: "Град", placeholder: "Въведете град", type: "text" },
    { name: "address", label: "Адрес", placeholder: "Въведете адрес", type: "text" },
    { name: "mol", label: "МОЛ", placeholder: "Въведете МОЛ", type: "text" },
    { name: "email", label: "Имейл", placeholder: "example@domain.com", type: "email" },
    {
      name: "percentageDiscount",
      label: "Процентна отстъпка",
      type: "number",
      step: 1,
      min: 0,
      max: 100,
      onChange: handlePercentageDiscountChange,
      value: percentageDiscount,
    },
    { name: "contactPerson", label: "Лице за контакт", placeholder: "Въведете лице за контакт", type: "text" },
    { name: "phone", label: "Телефон", placeholder: "Въведете телефон", type: "text" },
  ].filter(Boolean); // Remove any falsey fields

  return (
    <>
      <BaseForm
        schema={partnerSchema}
        fields={fields}
        endpoint="/api/partners"
        submitText="Създай"
        successMessage="Успешно създадохте партньор"
        errorMessage="Грешка при създаване"
        onSuccess={fetchPartners}
        defaultValues={{
          percentageDiscount: 0,
        }}
      />
    </>
  );
}