import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold">{time.toLocaleTimeString()}</h2>
      <p className="text-lg">{time.toLocaleDateString()}</p>
    </div>
  );
}
