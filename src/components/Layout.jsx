import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-white w-full">
      <div className="m-auto w-full">
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
