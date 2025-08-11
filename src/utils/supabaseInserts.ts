import { supabase } from '../lib/supabase';

// Insert a record into the email_change_audit table
export async function insertEmailChangeAudit({
  user_id,
  old_email,
  new_email,
  changed_at,
  ip_address,
}: {
  user_id: string;
  old_email: string;
  new_email: string;
  changed_at: string;
  ip_address: string;
}) {
  const { data, error } = await supabase
    .from('email_change_audit')
    .insert([
      { user_id, old_email, new_email, changed_at, ip_address }
    ]);
  if (error) throw error;
  return data;
}

// Insert a record into the payments table
export async function insertPayment({
  order_id,
  payment_id,
  amount,
  project_id,
  customer_name,
  customer_email,
  status,
  created_at,
  updated_at,
  user_agent,
}: {
  order_id: string;
  payment_id: string;
  amount: number;
  project_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_agent?: string;
}) {
  const insertObj: any = {
    order_id,
    payment_id,
    amount,
    project_id,
    customer_name,
    customer_email,
    status,
    created_at,
    updated_at
  };
  if (user_agent) insertObj.user_agent = user_agent;
  const { data, error } = await supabase
    .from('payments')
    .insert([
      insertObj
    ]);
  if (error) throw error;
  return data;
}
