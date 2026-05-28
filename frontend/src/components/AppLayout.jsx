import LeftSidebar from './LeftSidebar';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <LeftSidebar />
      <main style={{ minHeight: '100vh', boxSizing: 'border-box', minWidth: 0, width: '100%', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
