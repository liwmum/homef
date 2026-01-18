import { User, Wallet, Tags, ArrowRightLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const modules = [
  { name: 'Пользователи', path: '/users', icon: <User size={32} />, color: 'bg-blue-600', desc: 'Управление аккаунтами и доступом' },
  { name: 'Счета', path: '/accounts', icon: <Wallet size={32} />, color: 'bg-emerald-600', desc: 'Просмотр балансов и редактирование счетов' },
  { name: 'Категории', path: '/categories', icon: <Tags size={32} />, color: 'bg-violet-600', desc: 'Глобальный список доходов и расходов' },
  { name: 'Транзакции', path: '/transactions', icon: <ArrowRightLeft size={32} />, color: 'bg-amber-600', desc: 'История всех денежных операций' },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">FinTracker Control</h1>
        <p className="text-gray-600 text-lg">Выберите раздел для работы со справочниками</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((m) => (
          <Link 
            key={m.path} 
            to={m.path} 
            className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`${m.color} text-white p-4 rounded-xl shadow-lg`}>
                {m.icon}
              </div>
            </div>
            <h2 className="text-2xl font-bold mt-6 text-gray-800">{m.name}</h2>
            <p className="text-gray-500 mt-2">{m.desc}</p>
            <div className="mt-6 flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-900">
              Открыть раздел <ArrowRightLeft className="ml-2 w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}