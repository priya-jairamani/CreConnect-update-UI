import PropTypes from 'prop-types';
import StatCard from '@/components/common/StatCard';
import Button from '@/components/common/Button';
import Switch from '@/components/common/Switch';
import Badge from '@/components/common/Badge';

export default function PaymentSection({ values, onChange, financials, paymentMethods }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Financial Center</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <StatCard icon="💸" value={financials.totalSpend} label="Total Spend" />
          <StatCard icon="⏳" value={financials.pendingPayments} label="Pending Payments" />
          <StatCard icon="🔒" value={financials.escrowBalance} label="Escrow Balance" />
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Payment Methods</h3>
        <div className="space-y-2">
          {paymentMethods.length === 0 && (
            <p className="text-fg-muted text-sm">No payment methods on file.</p>
          )}
          {paymentMethods.map((m) => (
            <div key={m.id} className="card rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--surface-2)' }}>
              <span className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">💳</span>
              <div className="min-w-0 flex-1">
                <p className="text-fg font-medium text-sm">{m.brand} •••• {m.last4}</p>
                <p className="text-fg-muted text-xs mt-0.5">Expires {m.expiry}</p>
              </div>
              {m.isDefault && <Badge variant="brand" label="Default" />}
            </div>
          ))}
          <Button variant="secondary" size="sm">+ Add Payment Method</Button>
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Bank Accounts &amp; Payouts</h3>
        <div className="card rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap" style={{ background: 'var(--surface-2)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">🏦</span>
            <div className="min-w-0">
              <p className="text-fg font-medium text-sm">Stripe Connected Account</p>
              <p className="text-fg-muted text-xs mt-0.5">{values.stripeConnected ? 'Connected — payouts enabled' : 'Not connected'}</p>
            </div>
          </div>
          <Button variant={values.stripeConnected ? 'secondary' : 'primary'} size="xs" onClick={() => onChange('stripeConnected', !values.stripeConnected)}>
            {values.stripeConnected ? 'Manage' : 'Connect Stripe'}
          </Button>
        </div>
        <Button variant="secondary" size="sm" className="mt-2">+ Add Bank Account</Button>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Escrow Preferences</h3>
        <div className="space-y-1">
          <div className="py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <Switch
              checked={values.escrowEnabled}
              onChange={(v) => onChange('escrowEnabled', v)}
              label="Hold campaign funds in escrow"
              description="Funds are released to creators only after deliverables are approved"
            />
          </div>
          <div className="py-2.5">
            <Switch
              checked={values.autoReleasePayments}
              onChange={(v) => onChange('autoReleasePayments', v)}
              label="Auto-Release Payments"
              description="Automatically release escrow funds 48 hours after deliverable approval"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

PaymentSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  financials: PropTypes.object.isRequired,
  paymentMethods: PropTypes.array.isRequired,
};
