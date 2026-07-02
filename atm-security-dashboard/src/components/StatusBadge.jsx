import PropTypes from 'prop-types';

export default function StatusBadge({ status, alertType }) {
  // Check if it's ARMED alert
  const isArmed = (type) => {
    if (!type) return false;
    const upper = type.toUpperCase();
    return upper.includes('ARMED') && !upper.includes('DISARMED');
  };

  // Check if it's DISARMED alert
  const isDisarmed = (type) => {
    if (!type) return false;
    const upper = type.toUpperCase();
    return upper.includes('DISARMED') || (upper.includes('DISARM') && !upper.includes('ARMED'));
  };

  // ARMED alerts get Yellow color for PENDING
  if (status === 'PENDING' && isArmed(alertType)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
        PENDING
      </span>
    );
  }

  // DISARMED alerts get Red color for PENDING
  if (status === 'PENDING' && isDisarmed(alertType)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-red-500/20 text-red-400 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        PENDING
      </span>
    );
  }

  // Zone Alerts - Red for PENDING (default)
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-red-500/20 text-red-400 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        PENDING
      </span>
    );
  }

  if (status === 'ACKNOWLEDGED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
        ACKNOWLEDGED
      </span>
    );
  }

  // RESOLVED - Green
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      RESOLVED
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  alertType: PropTypes.string
};