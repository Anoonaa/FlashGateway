/**
 * DASHBOARD PAGE
 * Portfolio overview with KPIs, accounts, recent transactions
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/Header";
import { fetchJson, formatCurrency, getStatusTone } from "../utils";

export default function DashboardPage({ session, notify }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [accountsData, txData, pendingData] = await Promise.all([
          fetchJson("/accounts"),
          fetchJson("/transactions/history"),
          fetchJson("/transactions/pending"),
        ]);

        if (isMounted) {
          setAccounts(accountsData || []);
          setTransactions(txData || []);
          setPending(pendingData || []);
        }
      } catch (err) {
        if (isMounted) {
          notify(err.message, "danger");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [notify]);

  const netWorth = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0,
  );

  return (
    <PageWrapper
      title="Portfolio Overview"
      subtitle={`Welcome back, ${session?.user?.full_name?.split(" ")[0] || "User"}. Here is your summary for today.`}
      session={session}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Row 1: Balances & Quick Actions */}
        {/* Total Net Worth Card */}
        <div className="md:col-span-6 lg:col-span-5 bg-tertiary-container text-on-tertiary rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-on-tertiary-fixed-variant uppercase tracking-wider">
                Total Net Worth
              </span>
              <span className="material-symbols-outlined text-secondary-fixed-dim">
                account_balance_wallet
              </span>
            </div>
            <h3 className="font-display-lg text-display-lg mt-2">
              {loading ? "..." : formatCurrency(netWorth).split(".")[0]}
              <span className="text-headline-md text-on-tertiary-fixed-variant">
                .
                {loading
                  ? "00"
                  : formatCurrency(netWorth).split(".")[1] || "00"}
              </span>
            </h3>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-secondary-fixed flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                trending_up
              </span>
              +2.4% this month
            </span>
            <button
              type="button"
              className="font-label-md text-label-md text-on-tertiary hover:text-secondary-fixed transition-colors underline decoration-secondary-fixed/30 underline-offset-4"
              onClick={() => notify('Detailed analysis is not available in this preview.', 'info')}
            >
              View Analysis
            </button>
          </div>
        </div>

        {/* Individual Accounts */}
        <div className="md:col-span-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
          {accounts.slice(0, 2).map((account, idx) => (
            <div
              key={account.id || idx}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">
                      {idx === 0 ? "credit_card" : "savings"}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-body-lg font-semibold text-on-surface">
                      {account.full_name ||
                        (idx === 0 ? "Current Account" : "Savings Account")}
                    </h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      **** {Math.floor(1000 + Math.random() * 9000)}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-headline-lg text-headline-lg text-on-surface mt-2">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          ))}
          {accounts.length === 0 && !loading && (
            <div className="sm:col-span-2 text-center p-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm text-on-surface-variant">
              No accounts found.
            </div>
          )}
        </div>

        {/* Row 2: Quick Actions (3 Cards) */}
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-gutter mt-4">
          <Link
            to="/airtime"
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-secondary hover:shadow-md transition-all group flex items-center gap-4 text-left"
            style={{ textDecoration: "none" }}
          >
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
              <span className="material-symbols-outlined text-[28px]">
                phone_iphone
              </span>
            </div>
            <div>
              <h4 className="font-headline-md text-body-lg font-semibold text-on-surface group-hover:text-secondary transition-colors">
                Buy Airtime
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Instant top-up
              </p>
            </div>
          </Link>
          <Link
            to="/transfers"
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-secondary hover:shadow-md transition-all group flex items-center gap-4 text-left"
            style={{ textDecoration: "none" }}
          >
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
              <span className="material-symbols-outlined text-[28px]">
                send_money
              </span>
            </div>
            <div>
              <h4 className="font-headline-md text-body-lg font-semibold text-on-surface group-hover:text-secondary transition-colors">
                Send Money
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Local &amp; Int'l
              </p>
            </div>
          </Link>
          <Link
            to="/transfers"
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-secondary hover:shadow-md transition-all group flex items-center gap-4 text-left"
            style={{ textDecoration: "none" }}
          >
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
              <span className="material-symbols-outlined text-[28px]">
                receipt_long
              </span>
            </div>
            <div>
              <h4 className="font-headline-md text-body-lg font-semibold text-on-surface group-hover:text-secondary transition-colors">
                Pay Bills
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Manage beneficiaries
              </p>
            </div>
          </Link>
        </div>

        {/* Row 3: Transactions & Chart */}
        {/* Recent Transactions */}
        <div className="md:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden mt-4">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Recent Transactions
            </h3>
            <Link
              to="/history"
              className="font-label-md text-label-md text-secondary hover:text-secondary-container transition-colors"
              style={{ textDecoration: "none" }}
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-outline-variant">
            {transactions.length > 0 ? (
              transactions.slice(0, 4).map((tx, i) => {
                // Determine icon and colors based on status/type conceptually
                const isCredit = tx.status === "completed"; // simplified
                const icon = isCredit ? "arrow_downward" : "shopping_cart";
                const iconBgClass = isCredit
                  ? "bg-secondary-fixed text-on-secondary-fixed"
                  : "bg-error-container text-on-error-container";
                const amountClass = isCredit
                  ? "text-secondary"
                  : "text-on-surface";
                const amountSign = isCredit ? "+" : "-";

                return (
                  <div
                    key={tx.id || i}
                    className="p-4 px-6 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClass}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {icon}
                        </span>
                      </div>
                      <div>
                        <p className="font-body-md text-body-md font-semibold text-on-surface">
                          Transfer #{tx.id}
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {new Date(tx.created_at).toLocaleDateString()} •{" "}
                          {tx.status}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-body-md text-body-md font-semibold ${amountClass}`}
                    >
                      {amountSign} {formatCurrency(tx.amount)}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-on-surface-variant font-body-sm">
                No recent transactions found.
              </div>
            )}
          </div>
        </div>

        {/* Spending Summary Chart (Visual Placeholder) */}
        <div className="md:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 flex flex-col mt-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Spending Summary
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                This Month
              </p>
            </div>
            <div className="px-3 py-1 bg-surface-container rounded-md border border-outline-variant flex items-center gap-1 cursor-pointer hover:bg-surface-variant transition-colors">
              <span className="font-label-sm text-label-sm">This Month</span>
              <span className="material-symbols-outlined text-[16px]">
                expand_more
              </span>
            </div>
          </div>
          {/* Abstract Bar Chart Layout */}
          <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-auto pt-8 border-b border-outline-variant pb-2 relative">
            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-on-surface-variant font-label-sm text-[10px] -ml-2">
              <span>40k</span>
              <span>20k</span>
              <span>0</span>
            </div>
            {/* Bars */}
            <div className="w-full flex justify-around items-end h-full ml-6">
              <div className="w-8 md:w-12 bg-surface-variant rounded-t-sm h-[30%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  R12k
                </div>
              </div>
              <div className="w-8 md:w-12 bg-surface-variant rounded-t-sm h-[50%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  R20k
                </div>
              </div>
              <div className="w-8 md:w-12 bg-secondary rounded-t-sm h-[85%] relative group shadow-[0_0_10px_rgba(33,112,228,0.3)]">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  R34k
                </div>
              </div>
              <div className="w-8 md:w-12 bg-surface-variant rounded-t-sm h-[40%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  R16k
                </div>
              </div>
            </div>
          </div>
          {/* X Axis Labels */}
          <div className="flex justify-around items-center mt-3 ml-6">
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              Wk 1
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              Wk 2
            </span>
            <span className="font-label-sm text-[11px] text-primary font-bold">
              Wk 3
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              Wk 4
            </span>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
