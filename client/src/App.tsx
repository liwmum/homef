import { useEffect, useState } from 'react'

const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '40px 20px',
  fontFamily: '"Segoe UI", Roboto, sans-serif',
  backgroundColor: '#f8f9fa', // Светло-серый фон страницы
  minHeight: '100vh'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff', // Белая карточка
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '20px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  color: '#2d3436' // Темно-серый текст (чтобы было видно!)
};

const inputStyle: React.CSSProperties = {
  padding: '10px',
  marginRight: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  width: '200px'
};

const addBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#00b894',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};


function App() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Загрузка данных с сервера
  const fetchUsers = () => {
    fetch('http://localhost:3000/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  useEffect(() => { fetchUsers(); }, []);

  const addUser = async () => {
    await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    fetchUsers(); // Обновляем список
  };

  const deleteUser = async (id: number) => {
    await fetch(`http://localhost:3000/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

return (
  <div style={containerStyle}>
    <h1 style={{ color: '#2d3436', textAlign: 'center' }}>Мой ФинТрекер 💰</h1>
    
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e0e0e0' }}>
      <h3 style={{ marginTop: 0 }}>Добавить пользователя</h3>
      <input style={inputStyle} placeholder="Имя" onChange={e => setName(e.target.value)} />
      <input style={inputStyle} placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <button style={addBtnStyle} onClick={addUser}>Создать</button>
    </div>

    <div>
      {users.map(user => (
        <div key={user.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2em' }}>👤 {user.name}</h2>
            <button onClick={() => deleteUser(user.id)} style={{ color: '#ff7675', border: 'none', background: 'none', cursor: 'pointer' }}>
              Удалить
            </button>
          </div>
          <p style={{ color: '#636e72', fontSize: '0.9em' }}>📧 {user.email}</p>
          
          <div style={{ background: '#f1f2f6', padding: '15px', borderRadius: '8px' }}>
            {user.accounts?.map((acc: any) => (
              <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>💰 {acc.name}</span>
                <span style={{ color: '#2ecc71' }}>{acc.balance} ₽</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
}

export default App