import { useState } from 'react';
import { useBarcodeScanner } from './useBarcodeScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { X, Camera, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface BarcodeScannerModalProps {
    onDetected: (barcode: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const BarcodeScannerModal = ({ onDetected, open, onOpenChange }: BarcodeScannerModalProps) => {
    const [manualBarcode, setManualBarcode] = useState('');

    const { videoRef, hasCameraPermission, isSupported } = useBarcodeScanner({
        onDetected: (code) => {
            onDetected(code);
            onOpenChange(false); // Close on success
        },
        isScanning: open,
    });

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualBarcode.trim()) {
            onDetected(manualBarcode.trim());
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black text-white border-zinc-800">
                <div className="relative h-[24rem] flex flex-col items-center justify-center bg-zinc-900">

                    {/* Close button overlay */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-50 text-white hover:bg-white/20"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-6 w-6" />
                    </Button>

                    {!isSupported ? (
                        <div className="flex flex-col items-center p-6 text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-yellow-500" />
                            <h3 className="text-xl font-bold">Scanner Not Supported</h3>
                            <p className="text-zinc-400">Your browser doesn't support the BarcodeDetector API. Please enter the code manually.</p>
                        </div>
                    ) : hasCameraPermission === false ? (
                        <div className="flex flex-col items-center p-6 text-center space-y-4">
                            <Camera className="h-12 w-12 text-red-500" />
                            <h3 className="text-xl font-bold">Camera Access Denied</h3>
                            <p className="text-zinc-400">Please allow camera access to scan barcodes, or enter the code manually.</p>
                        </div>
                    ) : (
                        <>
                            {/* Camera Preview */}
                            <video
                                ref={videoRef}
                                className="absolute inset-0 w-full h-full object-cover"
                                playsInline
                                muted
                            />

                            {/* Scanning Overlay */}
                            <div className="absolute inset-0 border-[3rem] border-black/50 z-10 pointer-events-none">
                                <div className="relative w-full h-full border-2 border-primary/70 animate-pulse bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                                    {/* Corner markers could go here */}
                                </div>
                            </div>

                            <div className="absolute bottom-8 z-20 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                                <p className="text-sm font-medium">Point camera at a barcode</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Manual Entry Fallback Section */}
                <div className="bg-background p-4 text-foreground">
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Enter barcode manually"
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" variant="secondary">
                            Lookup
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};
