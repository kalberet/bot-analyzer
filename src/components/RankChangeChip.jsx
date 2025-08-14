import React from 'react';

const RankChangeChip = ({ dir, value, label }) => {
  const cls =
    dir === 'up' ? 'chip chip-up' :
    dir === 'down' ? 'chip chip-down' :
    dir === 'new' ? 'chip chip-new' :
    'chip chip-same';
  return <span className={cls} title="Rank change">{label || (value === 0 ? '—' : value)}</span>;
};

export default RankChangeChip;