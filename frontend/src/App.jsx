import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    console.log('clicked');
    const payload = {
      message: 'Hello from React!',
      count: count + 1,
      timestamp: new Date().toISOString(),
    };
    axios.post('http://localhost:4000/api/message', payload);
  };

  return (
    <>
      <button onClick={handleClick}>버튼</button>

      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
