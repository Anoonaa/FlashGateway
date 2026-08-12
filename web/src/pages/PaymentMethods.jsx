import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/Header';
import { fetchJson } from '../utils';

export default function PaymentMethodsPage({ session, notify }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nickname: '', expiryDate: '' });
  const [addForm, setAddForm] = useState({ cardNumber: '', nickname: '', expiryDate: '', cvv: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const accountId = session?.user?.id || session?.accountId;
      const data = await fetchJson('/payment-methods', {
        method: 'GET',
        headers: { 'x-account-id': accountId }
      });
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      notify(err.message || 'Failed to load payment methods', 'danger');
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!addForm.cardNumber || !addForm.nickname || !addForm.expiryDate || !addForm.cvv) {
      notify('Please fill in all fields', 'warning');
      return;
    }

    try {
      const accountId = session?.user?.id || session?.accountId;
      await fetchJson('/payment-methods', {
        method: 'POST',
        headers: { 'x-account-id': accountId },
        body: JSON.stringify({
          cardNumber: addForm.cardNumber,
          nickname: addForm.nickname,
          expiryDate: addForm.expiryDate,
          cvv: addForm.cvv,
        }),
      });
      notify('Payment method added successfully', 'success');
      setAddForm({ cardNumber: '', nickname: '', expiryDate: '', cvv: '' });
      setShowAddForm(false);
      await loadPaymentMethods();
    } catch (err) {
      notify(err.message || 'Failed to add payment method', 'danger');
    }
  };

  const handleUpdatePaymentMethod = async (id) => {
    if (!editForm.nickname || !editForm.expiryDate) {
      notify('Please fill in all fields', 'warning');
      return;
    }

    try {
      const accountId = session?.user?.id || session?.accountId;
      await fetchJson(`/payment-methods/${id}`, {
        method: 'PUT',
        headers: { 'x-account-id': accountId },
        body: JSON.stringify({
          nickname: editForm.nickname,
          expiryDate: editForm.expiryDate,
        }),
      });
      notify('Payment method updated successfully', 'success');
      setEditingId(null);
      setEditForm({ nickname: '', expiryDate: '' });
      await loadPaymentMethods();
    } catch (err) {
      notify(err.message || 'Failed to update payment method', 'danger');
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const accountId = session?.user?.id || session?.accountId;
      await fetchJson(`/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { 'x-account-id': accountId }
      });
      notify('Payment method deleted successfully', 'success');
      await loadPaymentMethods();
    } catch (err) {
      notify(err.message || 'Failed to delete payment method', 'danger');
    }
  };

  const startEditing = (method) => {
    setEditingId(method.id);
    setEditForm({ nickname: method.nickname, expiryDate: method.expiryDate });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ nickname: '', expiryDate: '' });
  };

  return (
    <PageWrapper
      title="Payment Methods"
      subtitle="Manage your saved payment methods and card details."
      session={session}
    >
      <div className="flex flex-col gap-stack-lg">
        {/* Add Payment Method Button */}
        <div className="flex justify-end">
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded hover:opacity-90 transition-opacity shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Payment Method
            </button>
          )}
        </div>

        {/* Add Payment Method Form */}
        {showAddForm && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-4">
              Add New Payment Method
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <input
                type="text"
                placeholder="Card Number (16 digits)"
                value={addForm.cardNumber}
                onChange={(e) => setAddForm({ ...addForm, cardNumber: e.target.value })}
                className="w-full bg-transparent border border-outline-variant rounded py-2 px-3 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              />
              <input
                type="text"
                placeholder="Nickname (e.g., My Visa)"
                value={addForm.nickname}
                onChange={(e) => setAddForm({ ...addForm, nickname: e.target.value })}
                className="w-full bg-transparent border border-outline-variant rounded py-2 px-3 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              />
              <input
                type="text"
                placeholder="Expiry Date (MM/YY)"
                value={addForm.expiryDate}
                onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })}
                className="w-full bg-transparent border border-outline-variant rounded py-2 px-3 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              />
              <input
                type="password"
                placeholder="CVV"
                value={addForm.cvv}
                onChange={(e) => setAddForm({ ...addForm, cvv: e.target.value })}
                className="w-full bg-transparent border border-outline-variant rounded py-2 px-3 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm({ cardNumber: '', nickname: '', expiryDate: '', cvv: '' });
                }}
                className="text-secondary font-label-md text-label-md px-4 py-2 rounded hover:bg-secondary-container/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                className="bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded hover:opacity-90 transition-opacity shadow-sm"
              >
                Add Card
              </button>
            </div>
          </div>
        )}

        {/* Payment Methods Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low h-12">
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium">Nickname</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium">Card Number</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium">Expiry Date</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium text-center">Status</th>
                  <th className="font-label-sm text-label-sm text-on-surface-variant px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-variant">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                      Loading payment methods...
                    </td>
                  </tr>
                ) : paymentMethods.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                      No payment methods added yet
                    </td>
                  </tr>
                ) : (
                  paymentMethods.map((method) => (
                    <tr key={method.id} className="h-[52px] hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-2">
                        {editingId === method.id ? (
                          <input
                            type="text"
                            value={editForm.nickname}
                            onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                            className="bg-transparent border border-outline-variant rounded px-2 py-1 text-body-sm"
                          />
                        ) : (
                          <div className="font-medium">{method.nickname}</div>
                        )}
                      </td>
                      <td className="px-6 py-2 font-mono text-xs text-on-surface-variant">
                        •••• •••• •••• {method.cardNumber?.slice(-4) || 'N/A'}
                      </td>
                      <td className="px-6 py-2">
                        {editingId === method.id ? (
                          <input
                            type="text"
                            value={editForm.expiryDate}
                            onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                            placeholder="MM/YY"
                            className="bg-transparent border border-outline-variant rounded px-2 py-1 text-body-sm w-20"
                          />
                        ) : (
                          method.expiryDate
                        )}
                      </td>
                      <td className="px-6 py-2 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-[11px] uppercase tracking-wider bg-primary-fixed-dim text-on-primary-fixed">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-right flex justify-end gap-2">
                        {editingId === method.id ? (
                          <>
                            <button
                              onClick={() => handleUpdatePaymentMethod(method.id)}
                              className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                              title="Save"
                            >
                              <span className="material-symbols-outlined text-[20px]">check</span>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(method)}
                              className="p-1 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
