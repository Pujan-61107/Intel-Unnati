
"use client";

import type { Product, ValidationResult, ProcessStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Layers, CalendarDays, ShieldCheck, ShieldOff, CheckCircle2, XCircle, Loader2, QrCode, Wand2, Package, Check, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface InspectionStationProps {
  product: Product | null;
  onGenerateLabel: () => void;
  onValidateAI: () => Promise<void>;
  aiValidationResult: ValidationResult | null;
  processStatus: ProcessStatus;
  isLoadingAi: boolean;
}

export default function InspectionStation({
  product,
  onGenerateLabel,
  onValidateAI,
  aiValidationResult,
  processStatus,
  isLoadingAi,
}: InspectionStationProps) {
  
  const renderStatusIcon = () => {
    if (processStatus === 'ai_validating') return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    if (processStatus === 'validation_complete_accepted') return <CheckCircle2 className="h-5 w-5 text-accent" />; // Using accent (green)
    if (processStatus === 'validation_complete_rejected') return <XCircle className="h-5 w-5 text-destructive" />;
    if (processStatus === 'label_generated') return <QrCode className="h-5 w-5 text-primary" />
    return <Cpu className="h-5 w-5 text-primary" />;
  };

  const getStatusBadge = () => {
    let text = "Unknown";
    let variant: "default" | "destructive" | "secondary" = "default";
    let className = "";

    switch (processStatus) {
      case 'idle': 
        text = product ? "Ready for Processing" : "No Product";
        break;
      case 'inspecting': 
        text = "Inspecting Product...";
        break;
      case 'label_generated': 
        text = "Label Generated";
        variant = "secondary";
        break;
      case 'ai_validating': 
        text = "AI Validating Label...";
        break;
      case 'validation_complete_accepted': 
        text = "Product Accepted";
        className = "bg-accent text-accent-foreground hover:bg-accent/90"; // Green
        break;
      case 'validation_complete_rejected': 
        text = "Product Rejected";
        variant = "destructive"; // Red
        break;
      default: 
        text = "Status Unknown";
        break;
    }
    return <Badge variant={variant} className={cn(className, "text-xs")}>{text}</Badge>;
  }

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
        {/* Removed CardDescription as status is now a badge in the title line */}
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
                    ? <ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> 
                    : <ShieldOff className="mr-2 h-4 w-4 text-red-500" /> // text-destructive
                  }
                  RoHS Compliant: 
                  <span className={`font-medium ml-1 ${product.rohsCompliant ? 'text-green-500' : 'text-red-500'}`}>
                    {product.rohsCompliant ? 'Yes' : 'No'}
                  </span>
                </li>
                 <li className="flex items-center"><QrCode className="mr-2 h-4 w-4 text-muted-foreground" />Serial No: <span className="font-medium ml-1">{product.serialNumber}</span></li>
              </ul>
            </div>

            {product.labelImageUrl && (
              <div className="border p-1 rounded-md bg-slate-100 dark:bg-slate-800 shadow-lg animate-fadeIn">
                 <h3 className="text-sm font-semibold mb-2 text-primary/80 dark:text-primary/90 px-2 pt-1 font-headline">Generated Label Preview:</h3>
                <div className="bg-white p-2 rounded-sm shadow-inner overflow-hidden">
                  <Image 
                    src={product.labelImageUrl} 
                    alt="Simulated Product Label" 
                    width={300} 
                    height={150} 
                    className="rounded-xs mx-auto"
                    data-ai-hint="product label" 
                  />
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={onGenerateLabel} 
                disabled={processStatus !== 'inspecting' && processStatus !== 'idle' || !product || isLoadingAi || (product && processStatus === 'validation_complete_rejected')}
                className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
              >
                <QrCode className="mr-2 h-5 w-5" />
                Generate & Print Label
              </Button>
              <Button 
                onClick={onValidateAI} 
                disabled={processStatus !== 'label_generated' || isLoadingAi || !product.labelImageUrl}
                className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                {isLoadingAi ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                Validate Label with AI
              </Button>
            </div>

            {aiValidationResult && (processStatus === 'validation_complete_accepted' || processStatus === 'validation_complete_rejected') && (
              <div className={`p-4 rounded-md border animate-fadeIn ${aiValidationResult.isValid ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                <h4 className="font-semibold flex items-center mb-1">
                  {aiValidationResult.isValid 
                    ? <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> 
                    : <XCircle className="mr-2 h-5 w-5 text-red-500" />
                  }
                  AI Validation: 
                  <span className={aiValidationResult.isValid ? 'text-green-500' : 'text-red-500'}>
                    {aiValidationResult.isValid ? 'Passed' : 'Failed'}
                  </span>
                </h4>
                <p className="text-sm text-muted-foreground">{aiValidationResult.validationMessage}</p>
              </div>
            )}
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

    