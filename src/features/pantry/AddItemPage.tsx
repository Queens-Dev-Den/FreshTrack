import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, PenLine, ArrowLeft, Loader2 } from 'lucide-react';
import { BarcodeScannerModal } from '@/features/scan/BarcodeScannerModal';
import { lookupProduct } from '@/services/productApi';
import { toast } from 'sonner';

const AddItemPage = () => {
    const navigate = useNavigate();
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isLookingUp, setIsLookingUp] = useState(false);

    const handleBarcodeDetected = async (barcode: string) => {
        setIsLookingUp(true);
        try {
            const product = await lookupProduct(barcode);
            navigate('/add/confirm', {
                state: {
                    barcode,
                    product
                }
            });
        } catch (error) {
            console.error('Lookup failed', error);
            // Navigate even if lookup fails, user will fill in details
            navigate('/add/confirm', { state: { barcode } });
        } finally {
            setIsLookingUp(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b px-4 py-3 sticky top-0 bg-background/95 backdrop-blur z-10 flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="font-semibold text-lg">Add Item</h1>
            </header>

            <main className="flex-1 p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full gap-6">

                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">Add Groceries</h2>
                    <p className="text-muted-foreground">Choose how you want to add items to your inventory.</p>
                </div>

                {isLookingUp ? (
                    <div className="flex flex-col items-center gap-4 py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Looking up product...</p>
                    </div>
                ) : (
                    <div className="grid w-full gap-4">
                        <Button
                            size="lg"
                            className="h-24 text-lg flex flex-col gap-2 shadow-sm"
                            onClick={() => setIsScannerOpen(true)}
                        >
                            <Scan className="h-8 w-8" />
                            Scan Barcode
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-20 text-lg flex flex-col gap-2 border-dashed"
                            onClick={() => navigate('/add/confirm', { state: { barcode: 'MANUAL-' + Date.now() } })} // Mock manual entry flow or redirect to manual form
                        >
                            <PenLine className="h-6 w-6" />
                            Type Manually
                        </Button>
                    </div>
                )}

                <BarcodeScannerModal
                    open={isScannerOpen}
                    onOpenChange={setIsScannerOpen}
                    onDetected={handleBarcodeDetected}
                />
            </main>
        </div>
    );
};

export default AddItemPage;
