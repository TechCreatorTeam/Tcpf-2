import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';

interface Payment {
  id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  project_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_agent: string;
}

const AdminPaymentsPage = () => {
  const [records, setRecords] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setRecords(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8 dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Payments</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2">Order ID</th>
                  <th className="px-4 py-2">Payment ID</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Project ID</th>
                  <th className="px-4 py-2">Customer Name</th>
                  <th className="px-4 py-2">Customer Email</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created At</th>
                  <th className="px-4 py-2">Updated At</th>
                  <th className="px-4 py-2">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{row.order_id}</td>
                    <td className="px-4 py-2">{row.payment_id}</td>
                    <td className="px-4 py-2">{row.amount}</td>
                    <td className="px-4 py-2">{row.project_id}</td>
                    <td className="px-4 py-2">{row.customer_name}</td>
                    <td className="px-4 py-2">{row.customer_email}</td>
                    <td className="px-4 py-2">{row.status}</td>
                    <td className="px-4 py-2">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{new Date(row.updated_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{row.user_agent}</td>
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

export default AdminPaymentsPage;
