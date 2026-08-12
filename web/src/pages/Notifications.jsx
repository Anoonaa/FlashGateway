/**
 * NOTIFICATIONS PAGE
 * Security events, pending approvals, and promotional content
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { Card, CardHeader, Grid, Badge } from '../components/common';
import { fetchJson } from '../utils';

export default function NotificationsPage({ session, notify }) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleMarkAllAsRead = () => {
    setAlerts([]);
    setPending([]);
    notify('All notifications marked as read.', 'success');
  };

  const handleSettings = () => navigate('/support');

  const handleViewPending = (tx) => {
    notify(`Pending transfer #${tx.id} is awaiting approval.`, 'info');
  };

  const handleViewAlert = (alert) => {
    notify(`Opened transaction alert #${alert.id}.`, 'info');
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [alertsData, pendingData] = await Promise.all([
          fetchJson('/alerts').catch(() => []),
          fetchJson('/transactions/pending')
        ]);

        if (isMounted) {
          setAlerts(Array.isArray(alertsData) ? alertsData : []);
          setPending(Array.isArray(pendingData) ? pendingData : []);
        }
      } catch (err) {
        if (isMounted) notify(err.message, 'danger');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [notify]);

  const actions = (
    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={handleMarkAllAsRead}>
        Mark All as Read
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={handleSettings}>
        Settings
      </button>
    </div>
  );

  const aside = (
    <Card>
      <CardHeader title="Live Signals" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div>
          <small>Pending Approvals</small>
          <strong style={{ fontSize: '24px' }}>{pending.length}</strong>
        </div>
        <div>
          <small>Alerts</small>
          <strong style={{ fontSize: '24px' }}>{alerts.length}</strong>
        </div>
      </div>
    </Card>
  );

  return (
    <PageWrapper
      title="Notifications"
      subtitle="Security events, pending approvals, and updates in one place."
      session={session}
      actions={actions}
      aside={aside}
    >
      <Grid columns={2} gap="lg">
        {/* Security Notifications */}
        <Card>
          <CardHeader title="Security" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg)' }}>
            {pending.length > 0 ? (
              pending.slice(0, 3).map((tx) => (
                <button
                  type="button"
                  key={tx.id}
                  onClick={() => handleViewPending(tx)}
                  className="w-full text-left flex items-start gap-4"
                  style={{ color: 'inherit', background: 'transparent', border: 'none', padding: 0 }}
                >
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-warning)' }}>
                    lock
                  </span>
                  <div>
                    <strong>Pending Transfer #{tx.id}</strong>
                    <p style={{ margin: '0', fontSize: 'var(--font-body-sm-size)', color: 'var(--color-text-secondary)' }}>
                      Awaiting approval
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>No pending approvals</p>
            )}
          </div>
        </Card>

        {/* Transaction Alerts */}
        <Card>
          <CardHeader title="Transactions" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg)' }}>
            {alerts.length > 0 ? (
              alerts.slice(0, 3).map((alert) => (
                <button
                  type="button"
                  key={alert.id}
                  onClick={() => handleViewAlert(alert)}
                  className="w-full text-left flex items-start gap-4"
                  style={{ color: 'inherit', background: 'transparent', border: 'none', padding: 0 }}
                >
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-success)' }}>
                    check_circle
                  </span>
                  <div>
                    <strong>Transaction #{alert.id}</strong>
                    <p style={{ margin: '0', fontSize: 'var(--font-body-sm-size)', color: 'var(--color-text-secondary)' }}>
                      Completed successfully
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>No recent transactions</p>
            )}
          </div>
        </Card>

        {/* Promotions */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <CardHeader title="Featured" />
          <Grid columns={2} gap="md" style={{ padding: 'var(--spacing-lg)' }}>
            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h4 style={{ margin: '0 0 var(--spacing-sm)' }}>Cashback Weekend</h4>
              <p style={{ margin: '0', fontSize: 'var(--font-body-sm-size)', color: 'var(--color-text-secondary)' }}>
                Get 5% back on grocery purchases
              </p>
            </div>
            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h4 style={{ margin: '0 0 var(--spacing-sm)' }}>Refer & Earn</h4>
              <p style={{ margin: '0', fontSize: 'var(--font-body-sm-size)', color: 'var(--color-text-secondary)' }}>
                Earn rewards for successful referrals
              </p>
            </div>
          </Grid>
        </Card>
      </Grid>
    </PageWrapper>
  );
}
