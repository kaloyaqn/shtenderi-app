import BaseForm from "@/components/forms/BaseForm"
import { priceGroupSchema } from "@/lib/validations/priceGroupScheme"


const fields = [
    {
        name:"name", label:"Име на група", placeholder:"Въведи име на групата", type:"text", required: true
    }
]
export default function CreateProductGroupForm({onSuccess}) {
    return (
        <>
            <BaseForm 
                fields={fields}
                endpoint="/api/price-groups"
                submitText="Създай"
                onSuccess={onSuccess}
                successMessage={"Успешно създадохте ценова група"}
                errorMessage={"Грешка при създаване"}
            />
        </>
    )
}