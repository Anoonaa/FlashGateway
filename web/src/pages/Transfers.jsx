/**
 * TRANSFERS PAGE
 * Money transfer interface with embedded forms for accounts, beneficiaries, and amounts
 */

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/Header';
import { fetchJson, formatCurrency } from '../utils';

export default function TransfersPage({ session, notify }) {
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [senderId, setSenderId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [beneficiaryMode, setBeneficiaryMode] = useState('account');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [oneOffName, setOneOffName] = useState('');
  const [oneOffBank, setOneOffBank] = useState('');
  const [oneOffAccountNumber, setOneOffAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [accountsData, beneficiariesData] = await Promise.all([
          fetchJson('/accounts'),
          fetchJson('/beneficiaries').catch(() => []),
        ]);

        if (isMounted) {
          setAccounts(accountsData || []);
          setBeneficiaries(Array.isArray(beneficiariesData) ? beneficiariesData : []);

          if (accountsData && accountsData.length > 0) {
            setSenderId(String(accountsData[0].id));
            if (accountsData.length > 1) {
              setRecipientId(String(accountsData[1].id));
            }
          }
        }
      } catch (err) {
        if (isMounted) notify(err.message, 'danger');
      }
    };

    load();
    return () => { isMounted = false; };
  }, [notify]);

  const sender = accounts.find((a) => String(a.id) === String(senderId));
  const recipient = accounts.find((a) => String(a.id) === String(recipientId));
  const recipients = accounts.filter((a) => String(a.id) !== String(senderId));
  const selectedBeneficiary = beneficiaries.find((b) => String(b.id) === String(beneficiaryId));

  const hasValidBeneficiary = beneficiaryMode === 'account'
    ? Boolean(recipientId)
    : beneficiaryMode === 'saved'
      ? Boolean(beneficiaryId && selectedBeneficiary)
      : Boolean(oneOffName && oneOffAccountNumber);

  const selectedRecipientName = beneficiaryMode === 'account'
    ? recipient?.full_name || recipient?.email
    : beneficiaryMode === 'saved'
      ? selectedBeneficiary?.beneficiary_name
      : oneOffName;

  const selectedRecipientDetails = beneficiaryMode === 'account'
    ? recipient
      ? `PrimeFin • **** ${recipient.id}`
      : ''
    : beneficiaryMode === 'saved'
      ? selectedBeneficiary
        ? `${selectedBeneficiary.bank || 'Bank not specified'} • **** ${String(selectedBeneficiary.account_number || '').slice(-4)}`
        : ''
      : oneOffAccountNumber
        ? `${oneOffBank || 'External Bank'} • ${oneOffAccountNumber}`
        : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!senderId) {
      notify('Select a sender account before continuing.', 'danger');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      notify('Enter a valid transfer amount.', 'danger');
      return;
    }

    if (!hasValidBeneficiary) {
      notify('Choose or add a beneficiary before submitting.', 'danger');
      return;
    }

    setLoading(true);

    try {
      const basePayload = {
        senderAccountId: Number(senderId),
        amount: Number(amount),
        reference,
      };

      const payload = {
        ...basePayload,
        ...(beneficiaryMode === 'account'
          ? { recipientAccountId: Number(recipientId) }
          : beneficiaryMode === 'saved' && selectedBeneficiary
          ? {
              recipientName: selectedBeneficiary.beneficiary_name,
              recipientAccountNumber: selectedBeneficiary.account_number,
              recipientBank: selectedBeneficiary.bank,
            }
          : {
              recipientName: oneOffName,
              recipientAccountNumber: oneOffAccountNumber,
              recipientBank: oneOffBank,
            }),
      };

      const result = await fetchJson('/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      notify(`Transfer #${result.id} created successfully!`, 'success');
      setAmount('');
      setReference('');
      setOneOffName('');
      setOneOffBank('');
      setOneOffAccountNumber('');
      setBeneficiaryId('');
    } catch (err) {
      notify(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Transfer Funds"
      subtitle="Securely move money between accounts or to external beneficiaries."
      session={session}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
        {/* LEFT COLUMN: TRANSFER FORM */}
        <div className="xl:col-span-8 flex flex-col gap-stack-lg">
          
          {/* Section 1: From Account */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-stack-md">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-label-md text-label-md">1</div>
              <h3 className="font-headline-md text-headline-md text-primary">From Account</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-sm">
              {accounts.map(account => {
                const isSelected = String(senderId) === String(account.id);
                return (
                  <label key={`from-${account.id}`} className="cursor-pointer relative">
                    <input 
                      className="peer sr-only" 
                      name="from_account" 
                      type="radio" 
                      checked={isSelected}
                      onChange={() => setSenderId(String(account.id))}
                    />
                    <div className={`p-4 border rounded-xl flex flex-col gap-1 transition-all ${
                      isSelected 
                        ? 'border-2 border-secondary bg-surface ring-4 ring-secondary/10' 
                        : 'border border-outline-variant bg-surface-container-lowest hover:border-outline peer-focus-visible:ring-2 peer-focus-visible:ring-secondary-container'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-label-md text-label-md text-on-surface-variant">{account.full_name || 'Account'}</span>
                        {isSelected && <span className="material-symbols-outlined text-secondary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>}
                      </div>
                      <span className="font-body-lg text-body-lg text-primary font-medium">{formatCurrency(account.balance)}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">**** {account.id}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Section 2: To Beneficiary */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-stack-md">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-label-md text-label-md">2</div>
              <h3 className="font-headline-md text-headline-md text-primary">To Beneficiary</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-stack-md">
              {['account', 'saved', 'one-off'].map((mode) => {
                const labels = {
                  account: 'Internal account',
                  saved: 'Saved beneficiary',
                  'one-off': 'One-off beneficiary',
                };
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setBeneficiaryMode(mode);
                      setRecipientId('');
                      setBeneficiaryId('');
                      setOneOffName('');
                      setOneOffBank('');
                      setOneOffAccountNumber('');
                    }}
                    className={`py-3 px-4 rounded-xl border text-left transition-all ${
                      beneficiaryMode === mode
                        ? 'border-secondary bg-secondary/10 text-primary'
                        : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-secondary'
                    }`}
                  >
                    <span className="font-label-sm text-label-sm uppercase tracking-[0.08em] text-on-surface-variant">{labels[mode]}</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{mode === 'account' ? 'Use a linked account' : mode === 'saved' ? 'Choose a saved beneficiary' : 'Enter one-off details'}</p>
                  </button>
                );
              })}
            </div>

            {beneficiaryMode === 'account' && (
              <div className="flex flex-col gap-2">
                {recipients.map((account, idx) => {
                  const isSelected = String(recipientId) === String(account.id);
                  const bgClasses = ['bg-secondary-fixed text-on-secondary-fixed', 'bg-tertiary-fixed text-on-tertiary-fixed', 'bg-primary-fixed text-on-primary-fixed'];
                  const bgClass = bgClasses[idx % bgClasses.length];

                  return (
                    <div
                      key={`to-${account.id}`}
                      onClick={() => setRecipientId(String(account.id))}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-colors group ${
                        isSelected ? 'bg-secondary/5 border-secondary' : 'hover:bg-surface-container-low border-transparent hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-md text-headline-md ${bgClass}`}>
                          {account.full_name ? account.full_name.substring(0, 2).toUpperCase() : 'BN'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-primary">{account.full_name || account.email}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">Internal • **** {account.id}</span>
                        </div>
                      </div>
                      <button type="button" className={`font-label-md text-label-md px-3 py-1 rounded-md transition-opacity ${isSelected ? 'bg-secondary text-on-secondary opacity-100' : 'text-secondary opacity-0 group-hover:opacity-100 bg-secondary-fixed-dim/20'}`}>
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {beneficiaryMode === 'saved' && (
              <div className="flex flex-col gap-2">
                {beneficiaries.length > 0 ? (
                  beneficiaries.map((beneficiary) => {
                    const isSelected = String(beneficiaryId) === String(beneficiary.id);
                    return (
                      <button
                        key={`beneficiary-${beneficiary.id}`}
                        type="button"
                        onClick={() => setBeneficiaryId(String(beneficiary.id))}
                        className={`text-left p-4 rounded-xl border w-full transition-all ${
                          isSelected ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest hover:border-secondary'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-label-md text-label-md text-primary">{beneficiary.beneficiary_name}</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">{beneficiary.bank || 'Bank not specified'}</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">•••• {beneficiary.account_number.slice(-4)}</p>
                          </div>
                          <span className={`font-label-md text-label-md ${isSelected ? 'text-secondary' : 'text-on-surface-variant'}`}>
                            {isSelected ? 'Selected' : 'Choose'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-on-surface-variant">No saved beneficiaries available.</p>
                )}
              </div>
            )}

            {beneficiaryMode === 'one-off' && (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Beneficiary Name</span>
                    <input
                      className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                      type="text"
                      value={oneOffName}
                      onChange={(e) => setOneOffName(e.target.value)}
                      placeholder="e.g. Acme Supplies"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Bank</span>
                    <input
                      className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                      type="text"
                      value={oneOffBank}
                      onChange={(e) => setOneOffBank(e.target.value)}
                      placeholder="e.g. Standard Bank"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Account Number</span>
                  <input
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                    type="text"
                    value={oneOffAccountNumber}
                    onChange={(e) => setOneOffAccountNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                  />
                </label>
              </div>
            )}
          </section>

          {/* Section 3: Transfer Details */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-stack-md">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-label-md text-label-md">3</div>
              <h3 className="font-headline-md text-headline-md text-primary">Transfer Details</h3>
            </div>
            
            <div className="flex flex-col gap-stack-lg">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Amount</label>
                <div className="relative flex items-center border-b-2 border-outline-variant focus-within:border-secondary focus-within:shadow-[0_4px_12px_-4px_rgba(0,88,190,0.2)] pb-2 transition-all">
                  <span className="font-display-lg text-display-lg text-primary mr-2">ZAR</span>
                  <input 
                    className="w-full bg-transparent border-none outline-none font-display-lg text-display-lg text-primary p-0 focus:ring-0 placeholder-outline-variant" 
                    placeholder="0.00" 
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Available: {sender ? formatCurrency(sender.balance) : 'ZAR 0.00'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">My Reference (Optional)</label>
                <input 
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all" 
                  placeholder="e.g. Invoice INV-2024-001" 
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Transfer Date</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input defaultChecked className="peer sr-only" name="date" type="radio"/>
                    <div className="py-3 px-4 text-center border border-outline-variant rounded-lg peer-checked:bg-secondary-fixed peer-checked:border-secondary peer-checked:text-on-secondary-fixed font-label-md text-label-md transition-all">
                        Today (Immediate)
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input className="peer sr-only" name="date" type="radio"/>
                    <div className="py-3 px-4 text-center border border-outline-variant rounded-lg peer-checked:bg-secondary-fixed peer-checked:border-secondary peer-checked:text-on-secondary-fixed font-label-md text-label-md transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span> Schedule
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: REVIEW & CONFIRMATION PANEL */}
        <div className="xl:col-span-4 sticky top-[120px]">
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.1),0px_2px_4px_-2px_rgba(15,23,42,0.05)] flex flex-col gap-stack-lg">
            <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
              <span className="material-symbols-outlined text-primary text-[28px]">receipt_long</span>
              <h3 className="font-headline-md text-headline-md text-primary">Review Transaction</h3>
            </div>
            
            <div className="flex flex-col gap-stack-sm">
              <div className="flex justify-between items-start py-2 border-b border-outline-variant/50">
                <span className="font-body-md text-body-md text-on-surface-variant w-1/3">From</span>
                <div className="flex flex-col text-right w-2/3">
                  <span className="font-label-md text-label-md text-primary">{sender ? sender.full_name : 'Select Account'}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{sender ? `**** ${sender.id}` : ''}</span>
                </div>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-outline-variant/50">
                <span className="font-body-md text-body-md text-on-surface-variant w-1/3">To</span>
                <div className="flex flex-col text-right w-2/3 text-on-surface-variant">
                  {recipient ? (
                    <>
                      <span className="font-label-md text-label-md text-primary">{recipient.full_name || recipient.email}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">PrimeFin • **** {recipient.id}</span>
                    </>
                  ) : (
                    <span className="italic font-body-sm text-body-sm">Pending Selection</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                <span className="font-body-md text-body-md text-on-surface-variant">Date</span>
                <span className="font-label-md text-label-md text-primary">Today</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                <span className="font-body-md text-body-md text-on-surface-variant">Est. Fee</span>
                <span className="font-label-md text-label-md text-primary">ZAR 0.00</span>
              </div>
            </div>
            
            <div className="bg-surface-container-highest p-4 rounded-lg flex flex-col items-center justify-center gap-1 border border-outline-variant/50">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Total Amount</span>
              <span className={`font-headline-lg text-headline-lg ${amount ? 'text-primary' : 'text-primary opacity-50'}`}>
                {amount ? formatCurrency(amount) : 'ZAR 0.00'}
              </span>
            </div>
            
            <div className="mt-auto pt-4">
              <button 
                type="submit"
                disabled={loading || !senderId || !hasValidBeneficiary || !amount}
                className={`w-full py-4 rounded-lg font-label-md text-label-md transition-all shadow-md flex justify-center items-center gap-2 ${
                  loading || !senderId || !hasValidBeneficiary || !amount
                    ? 'bg-secondary text-on-secondary opacity-60 cursor-not-allowed'
                    : 'bg-secondary text-on-secondary hover:bg-secondary-container'
                }`}
              >
                <span className="material-symbols-outlined">{loading ? 'hourglass_empty' : 'lock'}</span>
                {loading ? 'Processing...' : 'Confirm & Transfer'}
              </button>
              {(!senderId || !recipientId || !amount) && (
                <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-3">
                  Please complete all required fields.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-6 text-on-surface-variant opacity-70">
            <span className="flex items-center gap-1 font-label-sm text-label-sm"><span className="material-symbols-outlined text-[16px]">verified</span> Encrypted</span>
            <span className="flex items-center gap-1 font-label-sm text-label-sm"><span className="material-symbols-outlined text-[16px]">gavel</span> Regulated</span>
          </div>
        </div>
      </form>
    </PageWrapper>
  );
}
