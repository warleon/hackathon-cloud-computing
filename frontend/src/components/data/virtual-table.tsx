import {
  flexRender,
  type Table as ReactTable,
  type Row,
} from "@tanstack/react-table";
import type { UIEvent } from "react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type VirtualTableProps<TData> = {
  table: ReactTable<TData>;
  rowHeight?: number;
  height?: number;
  className?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetching?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: Row<TData>) => void;
};

const DEFAULT_ROW_HEIGHT = 60;
const DEFAULT_HEIGHT = 420;
const OVERSCAN = 5;

export function VirtualTable<TData>({
  table,
  rowHeight = DEFAULT_ROW_HEIGHT,
  height = DEFAULT_HEIGHT,
  className,
  hasMore = false,
  onLoadMore,
  isFetching,
  emptyState,
  onRowClick,
}: VirtualTableProps<TData>) {
  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns();
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(height);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      !loaderRef.current ||
      !hasMore ||
      !onLoadMore ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    const node = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { root: containerRef.current, threshold: 1.0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  const totalHeight = rows.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
  const visibleCount = Math.ceil(containerHeight / rowHeight) + OVERSCAN * 2;
  const endIndex = Math.min(rows.length, startIndex + visibleCount);
  const visibleRows = rows.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

  const columnTemplate = useMemo(() => {
    const widths = columns.map(
      (column) => column.columnDef.meta?.width ?? "1fr"
    );
    return widths.join(" ");
  }, [columns]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-slate-200 bg-white",
        className
      )}
    >
      <div className="bg-slate-100">
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            className="grid gap-2 px-6 py-3 text-sm font-semibold text-slate-700"
            style={{ gridTemplateColumns: columnTemplate }}
          >
            {headerGroup.headers.map((header) => (
              <div key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-y-auto"
        style={{ height }}
        onScroll={handleScroll}
      >
        <div
          className="relative w-full"
          style={{ height: totalHeight || height }}
        >
          {rows.length === 0 && !isFetching ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              {emptyState ?? "No hay registros"}
            </div>
          ) : (
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${offsetY}px)`,
              }}
            >
              {visibleRows.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    "grid gap-2 px-6 py-4 text-sm text-slate-800 transition",
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50"
                      : "hover:bg-slate-50"
                  )}
                  style={{
                    gridTemplateColumns: columnTemplate,
                    height: rowHeight,
                  }}
                  onClick={() => onRowClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {hasMore && (
            <div
              ref={loaderRef}
              className="absolute left-0 w-full"
              style={{ top: Math.max(totalHeight - 1, 0), height: 1 }}
            />
          )}
        </div>
      </div>
      {isFetching && (
        <div className="border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-500">
          Cargando...
        </div>
      )}
    </div>
  );
}
