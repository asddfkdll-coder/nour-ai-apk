import { useState, useEffect } from 'react';
export const useServerStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [serverInfo, setServerInfo] = useState<any>(null);
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/health', {
          method: 'GET', headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setIsOnline(true);
          setServerInfo(data);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        setIsOnline(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);
  return { isOnline, isChecking, serverInfo };
};
export default useServerStatus;
