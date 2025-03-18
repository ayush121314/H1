import React from 'react';

// Define same GameState type as in other components
type GameState = 'waiting' | 'betting' | 'bet_announced' | 'escrow_locked' | 'playing' | 'completed';

interface AIAgentPanelProps {
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  gameState: GameState;
  useSimulationMode?: boolean;
  setUseSimulationMode?: (enabled: boolean) => void;
}

const AIAgentPanel: React.FC<AIAgentPanelProps> = ({
  aiEnabled,
  setAiEnabled,
  gameState,
  useSimulationMode = false,
  setUseSimulationMode
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
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">AI Agent Settings</h2>
      
      <div className="flex items-center justify-between">
        <span className="font-medium">AI-Facilitated Betting</span>
        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
          <input
            type="checkbox"
            id="toggle"
            className="absolute w-6 h-6 opacity-0 cursor-pointer z-10"
            checked={aiEnabled}
            onChange={(e) => {
              if (gameState === 'waiting') {
                setAiEnabled(e.target.checked);
              }
            }}
            disabled={gameState !== 'waiting'}
          />
          <label
            htmlFor="toggle"
            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
              aiEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`toggle-dot absolute top-0 left-0 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                aiEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></span>
          </label>
        </div>
      </div>
      
      {setUseSimulationMode && (
        <div className="flex items-center justify-between mt-4">
          <span className="font-medium">Simulation Mode</span>
          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
            <input
              type="checkbox"
              id="simulation-toggle"
              className="absolute w-6 h-6 opacity-0 cursor-pointer z-10"
              checked={useSimulationMode}
              onChange={(e) => {
                if (gameState === 'waiting') {
                  setUseSimulationMode(e.target.checked);
                }
              }}
              disabled={gameState !== 'waiting'}
            />
            <label
              htmlFor="simulation-toggle"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                useSimulationMode ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`toggle-dot absolute top-0 left-0 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  useSimulationMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></span>
            </label>
          </div>
        </div>
      )}
      
      <p className="text-sm text-gray-600 mt-4">
        {aiEnabled ? (
          <>
            AI agent is <span className="text-blue-500 font-medium">enabled</span>.
            <br />
            It will facilitate betting, escrow, and payout.
          </>
        ) : (
          <>
            AI agent is <span className="text-red-500 font-medium">disabled</span>.
            <br />
            Players will need to handle betting manually.
          </>
        )}
      </p>
      
      {setUseSimulationMode && (
        <p className="text-sm text-gray-600 mt-2">
          {useSimulationMode ? (
            <>
              Simulation mode is <span className="text-green-500 font-medium">enabled</span>.
              <br />
              No actual funds will be transferred during testing.
            </>
          ) : (
            <>
              Simulation mode is <span className="text-red-500 font-medium">disabled</span>.
              <br />
              Real funds will be used for transactions.
            </>
          )}
        </p>
      )}

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