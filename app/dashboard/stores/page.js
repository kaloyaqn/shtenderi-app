'use client'

import { useEffect, useState } from "react"

export default function Stores() {
    const [stores, setStores] = useState([]);

    useEffect(() => {
        fetch("/api/store")
            .then(res => res.json())
            .then(data => setStores(data))
    }, []);
    return (
        <>
            Магазини    
            {stores.map((store) => (
                <>
                    {store.name}
                </>
            ))}
        </>
    )
}