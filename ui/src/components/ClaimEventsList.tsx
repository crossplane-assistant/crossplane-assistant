import React from 'react';
import { Info, AlertTriangle, Clock } from 'lucide-react';

interface EventItem {
  type: string;
  reason: string;
  message: string;
  source?: { component?: string; host?: string } | string;
  firstTimestamp?: string;
  lastTimestamp?: string;
  count?: number;
}

interface ClaimEventsListProps {
  events: EventItem[];
  isLoading?: boolean;
}

function formatEventTime(timestamp: string): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 0) return 'now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const ClaimEventsList: React.FC<ClaimEventsListProps> = ({ events = [], isLoading = false }) => {
  if (isLoading) {
    return <div className="p-4 text-center text-slate-400 italic text-xs animate-pulse">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 italic text-center text-xs">
        No recent events found for this resource.
      </div>
    );
  }

  // Sort events so latest events are at the top (by lastTimestamp if available)
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.lastTimestamp ? new Date(a.lastTimestamp).getTime() : 0;
    const timeB = b.lastTimestamp ? new Date(b.lastTimestamp).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
      {sortedEvents.map((event, idx) => {
        const isWarning = event.type?.toLowerCase() === 'warning';
        const sourceName =
          typeof event.source === 'object'
            ? event.source?.component || ''
            : typeof event.source === 'string'
            ? event.source
            : '';

        return (
          <div
            key={idx}
            className={`border rounded-lg p-3 text-xs flex gap-3 shadow-sm transition-colors ${
              isWarning ? 'bg-red-50/50 border-red-200' : 'bg-slate-50/30 border-slate-100'
            }`}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {isWarning ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <Info className="w-4 h-4 text-blue-500" />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-bold uppercase tracking-wider text-[10px] ${isWarning ? 'text-red-700' : 'text-slate-700'}`}>
                  {event.reason}
                </span>
                
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[9px] flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {event.lastTimestamp && <span>{formatEventTime(event.lastTimestamp)}</span>}
                  {event.count && event.count > 1 && (
                    <span className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-bold">
                      x{event.count}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-slate-600 font-medium mt-1 leading-relaxed break-words">
                {event.message}
              </p>

              {sourceName && (
                <div className="text-[10px] text-slate-400 font-mono mt-1.5 flex items-center gap-1">
                  <span className="font-semibold text-slate-500">Source:</span> {sourceName}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
