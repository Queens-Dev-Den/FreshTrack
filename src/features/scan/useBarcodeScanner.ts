import { useState, useEffect, useRef, useCallback } from 'react';
import { BarcodeDetector as BarcodeDetectorPolyfill } from 'barcode-detector';

// Declare BarcodeDetector type globally if not present in your TS config
declare global {
    interface Window {
        BarcodeDetector: any;
    }
}

interface UseBarcodeScannerProps {
    onDetected: (barcode: string) => void;
    isScanning: boolean;
}

export const useBarcodeScanner = ({ onDetected, isScanning }: UseBarcodeScannerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isSupported, setIsSupported] = useState<boolean>(true);
    const [isLocked, setIsLocked] = useState(false);
    const requestRef = useRef<number>();
    const detectorRef = useRef<any>(null);

    // Check support on mount
    useEffect(() => {
        const initDetector = async () => {
            if (!('BarcodeDetector' in window)) {
                try {
                    // @ts-ignore
                    window.BarcodeDetector = BarcodeDetectorPolyfill;
                } catch (e) {
                    // Polyfill failed or not needed
                }
            }

            if ('BarcodeDetector' in window) {
                try {
                    detectorRef.current = new window.BarcodeDetector({
                        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
                    });
                    setIsSupported(true);
                } catch (e) {
                    console.error('BarcodeDetector init failed', e);
                    setIsSupported(false);
                }
            } else {
                setIsSupported(false);
            }
        };

        initDetector();
    }, []);

    const stopScanning = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
    }, []);

    const detect = useCallback(async () => {
        if (!videoRef.current || !detectorRef.current || isLocked) return;

        try {
            const barcodes = await detectorRef.current.detect(videoRef.current);
            if (barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;

                // Simple debounce/lock
                setIsLocked(true);

                // Vibrate if supported
                if (navigator.vibrate) navigator.vibrate(200);

                onDetected(rawValue);

                // Unlock after delay (to prevent rapid duplicates if user stays on screen)
                setTimeout(() => setIsLocked(false), 2000);
            }
        } catch (err) {
            console.error('Detection error:', err);
        }

        if (isScanning && !isLocked) { // Continue loop if still scanning
            requestRef.current = requestAnimationFrame(detect);
        }
    }, [isScanning, isLocked, onDetected]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Wait for video to be ready
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        detect(); // Start detection loop
                    };
                }
                setHasCameraPermission(true);
            } catch (err) {
                console.error('Camera permission denied or error:', err);
                setHasCameraPermission(false);
            }
        };

        if (isScanning && isSupported) {
            startCamera();
        } else {
            stopScanning();
        }

        return () => stopScanning();
    }, [isScanning, isSupported, detect, stopScanning]);

    // Restart detection loop if lock is released while scanning
    useEffect(() => {
        if (!isLocked && isScanning && videoRef.current?.srcObject) {
            detect();
        }
    }, [isLocked, isScanning, detect]);

    return {
        videoRef,
        hasCameraPermission,
        isSupported,
    };
};
