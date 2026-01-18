import { useState, useEffect } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import type { ApiResponse, PaginationMeta } from '../types';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 5, totalPages: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const fetchUsers = async (page: number) => {
    const res = await api.get<ApiResponse<User>>(`/users?page=${page}&limit=5`);
    setUsers(res.data.data);
    setMeta(res.data.meta);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/users', formData); // Отправка на бэкенд
    setIsModalOpen(false);
    setFormData({ name: '', email: '' });
    fetchUsers(1); // Перезагружаем список
  };

  useEffect(() => { fetchUsers(1); }, []);

  return (
    <div className="p-8">
      <DataTable 
        title="Пользователи"
        columns={[
          { header: 'ID', accessor: 'id' as keyof User },
          { header: 'Имя', accessor: 'name' as keyof User },
          { header: 'Email', accessor: 'email' as keyof User },
        ]}
        data={users}
        meta={meta}
        onPageChange={fetchUsers}
        onAdd={() => setIsModalOpen(true)}
        onEdit={(user) => console.log('Edit', user)}
        onDelete={(id) => console.log('Delete', id)}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Новый пользователь">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Имя</label>
            <input 
              type="text" required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700">
            Сохранить
          </button>
        </form>
      </Modal>
    </div>
  );
}