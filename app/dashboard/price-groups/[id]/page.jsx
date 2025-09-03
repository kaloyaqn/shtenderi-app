'use client'

import BaseForm from "@/components/forms/BaseForm"
import { useParams } from "next/navigation";
import useSWR from "swr"


const fields = [
    {
        name:"price_group_id", label:"Име на група", placeholder:"Въведи име на групата", type:"text", required: true
    },
    {
        name:"product_id"
    },
    {
        name:"price"
    }
]

export default function PriceGroupView() {
    const params = useParams()

    const fetcher = (...args) => fetch(...args).then(res => res.json());
    const { data, error, isLoading, mutate: refetch } = useSWR(`/api/price-groups/${params.id}/products`, fetcher);

    console.log('data', data)

    if (error) return <>error batio</>
    if (isLoading) return <>zarejda batio</>



    return (
        <>

            <BaseForm
            fields={fields}
            endpoint={'/api/price-groups/products'}
            submitText="добави продукт"
            successMessage={"Успешно добавихте продукт"}
            errorMessage={"Грешка при създаване"}
            />

            {data.map((product) => (
                <div>
                    {product.product.id} <br />
                    {product.product.name} <br />
                   нормална цена: {product.product.clientPrice} лв. <br />
                   групова цена: {product.price} лв.
                </div>
            ))}
            
        </>
    )
}