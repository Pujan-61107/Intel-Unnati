
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product, LogEntry, ValidationResult, ProcessStatus } from '@/lib/types';
import { validateLabelQuality, type ValidateLabelQualityInput } from '@/ai/flows/validate-label-quality';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import Header from '@/components/layout/Header';
import ConveyorBelt from '@/components/simulation/ConveyorBelt';
import InspectionStation from '@/components/simulation/InspectionStation';
import LogDisplay from '@/components/simulation/LogDisplay';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';

const initialProducts: Product[] = [
  { id: 'p1', deviceId: 'DEV001', batchId: 'BATCH-A1', manufacturingDate: '2024-07-15', rohsCompliant: true, serialNumber: 'SN-TRSMT-001' },
  { id: 'p2', deviceId: 'DEV002', batchId: 'BATCH-A2', manufacturingDate: '2024-07-16', rohsCompliant: false, serialNumber: 'SN-TRSMT-002' },
  { id: 'p3', deviceId: 'DEV003', batchId: 'BATCH-B1', manufacturingDate: '2024-07-17', rohsCompliant: true, serialNumber: 'SN-TRSMT-003' },
  { id: 'p4', deviceId: 'DEV004', batchId: 'BATCH-B2', manufacturingDate: '2024-07-18', rohsCompliant: true, serialNumber: 'SN-TRSMT-004', labelImageUrl: 'https://placehold.co/300x150.png/.webp?text=DeviceID:DEV004%5CnBatchID:BATCH-B2%5CnMfgDate:2024-07-18%5CnRoHS:Yes%5CnSN:SN-TRSMT-004-INVALID' }, // Example of a potentially problematic label for AI to catch
  { id: 'p5', deviceId: 'DEV005', batchId: 'BATCH-C1', manufacturingDate: '2024-07-19', rohsCompliant: true, serialNumber: 'SN-TRSMT-005' },
];


