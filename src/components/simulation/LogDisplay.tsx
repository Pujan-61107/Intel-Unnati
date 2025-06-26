
"use client";

import type { LogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ListChecks, Info, CheckCircle, AlertTriangle, Sparkles, Trash2 } from 'lucide-react';

interface LogDisplayProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

const LogIcon = ({ type }: { type: LogEntry['type'] }) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-4 w-4 text-accent mr-2 flex-shrink-0" />;
    case 'error': return <AlertTriangle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />;
  }
};

export default function LogDisplay({ logs, onClearLogs }: LogDisplayProps) {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="bg-secondary/50">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg font-headline">
            <ListChecks className="mr-2 h-6 w-6 text-primary" />
            Event Log
            </CardTitle>
            <Button onClick={onClearLogs} variant="outline" size="sm" className="ml-auto">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-[300px] md:h-[calc(100%-0px)] p-6"> {/* Adjusted height for better fit if needed */}
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No events yet. Start processing products.</p>
          ) : (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="flex items-start text-sm pb-2 border-b border-border/50 last:border-b-0">
                  <LogIcon type={log.type} />
                  <div>
                    <span className="font-mono text-xs text-muted-foreground block">{log.timestamp}</span>
                    <p className="leading-tight break-words">{log.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
