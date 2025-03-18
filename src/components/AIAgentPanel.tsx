import React from 'react';

// Define same GameState type as in other components
type GameState = 'waiting' | 'betting' | 'playing' | 'completed';

interface AIAgentPanelProps {
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  gameState: GameState;
}

const AIAgentPanel: React.FC<AIAgentPanelProps> = ({
  aiEnabled,
  setAiEnabled,
  gameState
}) => {
  const agentActions = [
    {
      title: 'Betting Facilitation',
      description: 'Manages betting pools and ensures fair distribution of winnings',
      status: gameState !== 'waiting' ? 'active' : 'standby'
    },
    {
      title: 'Market Making',
      description: 'Creates market liquidity and dynamic bet matching',
      status: gameState === 'playing' ? 'active' : 'standby'
    },
    {
      title: 'Game Verification',
      description: 'Verifies game outcomes and enforces rules',
      status: gameState === 'completed' ? 'active' : 'standby'
    },
    {
      title: 'Cross-Game Economy',
      description: 'Facilitates token transfers between different games',
      status: 'standby'
    }
  ];

  const getStatusBadge = (status: string) => {
    const classes = {
      active: "bg-green-100 text-green-800 border-green-200",
      standby: "bg-yellow-100 text-yellow-800 border-yellow-200",
      disabled: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full border ${classes[status as keyof typeof classes]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="betting-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">AI Agent</h2>
        <div className="flex items-center">
          <span className="mr-2 text-sm">Enabled</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={aiEnabled} 
              onChange={(e) => setAiEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
      
      <div className="mb-3">
        <h3 className="text-md font-semibold mb-2">Agent Status</h3>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${aiEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>{aiEnabled ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-2">Agent Functions</h3>
        <div className="space-y-3">
          {agentActions.map((action, index) => (
            <div key={index} className={`p-3 border rounded-md ${aiEnabled ? 'border-gray-200' : 'border-gray-200 opacity-50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{action.title}</span>
                {getStatusBadge(aiEnabled ? action.status : 'disabled')}
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAgentPanel; 