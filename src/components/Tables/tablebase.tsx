"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

interface TableBaseProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
}

export function TableBase<T>({ columns, data, rowKey }: TableBaseProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const currentData = data.slice(startIndex, endIndex);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 dark:bg-[#1a2233] bg-white p-4 shadow-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10  hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={`h-12 text-[11px] font-bold uppercase tracking-wider dark:text-gray-400 text-dark dark:bg-dark bg-gray-200 ${col.headerClassName || ""}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {currentData.map((row) => (
            <TableRow
              key={rowKey(row)}
              className="border-b border-white/5 transition-colors last:border-0 dark:hover:bg-white/[0.02]"
            >
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  className={`py-4 text-sm text-white ${col.className || ""}`}
                >
                  {typeof col.accessor === "function"
                    ? col.accessor(row)
                    : (row[col.accessor] as ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 px-2 py-4 text-xs text-gray-400">
        <span>
          Mostrando {totalItems > 0 ? startIndex + 1 : 0} a {endIndex} de{" "}
          {totalItems} resultados
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded bg-gray-200 px-3 py-1.5 text-gray-800 transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Anterior
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalItems === 0}
            className="rounded bg-primary px-3 py-1.5 text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
