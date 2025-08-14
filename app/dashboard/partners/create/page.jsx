"use client";

import BaseForm from "@/components/forms/BaseForm";
import { partnerSchema } from "@/lib/validations/partnerScheme";

// Field configuration for auto-generation
const fields = [
  { name: "name", label: "Име на фирмата", placeholder: "Въведете име", type: "text", required: true },
  { name: "bulstat", label: "ЕИК/Булстат", placeholder: "Въведете булстат", type: "text" },
  { name: "country", label: "Държава", placeholder: "Въведете държава", type: "text" },
  { name: "city", label: "Град", placeholder: "Въведете град", type: "text" },
  { name: "address", label: "Адрес", placeholder: "Въведете адрес", type: "text" },
  { name: "mol", label: "МОЛ", placeholder: "Въведете МОЛ", type: "text" },
  { name: "percentageDiscount", label: "Процентна отстъпка", placeholder: "0", type: "number", step: "0.01", min: "0", max: "100" },
  { name: "contactPerson", label: "Лице за контакт", placeholder: "Въведете лице за контакт", type: "text" },
  { name: "phone", label: "Телефон", placeholder: "Въведете телефон", type: "text" },
];

export default function CreatePartnerPage({ fetchPartners }) {
  return (
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
  );
}