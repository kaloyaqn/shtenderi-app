
import Link from "next/link";
import { getAllStands } from '@/lib/stands/stand';
import { getAllPartners } from '@/lib/partners/partner';
import { getAllProducts } from '@/lib/products/product';
import { getAllStores } from '@/lib/stores/store';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DashboardStatsChart from '@/components/dashboard-stats-chart';
import { getSession } from "next-auth/react";

export default async function DashboardHome() {
    const stands = await getAllStands();
    const partners = await getAllPartners();
    const products = await getAllProducts();
    const stores = await getAllStores();



    // Dummy data for revisions (replace with real fetch if needed)
    const revisions = [];
    // Chart data
    const chartData = [
        { name: 'Щандове', value: stands.length },
        { name: 'Продукти', value: products.length },
        { name: 'Клиенти', value: partners.length },
        { name: 'Магазини', value: stores.length },
    ];
    return (
        <div className="">
            <h1 className="text-2xl font-bold mb-8 text-left">Добре дошли в административното табло</h1>
            <div className="grid md:grid-cols-4 grid-cols-2 gap-6 mb-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-blue-700 text-3xl">{stands.length}</CardTitle>
                        <CardDescription>Щандове</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-700 text-3xl">{partners.length}</CardTitle>
                        <CardDescription>Клиенти (партньори)</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-purple-700 text-3xl">{products.length}</CardTitle>
                        <CardDescription>Продукти</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-yellow-700 text-3xl">{stores.length}</CardTitle>
                        <CardDescription>Магазини</CardDescription>
                    </CardHeader>
                </Card>
            </div>
            <div className="bg-white rounded-xl border shadow p-6 mb-10">
                <h2 className="text-xl font-semibold mb-4">Обобщение</h2>
                {/* <DashboardStatsChart data={chartData} /> */}
            </div>
            <div className="flex w-full flex-wrap gap-4 justify-center">
                <Link href="/dashboard/stands" className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 w-full transition">Виж всички щандове</Link>
                <Link href="/dashboard/stands/create" className="px-6 py-3 rounded-lg bg-blue-50 text-blue-800 font-semibold shadow w-full hover:bg-blue-100 transition">+ Добави нов щанд</Link>
                <Link href="/dashboard/products/create" className="px-6 py-3 rounded-lg bg-green-50 text-green-800 font-semibold shadow w-full hover:bg-green-100 transition">+ Добави нов продукт</Link>
                <Link href="/dashboard/revisions" className="px-6 py-3 rounded-lg bg-yellow-50 text-yellow-800 font-semibold shadow w-full hover:bg-yellow-100 transition">Виж всички ревизии</Link>
            </div>
        </div>  
    )
}