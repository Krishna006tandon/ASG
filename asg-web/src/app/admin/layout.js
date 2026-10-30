import AdminShell from './AdminShell';

export const metadata = {
  title: "Admin Dashboard | Avinash Platform",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
