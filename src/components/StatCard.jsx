import React from 'react';

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      {icon}
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard;