import type { ColumnDef } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    width?: string;
    className?: string;
  }
}
