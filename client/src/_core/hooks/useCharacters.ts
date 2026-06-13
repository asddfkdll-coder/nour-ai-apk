/**
 * @hook useCharacters
 * @description Fetch characters from local API
 * @security-note Public endpoint, no auth required
 */

import { useState, useEffect } from "react";

export interface Character {
  id: number;
  name: string;
  description: string;
  avatar_url: string | null;
  personality: string;
}

export function useCharacters() {
  const [data, setData] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("/api/characters")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.characters);
        }
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}

/**
 * @hook useNetwork
 * @description Simple online/offline detection
 */
export function useNetwork() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
