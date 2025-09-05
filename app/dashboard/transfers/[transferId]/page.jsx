'use client';

import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PrintableTransfer } from '../_components/printable-transfer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BasicHeader from '@/components/BasicHeader';
import { PrinterIcon } from 'lucide-react';

export default function TransferDetailPage() {
    const { transferId } = useParams();
    const router = useRouter();
    const printRef = useRef(null);

    const [transfer, setTransfer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);

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

    useEffect(() => {
        if (transferId) {
            fetchTransfer();
        }
    }, [transferId]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Преместване-${transfer?.id.substring(0, 8)}`,
    });

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            // Determine if this is a storage-to-stand transfer
            const isStandTransfer = transfer.destinationStorageId && 
                !transfer.destinationStorageId.includes('storage') && 
                transfer.destinationStorageId.length > 10; // Stand IDs are typically longer
            
            const endpoint = isStandTransfer 
                ? `/api/transfers/${transferId}/confirm-stand`
                : `/api/transfers/${transferId}/confirm`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to confirm transfer.');
            }
            
            if (isStandTransfer) {
                toast.success('Трансферът е потвърден и ревизията е създадена успешно!');
                // Redirect to the created revision
                if (data.revisionId) {
                    router.push(`/dashboard/revisions/${data.revisionId}`);
                    return;
                }
            } else {
                toast.success('Трансферът е потвърден успешно!');
            }
            
            await fetchTransfer(); // Re-fetch data to update UI

        } catch (error) {
            toast.error(error.message);
        } finally {
            setConfirming(false);
        }
    };

    if (loading) return <div>Зареждане...</div>;
    if (!transfer) return <div>Трансферът не е намерен.</div>;

    return (
        <div className="container mx-auto">

            <BasicHeader hasBackButton
            title={`Преместване № ${transfer.id.substring(0, 8).toUpperCase()}  `}
            >
            <Button onClick={handlePrint}>
                <PrinterIcon />
                Принтирай</Button>

            </BasicHeader>

            {/* <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Преместване № {transfer.id.substring(0, 8).toUpperCase()}
                </h1>
                <div className="flex items-center gap-4">
                    <Button onClick={handlePrint}>Принтирай</Button>
                    <Button variant="ghost" onClick={() => router.push('/dashboard/transfers')}>
                        Назад
                    </Button>
                </div>
            </div> */}

            {transfer.status === 'PENDING' && (
                <Card className="mb-6 bg-yellow-50 border-yellow-200">
                    <CardHeader>
                        <CardTitle>Потвърждение на трансфер</CardTitle>
                        <CardDescription>
                            {transfer.destinationType === 'STAND' 
                                ? 'Потвърди преместването към щанда. Това ще създаде продажба и ще актуализира наличностите.'
                                : 'Потвърди получаването на стоките. Това ще актуализира наличностите в двата склада.'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-end gap-4">
                        <Button onClick={handleConfirm} disabled={confirming}>
                            {confirming ? 'Потвърждаване...' : 'Потвърди'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="border rounded-lg shadow-sm">
                <PrintableTransfer ref={printRef} transfer={transfer} />
            </div>
        </div>
    );
} 