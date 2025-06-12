import { ScanBarcode } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <ScanBarcode className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-2xl font-headline font-bold text-primary">
          TraceSmart
        </h1>
      </div>
    </header>
  );
}
