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
import { useCommand } from '@/components/command-provider';

export default function TransferDetailPage() {
    const { transferId } = useParams();
    const router = useRouter();
    const printRef = useRef(null);

    const [transfer, setTransfer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editLines, setEditLines] = useState([]);
    const { openProductPicker } = useCommand();
    const [sourceStockByProduct, setSourceStockByProduct] = useState({});

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
            setEditLines((data?.products || []).map(p => ({ productId: p.productId, name: p.product?.name || '', quantity: p.quantity })));
            // Load available stock from source storage to validate edits
            if (data?.sourceStorageId) {
                try {
                    const stock = await fetch(`/api/storages/${data.sourceStorageId}/products`).then(r => r.json()).catch(() => []);
                    const map = {}; (stock||[]).forEach(sp => { map[String(sp.productId)] = sp.quantity || 0; });
                    setSourceStockByProduct(map);
                } catch {}
            }
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
            // Use server-enriched destinationType to determine endpoint
            const isStandTransfer = transfer.destinationType === 'STAND';
            
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

    const saveEdits = async () => {
        try {
            if (!Array.isArray(editLines) || editLines.length === 0) {
                toast.error('Добавете поне един продукт');
                return;
            }
            const payload = {
                products: editLines
                    .filter(l => l.productId && Number(l.quantity) > 0)
                    .map(l => ({ productId: l.productId, quantity: Number(l.quantity) }))
            };
            if (payload.products.length === 0) {
                toast.error('Невалидни редове');
                return;
            }
            const r = await fetch(`/api/transfers/${transferId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const j = await r.json();
            if (!r.ok) throw new Error(j?.error || 'Грешка при запис');
            toast.success('Трансферът е обновен');
            setEditing(false);
            await fetchTransfer();
        } catch (e) {
            toast.error(e.message);
        }
    };

    const deleteTransfer = async () => {
        if (!confirm('Сигурни ли сте, че искате да изтриете този трансфер?')) return;
        try {
            const r = await fetch(`/api/transfers/${transferId}`, { method: 'DELETE' });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j?.error || 'Грешка при изтриване');
            toast.success('Трансферът е изтрит');
            router.push('/dashboard/transfers');
        } catch (e) {
            toast.error(e.message);
        }
    };

    if (loading) return <div>Зареждане...</div>;
    if (!transfer) return <div>Трансферът не е намерен.</div>;

    return (
        <div className="container mx-auto">

            <BasicHeader hasBackButton
            title={`Трансфер № ${transfer.id.substring(0, 8).toUpperCase()}  `}
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
                        <Button variant="outline" onClick={() => setEditing(v => !v)}>
                            {editing ? 'Откажи редакция' : 'Редактирай продукти'}
                        </Button>
                        <Button variant="destructive" onClick={deleteTransfer}>Изтрий трансфер</Button>
                    </CardContent>
                </Card>
            )}

            {editing && transfer.status === 'PENDING' ? (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Редакция на продукти</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-3">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    openProductPicker({
                                        onSelect: (p) =>
                                            setEditLines(prev => [{ productId: p.id, name: p.name || '', quantity: 1 }, ...prev])
                                    })
                                }
                            >Добави продукт</Button>
                            <Button onClick={saveEdits}>Запази промените</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-gray-500">
                                        <th className="px-2 border-b">Продукт</th>
                                        <th className="px-2 border-b">Количество</th>
                                        <th className="px-2 border-b">Налично в източника</th>
                                        <th className="px-2 border-b"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editLines.map((ln, i) => (
                                        <tr key={i} className="text-sm">
                                            <td className="px-2 border-t">{ln.name || ln.productId}</td>
                                            <td className="px-2 border-t">
                                                <Input
                                                    variant="table"
                                                    inputMode="numeric"
                                                    value={String(ln.quantity ?? '')}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        const want = v === '' ? '' : Number(v);
                                                        if (want === '') { setEditLines(prev => prev.map((row, idx) => idx === i ? { ...row, quantity: '' } : row)); return; }
                                                        const pid = String(ln.productId || '');
                                                        const available = sourceStockByProduct[pid] ?? 0;
                                                        const capped = Math.max(0, Math.min(available, Number.isFinite(want) ? want : 0));
                                                        if (Number(want) > available) {
                                                            toast.error(`Наличност ${available}. Не може да зададете ${want}.`);
                                                        }
                                                        setEditLines(prev => prev.map((row, idx) => idx === i ? { ...row, quantity: capped } : row));
                                                    }}
                                                />
                                            </td>
                                            <td className="px-2 border-t">{(() => {
                                                const pid = String(ln.productId || '');
                                                return sourceStockByProduct[pid] ?? 0;
                                            })()}</td>
                                            <td className="px-2 border-t text-right">
                                                <button
                                                    type="button"
                                                    className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => setEditLines(prev => prev.filter((_, idx) => idx !== i))}
                                                >✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
            <div className="border rounded-lg shadow-sm">
                <PrintableTransfer ref={printRef} transfer={transfer} />
            </div>
            )}
        </div>
    );
} 