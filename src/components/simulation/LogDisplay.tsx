"use client";

import type { LogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListChecks, Info, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface LogDisplayProps {
  logs: LogEntry[];
}

const LogIcon = ({ type }: { type: LogEntry['type'] }) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-4 w-4 text-accent mr-2 flex-shrink-0" />;
    case 'error': return <AlertTriangle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />;
    case 'ai': return <Sparkles className="h-4 w-4 text-primary mr-2 flex-shrink-0" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />;
  }
};

export default function LogDisplay({ logs }: LogDisplayProps) {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="bg-secondary/50">
        <CardTitle className="flex items-center text-lg font-headline">
          <ListChecks className="mr-2 h-6 w-6 text-primary" />
          Event Log
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-[300px] md:h-full p-6">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No events yet. Start processing products.</p>
          ) : (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="flex items-start text-sm pb-2 border-b border-border/50 last:border-b-0">
                  <LogIcon type={log.type} />
                  <div>
                    <span className="font-mono text-xs text-muted-foreground block">{log.timestamp}</span>
                    <p className="leading-tight">{log.message}</p>
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