export default function TraceSmartPage() {
  const [productQueue, setProductQueue] = useState<Product[]>(initialProducts);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiValidationResult, setAiValidationResult] = useState<ValidationResult | null>(null);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('idle');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();
  const { isLoggedIn, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoadingAuth, router]);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    setLogs(prevLogs => [{ id: uuidv4(), timestamp: new Date().toLocaleTimeString(), message, type }, ...prevLogs]);
  }, []);

  const handleNextProduct = useCallback(() => {
    if (processStatus === 'ai_validating') {
      addLog("Cannot load next product: AI Validation in progress.", 'error');
      toast({ title: "Processing Error", description: "Wait for AI validation to complete.", variant: "destructive" });
      return;
    }

    if (productQueue.length === 0) {
      addLog("Product queue is empty.", 'info');
      toast({ title: "Queue Empty", description: "No more products to process." });
      setCurrentProduct(null);
      setProcessStatus('idle');
      return;
    }
    
    const nextProduct = productQueue[0];
    setProductQueue(prev => prev.slice(1));
    setCurrentProduct(nextProduct);
    setAiValidationResult(null);
    setProcessStatus('inspecting');
    addLog(`Product ${nextProduct.deviceId} (SN: ${nextProduct.serialNumber}) moved to inspection.`, 'info');
  }, [productQueue, addLog, toast, processStatus]); // processStatus added

  useEffect(() => {
    // Automatically load the first product if queue is not empty, no current product, and user is logged in.
    // And not currently in an AI validation state.
    if (isLoggedIn && !currentProduct && productQueue.length > 0 && processStatus !== 'ai_validating') {
      handleNextProduct();
    }
  }, [isLoggedIn, currentProduct, productQueue, processStatus, handleNextProduct]); // productQueue and processStatus added


  const handleGenerateLabel = () => {
    if (!currentProduct) return;
    
    const compliancePassed = currentProduct.rohsCompliant; 
    if (!compliancePassed) {
        addLog(`Compliance check failed for ${currentProduct.deviceId}. Label not generated.`, 'error');
        toast({ title: "Compliance Failed", description: `${currentProduct.deviceId} is not RoHS compliant.`, variant: "destructive" });
        setProcessStatus('validation_complete_rejected'); 
        return;
    }

    const labelText = `DeviceID:${currentProduct.deviceId}\\nBatchID:${currentProduct.batchId}\\nMfgDate:${currentProduct.manufacturingDate}\\nRoHS:${currentProduct.rohsCompliant ? 'Yes' : 'No'}\\nSN:${currentProduct.serialNumber}`;
    const labelImageUrl = `https://placehold.co/400x200.png/.webp?text=${encodeURIComponent(labelText)}&font=spacegrotesk`;
    
    setCurrentProduct(prev => prev ? { ...prev, labelImageUrl } : null);
    setProcessStatus('label_generated');
    addLog(`Label generated for ${currentProduct.deviceId} (SN: ${currentProduct.serialNumber}).`, 'success');
    toast({ title: "Label Generated", description: `Simulated label created for ${currentProduct.deviceId}.` });
  };

  const handleValidateAI = async () => {
    if (!currentProduct || !currentProduct.labelImageUrl) return;

    setIsLoadingAi(true);
    setProcessStatus('ai_validating');
    addLog(`AI label validation started for ${currentProduct.deviceId} (SN: ${currentProduct.serialNumber})...`, 'ai');
    toast({ title: "AI Validation", description: "Sending label for AI validation..." });

    const aiInput: ValidateLabelQualityInput = {
      labelImageUri: currentProduct.labelImageUrl,
      deviceId: currentProduct.deviceId,
      batchId: currentProduct.batchId,
      manufacturingDate: currentProduct.manufacturingDate,
      rohsCompliance: currentProduct.rohsCompliant,
      serialNumber: currentProduct.serialNumber, // Added serial number
    };

    try {
      const result = await validateLabelQuality(aiInput);
      setAiValidationResult({ isValid: result.isValid, validationMessage: result.validationResult });
      if (result.isValid) {
        addLog(`AI Validation Passed for ${currentProduct.deviceId} (SN: ${currentProduct.serialNumber}): ${result.validationResult}`, 'success');
        setProcessStatus('validation_complete_accepted');
        toast({ title: "AI Validation Passed", description: result.validationResult, variant: "default" });
      } else {
        addLog(`AI Validation Failed for ${currentProduct.deviceId} (SN: ${currentProduct.serialNumber}): ${result.validationResult}`, 'error');
        setProcessStatus('validation_complete_rejected');
        toast({ title: "AI Validation Failed", description: result.validationResult, variant: "destructive" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown AI validation error";
      addLog(`AI validation error for ${currentProduct.deviceId} (SN: ${currentProduct.serialNumber}): ${errorMessage}`, 'error');
      setAiValidationResult({ isValid: false, validationMessage: `Error: ${errorMessage}` });
      setProcessStatus('validation_complete_rejected'); 
      toast({ title: "AI Error", description: `Validation failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const isNextProductDisabled = processStatus === 'ai_validating'; // Simplified: only disable if AI is actively validating

  if (isLoadingAuth || !isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading TraceSmart...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ConveyorBelt 
              currentProduct={currentProduct} 
              onNextProduct={handleNextProduct}
              productQueueCount={productQueue.length}
              isProcessing={isNextProductDisabled || productQueue.length === 0} // Disable if AI validating OR queue empty
            />
            <InspectionStation
              product={currentProduct}
              onGenerateLabel={handleGenerateLabel}
              onValidateAI={handleValidateAI}
              aiValidationResult={aiValidationResult}
              processStatus={processStatus}
              isLoadingAi={isLoadingAi}
            />
          </div>

          <div className="lg:col-span-1">
            <LogDisplay logs={logs} />
          </div>
        </div>
      </main>
      <footer className="text-center py-4 border-t border-border text-sm text-muted-foreground">
        TraceSmart © {new Date().getFullYear()} - A Simulated Product Traceability System
      </footer>
    </div>
  );
}
