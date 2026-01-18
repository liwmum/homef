import type { PaginationMeta } from '../types';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface DataTableProps<T> {
  title: string;
  columns: { header: string; accessor: keyof T | ((item: T) => React.ReactNode) }[];
  data: T[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
}

export default function DataTable<T extends { id: number }>({
  title, columns, data, meta, onPageChange, onAdd, onEdit, onDelete 
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> Создать
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 font-semibold">{col.header}</th>
              ))}
              <th className="px-6 py-4 font-semibold text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                {columns.map((col, i) => (
                  <td key={i} className="px-6 py-4 text-gray-700">
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
        <span className="text-sm text-gray-500">
          Страница {meta.page} из {meta.totalPages} (Всего: {meta.total})
        </span>
        <div className="flex gap-2">
          <button 
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
            className="p-2 border rounded-md disabled:opacity-30 hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
            className="p-2 border rounded-md disabled:opacity-30 hover:bg-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}