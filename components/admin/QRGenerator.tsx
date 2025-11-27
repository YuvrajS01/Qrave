import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';
import { Button } from '../ui/Button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface QRGeneratorProps {
    slug: string;
}

interface GeneratedCode {
    table: string;
    url: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ slug }) => {
    const [tableInput, setTableInput] = useState('');
    const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
    const printRef = useRef<HTMLDivElement>(null);

    const handleGenerate = () => {
        const codes: GeneratedCode[] = [];
        const parts = tableInput.split(',').map(p => p.trim());

        parts.forEach(part => {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(num => parseInt(num));
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    for (let i = start; i <= end; i++) {
                        codes.push({
                            table: i.toString(),
                            url: `${window.location.origin}/r/${slug}?table=${i}`
                        });
                    }
                }
            } else {
                if (part) {
                    codes.push({
                        table: part,
                        url: `${window.location.origin}/r/${slug}?table=${part}`
                    });
                }
            }
        });

        setGeneratedCodes(codes);
    };

    const handleSaveAll = async () => {
        if (!printRef.current) return;

        const zip = new JSZip();
        const canvases = printRef.current.querySelectorAll('canvas');

        const promises = Array.from(canvases).map((canvas, index) => {
            return new Promise<void>((resolve) => {
                (canvas as HTMLCanvasElement).toBlob((blob) => {
                    if (blob) {
                        const code = generatedCodes[index];
                        zip.file(`table-${code.table}.png`, blob);
                    }
                    resolve();
                });
            });
        });

        await Promise.all(promises);

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${slug}-qr-codes.zip`);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm print:hidden">
                <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                    <QrCode size={20} />
                    Generate QR Codes
                </h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                            Table Numbers
                        </label>
                        <input
                            type="text"
                            value={tableInput}
                            onChange={(e) => setTableInput(e.target.value)}
                            placeholder="e.g. 1, 2, 5-10"
                            className="w-full p-3 bg-stone-50 rounded-lg border-none focus:ring-2 focus:ring-qrave-accent"
                        />
                        <p className="text-xs text-stone-400 mt-2">
                            Enter single numbers separated by commas, or ranges with a hyphen.
                        </p>
                    </div>
                    <Button onClick={handleGenerate}>Generate</Button>
                </div>
            </div>

            {generatedCodes.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center print:hidden">
                        <h3 className="font-serif text-lg font-bold">Preview</h3>
                        <Button variant="secondary" onClick={handleSaveAll} className="flex items-center gap-2">
                            <Download size={16} />
                            Save All as PNG
                        </Button>
                    </div>

                    <div ref={printRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-8">
                        {generatedCodes.map((code, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl border border-stone-200 flex flex-col items-center text-center print:border-2 print:border-black print:shadow-none">
                                <h4 className="font-serif font-bold text-xl mb-4">Table {code.table}</h4>
                                <div className="bg-white p-2 rounded-lg">
                                    <QRCodeCanvas
                                        value={code.url}
                                        size={150}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </div>
                                <p className="text-xs text-stone-400 mt-4 font-mono break-all print:text-black">
                                    {slug}
                                </p>
                                <p className="text-[10px] text-stone-300 mt-1 print:hidden">
                                    Scan to view menu
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #root {
                        display: none;
                    }
                    /* We need to target the specific container for printing. 
                       Since React portals or complex layouts can make this tricky, 
                       a common strategy is to hide everything and show only the print section.
                       However, relying on a specific class or ID is better.
                    */
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:grid-cols-3 {
                        display: grid !important;
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                        visibility: visible !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                    .print\\:grid-cols-3 * {
                        visibility: visible !important;
                    }
                }
            `}</style>
        </div>
    );
};
