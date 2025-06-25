import Link from "next/link";

export default function DashboardHome() {
    return (
        <div className="grid md:grid-cols-4 grid-cols-1">
            <div className="border rounded-sm p-4">
                Брой стендери в цяла България
            </div>
            <div className="border rounded-sm p-4">
                Брой клиенти
            </div>
        </div>
    )
}