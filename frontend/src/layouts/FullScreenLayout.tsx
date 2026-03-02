import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import './FullScreenLayout.css';

export function FullScreenLayout() {
  return (
    <div className="fullscreen-layout">
      <Header />
      <main className="fullscreen-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
