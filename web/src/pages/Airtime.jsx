import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/common';
import { PageWrapper } from '../components/layout/Header';
import { fetchJson, formatCurrency } from '../utils';

const NETWORKS = [
  { id: 'Vodacom', initial: 'V' },
  { id: 'MTN', initial: 'M' },
  { id: 'Cell C', initial: 'C' },
  { id: 'Telkom', initial: 'T' }
];

const AMOUNTS = [20, 50, 100, 200, 500];

const RECENT_RECHARGES = [
  { id: 1, initial: 'V', name: "Wife's Mobile", detail: '+27 82 123 4567 • Vodacom', amount: 'R 200', when: '2 days ago' },
  { id: 2, initial: 'M', name: 'My iPad Data', detail: '+27 83 987 6543 • MTN', amount: '3GB Data', when: '1 week ago' },
  { id: 3, initial: 'T', name: 'Home Router', detail: '+27 61 555 0000 • Telkom', amount: 'R 500', when: 'Last month' }
];

export default function AirtimePage({ session, notify }) {
  const [network, setNetwork] = useState('Vodacom');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('100');
  const [serviceType, setServiceType] = useState('airtime');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const numericAmount = useMemo(() => Number(amount) || 0, [amount]);
  const serviceLabel = serviceType === 'data' ? 'Data bundle' : serviceType === 'sms' ? 'SMS bundle' : 'Airtime top-up';
  const activeNetwork = NETWORKS.find((net) => net.id === network)?.id || network;

  useEffect(() => {
    let isMounted = true;

    const loadAccount = async () => {
      try {
        const accounts = await fetchJson('/accounts');
        if (isMounted && Array.isArray(accounts) && accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        if (isMounted) notify(err.message, 'danger');
      } finally {
        if (isMounted) setBalanceLoading(false);
      }
    };

    loadAccount();
    return () => {
      isMounted = false;
    };
  }, [notify]);

  const handleConfirmPayment = async () => {
    const accountId = Number(session?.user?.id || session?.accountId || 0);
    if (!accountId) {
      notify('Unable to identify the signed-in account. Please sign in again.', 'danger');
      return;
    }

    try {
      await fetchJson('/transactions/service-purchase', {
        method: 'POST',
        body: JSON.stringify({
          senderAccountId: accountId,
          serviceType,
          network: activeNetwork,
          phoneNumber: phone,
          amount: numericAmount,
        }),
      });
      setReviewOpen(false);
      notify(`${serviceLabel} for ${activeNetwork} was submitted successfully.`, 'success');
    } catch (error) {
      notify(error.message, 'danger');
    }
  };

  return (
    <PageWrapper
      title="Airtime & Data"
      subtitle="Instantly recharge prepaid accounts across all major South African networks."
      session={session}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
        {/* Main Flow: 3-Step Recharge */}
        <div className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 flex-1">
            {/* Step 1: Select Network */}
            <section className="mb-stack-xl">
              <div className="flex items-center gap-3 mb-stack-md">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">1</div>
                <h3 className="font-headline-md text-headline-md text-primary">Select Network</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {NETWORKS.map((net) => {
                  const isActive = net.id === network;
                  return (
                    <button
                      key={net.id}
                      onClick={() => setNetwork(net.id)}
                      className={`relative bg-surface rounded-lg p-4 flex flex-col items-center justify-center gap-3 transition-all ${
                        isActive
                          ? 'border-2 border-secondary ring-2 ring-secondary/20 shadow-sm'
                          : 'border border-outline-variant hover:border-outline hover:bg-surface-container-low'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2 text-secondary">
                          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1", fontSize: '20px'}}>check_circle</span>
                        </div>
                      )}
                      <div className="w-12 h-12 rounded-full bg-white border border-outline-variant shadow-sm flex items-center justify-center text-primary font-bold text-lg">
                        {net.initial}
                      </div>
                      <span className={`font-label-md text-label-md ${isActive ? 'text-primary' : 'text-on-surface'}`}>{net.id}</span>
                    </button>
                  );
                })}
              </div>
            </section>
            <hr className="border-outline-variant mb-stack-xl" />

            {/* Step 2: Recipient Details */}
            <section className="mb-stack-xl">
              <div className="flex items-center gap-3 mb-stack-md">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">2</div>
                <h3 className="font-headline-md text-headline-md text-primary">Recipient Details</h3>
              </div>
              <div className="max-w-md">
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Mobile Number</label>
                <div className="relative flex items-center border border-outline-variant rounded-lg bg-surface focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary-fixed-dim transition-all shadow-sm">
                  <div className="pl-4 pr-3 py-3 border-r border-outline-variant bg-surface-container-low rounded-l-lg text-on-surface font-body-md text-body-md">
                    +27
                  </div>
                  <input
                    className="flex-1 bg-transparent border-none py-3 px-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-0 outline-none"
                    placeholder="00 000 0000"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <button
                    type="button"
                    className="pr-4 text-secondary hover:text-secondary-container transition-colors"
                    title="Select from Contacts"
                    onClick={() => notify('Contact integration is coming soon.', 'info')}
                  >
                    <span className="material-symbols-outlined">contacts</span>
                  </button>
                </div>
              </div>
            </section>
            <hr className="border-outline-variant mb-stack-xl" />

            {/* Step 3: Choose Amount */}
            <section>
              <div className="flex items-center gap-3 mb-stack-md">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">3</div>
                <h3 className="font-headline-md text-headline-md text-primary">Select Recharge</h3>
              </div>
              <div className="flex border-b border-outline-variant mb-stack-md">
                <button
                  type="button"
                  onClick={() => setServiceType('airtime')}
                  className={`px-6 py-3 font-label-md text-label-md border-b-2 font-bold transition-colors ${
                    serviceType === 'airtime'
                      ? 'text-secondary border-secondary'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`}
                >
                  Airtime
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('data')}
                  className={`px-6 py-3 font-label-md text-label-md border-b-2 font-bold transition-colors ${
                    serviceType === 'data'
                      ? 'text-secondary border-secondary'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`}
                >
                  Data Bundles
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('sms')}
                  className={`px-6 py-3 font-label-md text-label-md border-b-2 font-bold transition-colors ${
                    serviceType === 'sms'
                      ? 'text-secondary border-secondary'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`}
                >
                  SMS Bundles
                </button>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-stack-md">
                {AMOUNTS.map((val) => {
                  const isActive = String(val) === String(amount);
                  return (
                    <button
                      key={val}
                      onClick={() => setAmount(String(val))}
                      className={`py-3 px-2 rounded-lg font-body-md text-body-md transition-colors relative overflow-hidden ${
                        isActive
                          ? 'border-2 border-secondary bg-surface-bright text-primary font-bold shadow-sm'
                          : 'border border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      R {val}
                      {isActive && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-secondary/10 rounded-bl-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="max-w-xs mt-stack-sm">
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Or enter custom amount</label>
                <div className="relative flex items-center border border-outline-variant rounded-lg bg-surface focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary-fixed-dim transition-all shadow-sm">
                  <div className="pl-4 py-3 text-on-surface-variant font-body-md text-body-md">R</div>
                  <input
                    className="flex-1 bg-transparent border-none py-3 px-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-0 outline-none"
                    placeholder="0.00"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Action Footer */}
          <div className="bg-surface-container-low p-6 md:px-8 border-t border-outline-variant flex justify-end items-center gap-4">
            <div className="text-right mr-auto hidden sm:block">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Total Due</p>
              <p className="font-headline-md text-headline-md text-primary">{formatCurrency(numericAmount)}</p>
            </div>
            <button
              type="button"
              className="px-6 py-3 border border-outline text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors"
              onClick={() => {
                setNetwork('Vodacom');
                setPhone('');
                setAmount('100');
                setServiceType('airtime');
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              disabled={!phone || numericAmount <= 0}
              className="px-8 py-3 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg shadow-sm hover:bg-secondary-container transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Review Payment
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Secondary Content: Recent Recharges */}
        <div className="xl:col-span-4 flex flex-col gap-gutter">
          <div className="bg-tertiary-container text-on-tertiary rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed-dim">account_balance_wallet</span>
                <h3 className="font-label-md text-label-md text-on-tertiary-fixed-dim uppercase tracking-wider">Available Balance</h3>
              </div>
            </div>
            <p className="font-display-lg text-display-lg text-on-tertiary font-bold mb-1">
              {balanceLoading ? 'Loading…' : formatCurrency(account?.balance)}
            </p>
            <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant">{account ? `${account.full_name} •••• ${String(account.id).padStart(4, '0')}` : 'Primary account'}</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex-1">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="font-headline-md text-headline-md text-primary" style={{ fontSize: '18px' }}>Recent Recharges</h3>
              <button
                type="button"
                className="text-secondary font-label-sm text-label-sm hover:underline"
                onClick={() => notify('Viewing all recent recharges.', 'info')}
              >
                View All
              </button>
            </div>
            <div className="flex flex-col">
              {RECENT_RECHARGES.map((item, idx) => (
                <div key={item.id} className="p-4 border-b border-outline-variant hover:bg-surface-container-low transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {item.initial}
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-primary">{item.name}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{item.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-label-md text-label-md text-primary">{item.amount}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{item.when}</p>
                    </div>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:bg-secondary-fixed-dim/20 transition-colors"
                      title="Repeat Recharge"
                      onClick={() => notify(`Repeating recharge for ${item.name}.`, 'info')}
                    >
                      <span className="material-symbols-outlined text-[20px]">replay</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review Payment"
        size="md"
        footer={(
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setReviewOpen(false)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirmPayment}>
              Confirm Payment
            </button>
          </>
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Service</p>
              <p className="font-label-md text-label-md text-primary">{serviceLabel}</p>
            </div>
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Network</p>
              <p className="font-label-md text-label-md text-primary">{activeNetwork}</p>
            </div>
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Recipient</p>
              <p className="font-label-md text-label-md text-primary">+27 {phone || '000 000 000'}</p>
            </div>
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Amount</p>
              <p className="font-label-md text-label-md text-primary">{formatCurrency(numericAmount)}</p>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant">
            This closes the gap where Review Payment was a dead button and gives students a clear confirmation step before the demo purchase is submitted.
          </p>
        </div>
      </Modal>
    </PageWrapper>
  );
}
