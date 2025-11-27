import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats, Html5Qrcode } from 'html5-qrcode';
import { X, Upload } from 'lucide-react';
import { Button } from './ui/Button';

interface QRScannerProps {
    onScanSuccess: (decodedText: string, decodedResult: any) => void;
    onScanFailure?: (error: any) => void;
    onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanFailure, onClose }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            },
            /* verbose= */ false
        );

        scannerRef.current = scanner;

        scanner.render(
            (decodedText, decodedResult) => {
                // Stop scanning after success to prevent multiple triggers
                scanner.clear().then(() => {
                    onScanSuccess(decodedText, decodedResult);
                }).catch((err) => {
                    console.error("Failed to clear scanner", err);
                    onScanSuccess(decodedText, decodedResult);
                });
            },
            (errorMessage) => {
                // parse error, ignore it.
                if (onScanFailure) {
                    onScanFailure(errorMessage);
                }
            }
        );

        // Cleanup function
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner during cleanup", error);
                });
            }
        };
    }, [onScanSuccess, onScanFailure]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const html5QrCode = new Html5Qrcode("qr-file-reader");
            const decodedText = await html5QrCode.scanFile(file, true);
            onScanSuccess(decodedText, { result: { text: decodedText } });
            html5QrCode.clear();
        } catch (err) {
            console.error("Error scanning file", err);
            setScanError("Could not scan QR code from image.");
            if (onScanFailure) {
                onScanFailure(err);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between p-4 border-b border-stone-100">
                    <h3 className="font-serif text-xl text-qrave-dark">Scan QR Code</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-dashed border-stone-200"></div>
                    <div id="qr-file-reader" className="hidden"></div>

                    <div className="mt-6 flex flex-col items-center gap-3">
                        <p className="text-center text-sm text-stone-500">
                            Point your camera at a Qrave QR code
                        </p>
                        <div className="flex items-center gap-2 w-full">
                            <div className="h-px bg-stone-200 flex-1"></div>
                            <span className="text-xs text-stone-400 font-medium uppercase">Or</span>
                            <div className="h-px bg-stone-200 flex-1"></div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <Button variant="outline" onClick={handleUploadClick} className="w-full flex items-center justify-center gap-2">
                            <Upload size={18} />
                            Upload QR Image
                        </Button>
                        {scanError && (
                            <p className="text-xs text-red-500 font-medium">{scanError}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
