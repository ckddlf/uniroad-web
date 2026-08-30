'use client';

import { useEffect, useState } from 'react';

/**
 * 탭이 화면에 보이는지 여부.
 * 폴링은 보이지 않는 동안 멈추고, 돌아오면 즉시 한 번 갱신하는 데 쓴다.
 */
export function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);

    update();
    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);

    return () => {
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('focus', update);
    };
  }, []);

  return visible;
}
