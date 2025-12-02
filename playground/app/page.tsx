'use client';

import dynamic from 'next/dynamic';

// diagen 라이브러리가 서버 사이드에서 동작하지 않으므로 클라이언트에서만 로드
const DiagramEditor = dynamic(() => import('@/components/DiagramEditor'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#1e1e2e',
      color: '#e0e0e0',
    }}>
      Loading Diagen Playground...
    </div>
  ),
});

export default function Home() {
  return <DiagramEditor />;
}
