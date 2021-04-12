import { useState } from 'react';
const useRefreshView = () => {
  const [radomKey, setRadomkey] = useState<number>();

  return () => {
    setRadomkey(Math.random());
  };
};

export default useRefreshView;
