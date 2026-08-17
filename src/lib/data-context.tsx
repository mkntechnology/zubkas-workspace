import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client, Invoice, Payment, Quotation, LineItem, IncomeCategory, ExpenseCategory, Transaction, Project, Task } from '@/lib/types';

interface DataState {
  clients: Client[];
  quotations: Quotation[];
  invoices: Invoice[];
  payments: Payment[];
  incomeCategories: IncomeCategory[];
  expenseCategories: ExpenseCategory[];
  transactions: Transaction[];
  projects: Project[];
  tasks: Task[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataState>({
  clients: [],
  quotations: [],
  invoices: [],
  payments: [],
  incomeCategories: [],
  expenseCategories: [],
  transactions: [],
  projects: [],
  tasks: [],
  loading: true,
  refresh: async () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const [c, q, i, p, ic, ec, t, pr, tk] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('quotations').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('payment_date', { ascending: false }),
      supabase.from('income_categories').select('*').order('name', { ascending: true }),
      supabase.from('expense_categories').select('*').order('name', { ascending: true }),
      supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('sort_order', { ascending: true }),
    ]);
    [c, q, i, p, ic, ec, t, pr, tk].forEach((r, idx) => {
      if (r.error) console.error(`[Supabase] Failed to load ${['clients','quotations','invoices','payments','income_categories','expense_categories','transactions','projects','tasks'][idx]}:`, r.error);
    });
    setClients(c.data || []);
    setQuotations(q.data || []);
    setInvoices(i.data || []);
    setPayments(p.data || []);
    setIncomeCategories(ic.data || []);
    setExpenseCategories(ec.data || []);
    setTransactions(t.data || []);
    setProjects(pr.data || []);
    setTasks(tk.data || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel('realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotations' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'income_categories' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_categories' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoice_items' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotation_items' }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <DataContext.Provider value={{ clients, quotations, invoices, payments, incomeCategories, expenseCategories, transactions, projects, tasks, loading, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
export type { LineItem };
