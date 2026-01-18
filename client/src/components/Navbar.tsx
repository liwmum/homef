import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex gap-4 font-bold">
        <Link to="/">Главная</Link>
        <Link to="/users">Пользователи</Link>
      </div>
    </nav>
  );
}