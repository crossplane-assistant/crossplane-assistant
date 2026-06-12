import React, { useState, useRef } from 'react';
import { ClaimTreeNode } from '../types';
import { useTelemetryAverage } from '../queries/useTelemetryQueries';
import { Clock, CheckCircle2, Gauge } from 'lucide-react';

const slidingStripesStyle = `
@keyframes stripes-slide {
  0% { background-position: 0 0; }
  100% { background-position: 30px 0; }
}
.animate-stripes-sliding {
  background-image: linear-gradient(
    45deg,
    rgba(203, 213, 225, 0.4) 25%,
    transparent 25%,
    transparent 50%,
    rgba(203, 213, 225, 0.4) 50%,
    rgba(203, 213, 225, 0.4) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
  animation: stripes-slide 1.2s linear infinite;
}
`;

interface ClaimGanttTimelineProps {
  root: ClaimTreeNode;
}

export const ClaimGanttTimeline: React.FC<ClaimGanttTimelineProps> = ({ root }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playheadX, setPlayheadX] = useState<number | null>(null);

  // 1. Flatten the recursive tree of nodes into a simple array
  const flattenTree = (node: ClaimTreeNode): ClaimTreeNode[] => {
    const list: ClaimTreeNode[] = [node];
    if (node.children) {
      for (const child of node.children) {
        list.push(...flattenTree(child));
      }
    }
    return list;
  };

  const allNodes = flattenTree(root);

  // Filter out any nodes that do not contain a manifest
  const nodesWithManifest = allNodes.filter((n) => n.manifest && n.manifest.metadata?.creationTimestamp);

  if (nodesWithManifest.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 italic bg-white border border-slate-200 rounded-xl shadow-sm">
        No resource manifests found. Timeline cannot be rendered.
      </div>
    );
  }

  // 2. Chronological sorting and time calculations
  const sortedNodes = [...nodesWithManifest].sort((a, b) => {
    const tA = new Date(a.manifest.metadata.creationTimestamp).getTime();
    const tB = new Date(b.manifest.metadata.creationTimestamp).getTime();
    return tA - tB;
  });

  const claimCreationTimestamp = root.manifest?.metadata?.creationTimestamp;
  const startTime = claimCreationTimestamp
    ? new Date(claimCreationTimestamp).getTime()
    : Math.min(...sortedNodes.map((n) => new Date(n.manifest.metadata.creationTimestamp).getTime()));

  // Determine latest time to bound the timeline scale
  let latestTime = startTime;
  for (const node of sortedNodes) {
    const readyCond = node.manifest.status?.conditions?.find((c: any) => c.type === 'Ready');
    if (readyCond && readyCond.status === 'True' && readyCond.lastTransitionTime) {
      const ready = new Date(readyCond.lastTransitionTime).getTime();
      if (ready > latestTime) latestTime = ready;
    } else {
      const now = Date.now();
      if (now > latestTime) latestTime = now;
    }
  }

  // Expand timeline by 5% so bars do not sit at absolute edge
  const totalDuration = Math.max(1000, (latestTime - startTime) * 1.05);

  // Generate ticks for scale
  const generateTicks = (durationMs: number) => {
    const ticks = [];
    const totalSeconds = durationMs / 1000;

    let step = 10;
    if (totalSeconds > 60) step = 30;
    if (totalSeconds > 300) step = 60;
    if (totalSeconds > 1200) step = 300;

    for (let s = 0; s <= totalSeconds; s += step) {
      ticks.push({
        percent: (s / totalSeconds) * 100,
        label: s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${s % 60 > 0 ? ` ${s % 60}s` : ''}`,
      });
    }
    return ticks;
  };

  const ticks = generateTicks(totalDuration);

  // Mouse move handler for interactive vertical playhead
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const timelineStartLeft = rect.left + 240; // Align offset past the labels column (240px wide)
    const timelineWidth = rect.width - 240;

    const mouseX = e.clientX - timelineStartLeft;
    if (mouseX >= 0 && mouseX <= timelineWidth) {
      setPlayheadX((mouseX / timelineWidth) * 100);
    } else {
      setPlayheadX(null);
    }
  };

  const handleMouseLeave = () => {
    setPlayheadX(null);
  };

  return (
    <div className="space-y-4">
      <style>{slidingStripesStyle}</style>

      {/* Gantt Chart Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header Metadata */}
        <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
              Provisioning Gantt Timeline
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Track the exact sequential progression, scheduling delay, and active provisioning time of claim resources.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-500 bg-white border border-slate-150 px-3 py-1.5 rounded-lg shadow-2xs self-start">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-200 border border-slate-300 rounded animate-stripes-sliding" />
              Scheduling Delay
            </span>
            <span className="w-px h-3 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-400 border border-emerald-500 rounded" />
              Active Cloud Creation
            </span>
          </div>
        </div>

        {/* Timeline Table Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative select-none overflow-x-auto min-w-full"
        >
          {/* Header Row (Scale Ticks) */}
          <div className="flex items-stretch border-b border-slate-100 bg-slate-50/30 text-[10px] text-slate-400 font-bold font-mono h-10 px-4">
            <div className="w-[240px] flex-shrink-0 flex items-center border-r border-slate-100 pr-4">
              Resource Details
            </div>
            <div className="flex-1 relative h-full">
              {ticks.map((tick, idx) => (
                <div
                  key={idx}
                  className="absolute bottom-0 transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${tick.percent}%` }}
                >
                  <span className="mb-1">{tick.label}</span>
                  <div className="w-px h-2 bg-slate-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Grid Background lines */}
          <div className="absolute top-10 bottom-0 left-0 right-0 pointer-events-none flex">
            <div className="w-[240px] flex-shrink-0 border-r border-slate-100 bg-slate-50/10" />
            <div className="flex-1 relative h-full">
              {ticks.map((tick, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 w-px bg-slate-100/60 border-l border-dashed border-slate-200/40"
                  style={{ left: `${tick.percent}%` }}
                />
              ))}
            </div>
          </div>

          {/* Vertical Playhead Cursor line */}
          {playheadX !== null && (
            <div
              className="absolute top-10 bottom-0 w-px bg-indigo-400/80 pointer-events-none z-30 shadow-xs"
              style={{ left: `calc(240px + ${playheadX}%)` }}
            >
              <div className="absolute top-[-3px] left-[-3px] w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </div>
          )}

          {/* Rows List */}
          <div className="divide-y divide-slate-100 relative z-10">
            {sortedNodes.map((node, index) => {
              const manifest = node.manifest;
              const apiVersion = manifest?.apiVersion || node.version;
              const kind = manifest?.kind || node.kind;
              const name = manifest?.metadata?.name || node.name;

              const created = new Date(manifest.metadata.creationTimestamp).getTime();
              const readyCond = manifest.status?.conditions?.find((c: any) => c.type === 'Ready');
              const isReady = readyCond?.status === 'True';
              const readyTime = isReady && readyCond?.lastTransitionTime ? new Date(readyCond.lastTransitionTime).getTime() : undefined;

              const waitDuration = created - startTime;
              const activeDuration = (readyTime || Date.now()) - created;

              const waitWidth = (waitDuration / totalDuration) * 100;
              const activeWidth = (activeDuration / totalDuration) * 100;
              const startOffset = ((created - startTime) / totalDuration) * 100;

              return (
                <TimelineRow
                  key={node.uid || `${kind}-${name}-${index}`}
                  kind={kind}
                  apiVersion={apiVersion}
                  name={name}
                  isReady={isReady}
                  waitDuration={waitDuration}
                  activeDuration={activeDuration}
                  waitWidth={waitWidth}
                  activeWidth={activeWidth}
                  startOffset={startOffset}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimelineRowProps {
  kind: string;
  apiVersion: string;
  name: string;
  isReady: boolean;
  waitDuration: number;
  activeDuration: number;
  waitWidth: number;
  activeWidth: number;
  startOffset: number;
}

const TimelineRow: React.FC<TimelineRowProps> = ({
  kind,
  apiVersion,
  name,
  isReady,
  waitDuration,
  activeDuration,
  waitWidth,
  activeWidth,
  startOffset,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fetch the cluster-wide average dynamically
  const { data: telemetry } = useTelemetryAverage(apiVersion, kind);

  const formatDuration = (ms: number) => {
    const sec = ms / 1000;
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const min = Math.floor(sec / 60);
    const remSec = Math.round(sec % 60);
    return `${min}m ${remSec > 0 ? remSec + 's' : ''}`;
  };

  const avgDurationMs = telemetry && telemetry.averageSeconds ? telemetry.averageSeconds * 1000 : null;
  const isSlowerThanAverage = avgDurationMs ? activeDuration > avgDurationMs : false;
  const timeDifference = avgDurationMs ? Math.abs(activeDuration - avgDurationMs) : 0;

  // Compute position of the benchmark marker relative to the active block
  // Benchmark point is placed relative to the beginning of active provisioning
  const totalBarMs = waitDuration + activeDuration;
  const avgOffsetPercent = avgDurationMs && totalBarMs > 0 ? startOffset + (avgDurationMs / totalBarMs) * activeWidth : null;

  return (
    <div
      className="group relative flex items-stretch py-3.5 hover:bg-slate-50/50 px-4 transition-colors duration-150"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label and Status */}
      <div className="w-[240px] flex-shrink-0 flex items-start gap-2.5 pr-4 border-r border-slate-100 z-10 min-w-0">
        <div className="mt-0.5">
          {isReady ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0 [animation-duration:8s]" />
          )}
        </div>
        <div className="min-w-0 flex flex-col">
          <span className="font-extrabold text-[11px] text-slate-800 font-mono tracking-tight uppercase truncate">
            {kind}
          </span>
          <span className="text-[10px] text-blue-600 font-bold font-mono truncate" title={name}>
            {name}
          </span>
        </div>
      </div>

      {/* Gantt Bar Section */}
      <div className="flex-1 relative flex items-center min-h-[32px] px-2">
        {/* Timeline Bar wrapper */}
        <div className="w-full h-7 bg-slate-100/60 rounded-xl relative overflow-hidden border border-slate-150/40">
          {/* 1. Wait/Scheduling Delay Phase */}
          {waitWidth > 0 && (
            <div
              className="absolute top-0 bottom-0 left-0 animate-stripes-sliding bg-slate-200/70 border-r border-dashed border-slate-300"
              style={{ width: `${waitWidth}%` }}
              title={`Scheduling delay : ${formatDuration(waitDuration)}`}
            />
          )}

          {/* 2. Active Cloud Creation Phase */}
          <div
            className={`absolute top-0 bottom-0 rounded-r-lg transition-all duration-500 shadow-xs flex items-center justify-between px-3 ${
              isReady
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 border border-emerald-500 shadow-emerald-50/30'
                : 'bg-gradient-to-r from-amber-400 to-orange-400 border border-amber-500 shadow-amber-50/30 animate-pulse'
            }`}
            style={{ left: `${startOffset}%`, width: `${activeWidth}%` }}
          >
            {activeWidth > 15 && (
              <span className="text-[9px] text-white font-extrabold font-mono tracking-wider drop-shadow-2xs">
                {formatDuration(activeDuration)}
              </span>
            )}
          </div>
        </div>

        {/* 3. Benchmark Marker & Comparison Tooltip */}
        {avgOffsetPercent && avgOffsetPercent <= 100 && (
          <>
            {/* The vertical indigo marker line */}
            <div
              className="absolute top-1 bottom-1 w-0.5 bg-indigo-500/80 z-20 pointer-events-none"
              style={{ left: `${avgOffsetPercent}%` }}
            >
              <div className="absolute top-[-3px] left-[-3.5px] border-solid border-t-indigo-500 border-t-[6px] border-x-transparent border-x-4 border-b-0" />
            </div>

            {/* Glassmorphic Tooltip Card displaying comparison values */}
            <div
              className={`absolute bottom-full mb-1 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-mono rounded-xl p-2.5 shadow-xl border border-slate-800 transition-all duration-200 z-40 flex flex-col gap-1 w-52 pointer-events-none ${
                isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
              }`}
              style={{ left: `calc(${avgOffsetPercent}% - 104px)` }}
            >
              <div className="flex justify-between items-center pb-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-indigo-400" /> Cluster Benchmark
                </span>
                <span className="text-[9px] text-indigo-300 font-extrabold font-mono bg-indigo-950/50 border border-indigo-900/50 rounded px-1.5 py-0.5">
                  n={telemetry?.sampleSize}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Current creation:</span>
                <span className="font-extrabold text-white">{formatDuration(activeDuration)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Cluster average:</span>
                <span className="font-extrabold text-slate-300">
                  {avgDurationMs !== null ? formatDuration(avgDurationMs) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-slate-800/80 pt-1 text-[10px] font-bold">
                <span className="text-slate-400">Performance Delta:</span>
                <span className={isSlowerThanAverage ? 'text-amber-400' : 'text-emerald-400'}>
                  {isSlowerThanAverage
                    ? `+${formatDuration(timeDifference)} slower`
                    : `-${formatDuration(timeDifference)} faster ⚡`}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
