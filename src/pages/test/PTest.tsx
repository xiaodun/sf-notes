import { useEffect } from 'react';

export default () => {
  useEffect(() => {
    setTimeout(() => {
      document.title = '测试页';
    });
  }, []);
  return '';
};
