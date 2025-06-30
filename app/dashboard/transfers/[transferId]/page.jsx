'use client';

import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PrintableTransfer } from '../_components/printable-transfer';

export default function TransferDetailPage() {
    const { transferId } = useParams();
    const router = useRouter();
    const printRef = useRef(null);

    const [transfer, setTransfer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!transferId) return;

        const fetchTransfer = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/transfers?id=${transferId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch transfer data.');
                }
                const data = await response.json();
                setTransfer(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransfer();
    }, [transferId]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Преместване-${transfer?.id.substring(0, 8)}`,
    });

    if (loading) return <div>Зареждане...</div>;
    if (!transfer) return <div>Трансферът не е намерен.</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Преместване № {transfer.id.substring(0, 8).toUpperCase()}
                </h1>
                <div className="flex items-center gap-4">
                    <Button onClick={handlePrint}>Принтирай</Button>
                    <Button variant="ghost" onClick={() => router.push('/dashboard/transfers')}>
                        Назад
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg shadow-sm">
                <PrintableTransfer ref={printRef} transfer={transfer} />
            </div>
        </div>
    );
} 