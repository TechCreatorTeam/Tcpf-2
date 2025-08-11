import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';


interface EmailChangeAudit {
  id: string;
  user_id: string;
  old_email: string;
  new_email: string;
  changed_at: string;
  ip_address: string;
}

const AdminEmailChangeAuditPage = () => {
  const [records, setRecords] = useState<EmailChangeAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_change_audit')
        .select('*')
        .order('changed_at', { ascending: false });
      if (error) setError(error.message);
      else setRecords((data as EmailChangeAudit[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8 dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Email Change Audit</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">Old Email</th>
                  <th className="px-4 py-2">New Email</th>
                  <th className="px-4 py-2">Changed At</th>
                  <th className="px-4 py-2">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{row.user_id}</td>
                    <td className="px-4 py-2">{row.old_email}</td>
                    <td className="px-4 py-2">{row.new_email}</td>
                    <td className="px-4 py-2">{new Date(row.changed_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{row.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && <div className="text-gray-500 mt-4">No records found.</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEmailChangeAuditPage;
