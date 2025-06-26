
"use client";

import type { Product, ProcessStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Layers, CalendarDays, ShieldCheck, ShieldOff, CheckCircle2, XCircle, QrCode, Package } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface InspectionStationProps {
  product: Product | null;
  onApproveAndGenerate: () => void;
  onReject: () => void;
  processStatus: ProcessStatus;
}

export default function InspectionStation({
  product,
  onApproveAndGenerate,
  onReject,
  processStatus,
}: InspectionStationProps) {
  
  const renderStatusIcon = () => {
    if (processStatus === 'completed_accepted') return <CheckCircle2 className="h-5 w-5 text-accent" />; 
    if (processStatus === 'completed_rejected') return <XCircle className="h-5 w-5 text-destructive" />;
    return <Cpu className="h-5 w-5 text-primary" />;
  };

  const getStatusBadge = () => {
    let text = "Unknown";
    let variant: "default" | "destructive" | "secondary" | "outline" = "default";
    let className = "";

    switch (processStatus) {
      case 'idle': 
        text = product ? "Ready for Processing" : "No Product";
        variant = "outline";
        break;
      case 'inspecting': 
        text = "Ready for Inspection";
        variant = "secondary";
        break;
      case 'completed_accepted': 
        text = "Product Accepted";
        className = "bg-accent/20 text-accent border-accent/50 hover:bg-accent/30"; 
        break;
      case 'completed_rejected': 
        text = "Product Rejected";
        variant = "destructive"; 
        break;
      default: 
        text = "Status Unknown";
        variant = "outline";
        break;
    }
    return <Badge variant={variant} className={cn(className, "text-xs")}>{text}</Badge>;
  }

  const barcodeSrc = product?.serialNumber 
    ? `https://placehold.co/280x70.png?text=${encodeURIComponent(`|||${product.serialNumber.replace(/-/g,'')}|||`)}&font=spacegrotesk`
    : "https://placehold.co/280x70.png?text=|||BARCODE|||&font=spacegrotesk";

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-secondary/50">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg font-headline">
            {renderStatusIcon()}
            <span className="ml-2">Inspection & Validation</span>
            </CardTitle>
            {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {product ? (
          <>
            <div className="animate-fadeIn">
              <h3 className="text-md font-semibold mb-2 text-primary font-headline">Product Details:</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center"><Cpu className="mr-2 h-4 w-4 text-muted-foreground" />Device ID: <span className="font-medium ml-1">{product.deviceId}</span></li>
                <li className="flex items-center"><Layers className="mr-2 h-4 w-4 text-muted-foreground" />Batch ID: <span className="font-medium ml-1">{product.batchId}</span></li>
                <li className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />Mfg. Date: <span className="font-medium ml-1">{product.manufacturingDate}</span></li>
                <li className="flex items-center">
                  {product.rohsCompliant 
                    ? <ShieldCheck className="mr-2 h-4 w-4 text-accent" /> 
                    : <ShieldOff className="mr-2 h-4 w-4 text-destructive" />
                  }
                  RoHS Compliant: 
                  <span className={`font-medium ml-1 ${product.rohsCompliant ? 'text-accent' : 'text-destructive'}`}>
                    {product.rohsCompliant ? 'Yes' : 'No'}
                  </span>
                </li>
                 <li className="flex items-center"><QrCode className="mr-2 h-4 w-4 text-muted-foreground" />Serial No: <span className="font-medium ml-1">{product.serialNumber}</span></li>
              </ul>
            </div>

            {product.labelImageUrl && (
              <div className="border p-1 rounded-md bg-slate-100 dark:bg-slate-700/50 shadow-lg animate-fadeIn">
                 <h3 className="text-sm font-semibold mb-2 text-primary/80 dark:text-primary/90 px-2 pt-1 font-headline">Generated Label Preview:</h3>
                <div className="bg-white p-2 rounded-sm shadow-inner overflow-hidden space-y-2">
                  <Image 
                    src={product.labelImageUrl} 
                    alt="Simulated Product Label - Text" 
                    width={300} 
                    height={150} 
                    className="rounded-xs mx-auto"
                    data-ai-hint="product label" 
                  />
                  <Image
                    src={barcodeSrc}
                    alt={`Simulated Barcode for SN: ${product.serialNumber}`}
                    width={280}
                    height={70}
                    className="rounded-xs mx-auto"
                    data-ai-hint="barcode product"
                  />
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={onReject}
                variant="destructive"
                disabled={processStatus !== 'inspecting' || !product}
                className="w-full"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Reject Product
              </Button>
              <Button 
                onClick={onApproveAndGenerate} 
                disabled={processStatus !== 'inspecting' || !product}
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Approve & Generate Label
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-10 animate-fadeIn">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No product at inspection station.</p>
            <p className="text-sm text-muted-foreground">Load a product using the conveyor controls.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
