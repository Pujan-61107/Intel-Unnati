
"use client";

import type { Product } from '@/lib/types';
import { Package, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface ConveyorBeltProps {
  currentProduct: Product | null;
  onNextProduct: () => void;
  productQueueCount: number;
  isProcessing: boolean;
}

export default function ConveyorBelt({ currentProduct, onNextProduct, productQueueCount, isProcessing }: ConveyorBeltProps) {
  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="bg-secondary/50">
        <CardTitle className="flex items-center text-lg font-headline">
          <Package className="mr-2 h-6 w-6 text-primary" />
          Conveyor & Inspection Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Upcoming Products Queue */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center text-muted-foreground mb-2">
              <RotateCcw className="h-5 w-5 mr-2 animate-spin [animation-duration:5s]" />
              <span>Product Queue</span>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(productQueueCount, 3) }).map((_, i) => (
                <div key={`queue-${i}`} className="p-3 bg-muted rounded-lg shadow animate-pulse">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              ))}
              {productQueueCount > 3 && <span className="text-muted-foreground self-center">+{productQueueCount-3} more</span>}
            </div>
            {productQueueCount === 0 && !currentProduct && <p className="text-sm text-muted-foreground mt-2">No products in queue.</p>}
          </div>

          {/* Inspection Zone */}
          <div className="flex-1 flex justify-center items-center min-h-[180px] border-2 border-dashed border-border rounded-lg p-4 bg-background shadow-inner relative overflow-hidden">
            {/* Animated Belt Surface */}
            <div 
              className="absolute inset-0 w-full h-full animate-conveyor-stripes-flow opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.5) 10px, transparent 10px, transparent 20px)',
                backgroundSize: '40px 40px',
              }}
            />
            
            {currentProduct ? (
              <div className="text-center animate-fadeIn relative z-10">
                <Image 
                  src="https://placehold.co/100x80.png" 
                  alt="Product" 
                  width={100} 
                  height={80} 
                  className="mx-auto mb-2 rounded shadow-md"
                  data-ai-hint="electronic device"
                />
                <p className="font-semibold text-primary">{currentProduct.deviceId}</p>
                <p className="text-xs text-muted-foreground">Arrived for inspection</p>
              </div>
            ) : (
              <p className="text-muted-foreground relative z-10">Inspection zone empty</p>
            )}
            {/* Static Chevrons indicating movement direction */}
             <ChevronRight className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/30 z-0" />
             <ChevronRight className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/30 z-0" />
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button onClick={onNextProduct} disabled={isProcessing || productQueueCount === 0} className="bg-primary hover:bg-primary/90">
            <ChevronRight />
            Load Next Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
