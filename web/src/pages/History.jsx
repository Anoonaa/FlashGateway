/**
 * HISTORY PAGE
 * Transaction ledger with filters and export options
 */

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/Header';
import { fetchJson, formatCurrency } from '../utils';

export default function HistoryPage({ session, notify }) {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const getTransactionCategory = (tx) => {
    if (tx?.transaction_kind) return String(tx.transaction_kind).toLowerCase();
    if (tx?.transaction_type === 'transfer') return 'transfer';
    if (tx?.transaction_type === 'service_purchase') {
      const serviceType = String(tx?.service_type || '').toLowerCase();
      if (serviceType === 'airtime' || serviceType === 'data') return serviceType;
      return 'service_purchase';
    }
    return String(tx?.transaction_type || 'other').toLowerCase();
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await fetchJson('/transactions/history');
        if (isMounted) setTransactions(data || []);
      } catch (err) {
        if (isMounted) notify(err.message, 'danger');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [notify]);

  const exportToCSV = () => {
    if (filtered.length === 0) {
      notify('No transactions to export.', 'warning');
      return;
    }

    const headers = ['Date', 'Reference ID', 'Description', 'Type', 'Amount (ZAR)', 'Status'];
    const rows = filtered.map(tx => [
      new Date(tx.created_at).toLocaleString(),
      `TRX-${String(tx.id).padStart(4, '0')}-A1F`,
      tx.transaction_type === 'service_purchase'
        ? `${(tx.service_type || 'service').toUpperCase()} Purchase`
        : 'Transfer Execution',
      tx.transaction_type === 'service_purchase'
        ? (tx.service_type || 'service')
        : 'Transfer',
      formatCurrency(tx.amount),
      tx.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('CSV exported successfully!', 'success');
  };

  const exportToPDF = () => {
    if (filtered.length === 0) {
      notify('No transactions to export.', 'warning');
      return;
    }

    const printWindow = window.open('', '', 'width=900,height=600');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f0f0f0; font-weight: bold; }
          tr:hover { background-color: #f5f5f5; }
          .completed { color: green; }
          .pending { color: orange; }
          .failed { color: red; }
          .amount { text-align: right; font-weight: bold; }
          .footer { margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>FlashGuard - Transaction Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Reference ID</th>
              <th>Description</th>
              <th>Type</th>
              <th class="amount">Amount (ZAR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(tx => `
              <tr>
                <td>${new Date(tx.created_at).toLocaleString()}</td>
                <td>TRX-${String(tx.id).padStart(4, '0')}-A1F</td>
                <td>${tx.transaction_type === 'service_purchase' ? `${(tx.service_type || 'service').toUpperCase()} Purchase` : 'Transfer Execution'}</td>
                <td>${tx.transaction_type === 'service_purchase' ? (tx.service_type || 'service') : 'Transfer'}</td>
                <td class="amount">${formatCurrency(tx.amount)}</td>
                <td><span class="${tx.status}">${tx.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Total Transactions: ${filtered.length}</p>
          <p>Print this page or save as PDF using your browser's print function (Ctrl+P or Cmd+P).</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    notify('PDF opened in print preview. Use Ctrl+P or Cmd+P to save as PDF.', 'success');
  };

  const filtered = transactions.filter(tx => {
    // Status filter
    if (filter !== 'all' && tx.status !== filter) return false;

    // Transaction category filter
    if (transactionType !== 'all') {
      const category = getTransactionCategory(tx);
      if (category !== transactionType) return false;
    }

    // Date range filter
    if (dateStart) {
      const txDate = new Date(tx.created_at).toISOString().slice(0, 10);
      if (txDate < dateStart) return false;
    }
    if (dateEnd) {
      const txDate = new Date(tx.created_at).toISOString().slice(0, 10);
      if (txDate > dateEnd) return false;
    }

    // Amount range filter
    const amount = Number(tx.amount) || 0;
    if (minAmount && amount < Number(minAmount)) return false;
    if (maxAmount && amount > Number(maxAmount)) return false;

    return true;
  });

  return (
    <PageWrapper
      title="Ledger & Reporting"
      subtitle="Comprehensive view of all account activities and historical data."
      session={session}
    >
      <div className="flex flex-col gap-stack-lg">
        <div className="flex justify-end gap-3 mb-2">
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md px-4 py-2 rounded hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button onClick={exportToPDF} className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md px-4 py-2 rounded hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
            
            <div className="flex flex-col gap-stack-xs min-w-0">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Date Range</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                <div className="min-w-0">
                  <input 
                    className="w-full min-w-0 bg-transparent border border-outline-variant rounded py-2 px-3 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all" 
                    type="date" 
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    placeholder="Start date"
                  />
                </div>
                <div className="min-w-0">
                  <input 
                    className="w-full min-w-0 bg-transparent border border-outline-variant rounded py-2 px-3 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all" 
                    type="date" 
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-stack-xs min-w-0">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Transaction Category</label>
              <div className="relative">
                <select 
                  className="w-full min-w-0 appearance-none bg-transparent border border-outline-variant rounded py-2 pl-3 pr-10 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="transfer">Transfer</option>
                  <option value="airtime">Airtime</option>
                  <option value="data">Data</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-stack-xs min-w-0">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Status</label>
              <div className="relative">
                <select 
                  className="w-full min-w-0 appearance-none bg-transparent border border-outline-variant rounded py-2 pl-3 pr-10 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-stack-xs min-w-0">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Amount Range (ZAR)</label>
              <div className="flex items-center gap-2 min-w-0">
                <input 
                  className="w-full min-w-0 bg-transparent border border-outline-variant rounded py-2 px-3 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all" 
                  placeholder="Min" 
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
                <span className="text-on-surface-variant">-</span>
                <input 
                  className="w-full min-w-0 bg-transparent border border-outline-variant rounded py-2 px-3 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all" 
                  placeholder="Max" 
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button 
              className="text-secondary font-label-md text-label-md px-4 py-2 rounded hover:bg-secondary-container/10 transition-colors"
              onClick={() => {
                setFilter('all');
                setDateStart('');
                setDateEnd('');
                setTransactionType('all');
                setMinAmount('');
                setMaxAmount('');
              }}
            >
              Clear Filters
            </button>
            <button
              type="button"
              className="bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded hover:opacity-90 transition-opacity shadow-sm"
              onClick={() => notify('Filters applied.', 'success')}
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low h-12">
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium">Date</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium">Reference ID</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium">Description</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium">Type</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium text-right">Amount (ZAR)</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium text-center">Status</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-variant">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-on-surface-variant">Loading transactions...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-on-surface-variant">No transactions found</td>
                  </tr>
                ) : (
                  filtered.map((tx, idx) => {
                    const isCompleted = tx.status === 'completed';
                    const isPending = tx.status === 'pending';
                    const isFailed = tx.status === 'rejected' || tx.status === 'failed';
                    
                    let statusBgClass = 'bg-primary-fixed-dim text-on-primary-fixed';
                    let statusDotClass = 'bg-primary-container';
                    if (isPending) {
                      statusBgClass = 'bg-secondary-fixed-dim text-on-secondary-fixed';
                      statusDotClass = 'bg-secondary';
                    } else if (isFailed) {
                      statusBgClass = 'bg-error-container text-on-error-container';
                      statusDotClass = 'bg-error';
                    }

                    return (
                      <tr key={tx.id || idx} className={`h-[52px] transition-colors ${isFailed ? 'bg-error-container/5 hover:bg-error-container/10' : 'hover:bg-surface-container-low/50'}`}>
                        <td className="px-6 py-2 whitespace-nowrap">{new Date(tx.created_at).toLocaleString()}</td>
                        <td className="px-6 py-2 whitespace-nowrap font-mono text-xs text-on-surface-variant">TRX-{String(tx.id).padStart(4, '0')}-A1F</td>
                        <td className="px-6 py-2">
                          <div className="font-medium text-on-surface">
                            {tx.transaction_type === 'service_purchase'
                              ? `${(tx.service_type || 'service').toUpperCase()} Purchase`
                              : 'Transfer Execution'}
                          </div>
                          <div className="text-xs text-on-surface-variant">
                            {tx.transaction_type === 'service_purchase'
                              ? `${tx.service_type ? tx.service_type.toUpperCase() : 'Service'} • ${tx.recipient_account_number || 'No number provided'}`
                              : `Acct ${tx.senderAccountId || tx.sender_account_id || 'N/A'} to ${tx.recipientAccountId || tx.recipient_account_id || 'N/A'}`}
                          </div>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          {tx.transaction_type === 'service_purchase' ? (tx.service_type || 'service') : 'Transfer'}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-right font-medium text-on-surface">
                           {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-[11px] uppercase tracking-wider ${statusBgClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`}></span> {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-right">
                          <button
                            type="button"
                            className="p-1 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors"
                            title="View Details"
                            onClick={() => notify('Detailed transaction view is not yet available.', 'info')}
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="border-t border-outline-variant bg-surface-container-lowest px-6 py-4 flex items-center justify-between">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Showing {filtered.length} entries</p>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded bg-primary-container text-on-primary-container font-label-sm flex items-center justify-center">1</button>
              <button className="p-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
