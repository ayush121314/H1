import React from 'react';

interface DebugPanelProps {
  aiEnabled: boolean;
  trainingModeEnabled: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  aiEnabled,
  trainingModeEnabled
}) => {
  return (
    <div className="p-4 bg-red-900 text-white rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-bold mb-2">Debug Panel</h2>
      <p>If you can see this panel, React is rendering components properly.</p>
      <ul className="list-disc ml-4 mt-2">
        <li>AI Enabled: {aiEnabled ? 'Yes' : 'No'}</li>
        <li>Training Enabled: {trainingModeEnabled ? 'Yes' : 'No'}</li>
      </ul>
    </div>
  );
};

export default DebugPanel; 