import React from 'react';
import { Lightbulb } from 'lucide-react';

const EmptyState = () => (
  <div className="bg-white p-8 rounded-lg shadow text-center">
    <Lightbulb className="mx-auto h-10 w-10 text-gray-400 mb-3" />
    <p className="text-gray-700">Upload a CSV to see analysis here.</p>
    <p className="text-sm text-gray-500">Go to the Home tab for instructions and a sample CSV.</p>
  </div>
);

export default EmptyState;