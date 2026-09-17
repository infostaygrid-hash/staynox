import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from './actions';
import styles from './layout.module.css';

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  // If not logged in, they can only see the login page
  // Wait, if they are on /admin/login, we shouldn't redirect them.
  // We handle that logic in middleware or just check in page.js, but since this layout wraps /admin and /admin/login, 
  // we actually shouldn't enforce auth in the root admin layout, but only in the admin dashboard page.
  // Or we can just use layout for the dashboard styling and skip the nav for /login.
  
  return (
    <div className={styles.adminLayout}>
      {token && (
        <nav className={styles.adminNav}>
          <div className={styles.brand}>StayNox Admin</div>
          <div className={styles.links}>
            <Link href="/admin">Dashboard</Link>
            <Link href="/">Live Site ↗</Link>
          </div>
          <form action={logout}>
            <button type="submit" className={styles.logoutBtn}>Logout</button>
          </form>
        </nav>
      )}
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}
