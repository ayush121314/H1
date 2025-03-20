import React, { useState, useEffect } from 'react';
import { trainingAgentService } from '../agent/TrainingAgentService';
import { DifficultyLevel } from '../agent/ChessTrainingAgent';

interface TrainingPanelProps {
  trainingModeEnabled: boolean;
  fen: string;
  lastMove?: { from: string; to: string };
  onSuggestMove?: (move: { from: string; to: string; promotion?: string }) => void;
}

const TrainingPanel: React.FC<TrainingPanelProps> = ({
  trainingModeEnabled,
  fen,
  lastMove,
  onSuggestMove
}) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [tip, setTip] = useState<string | null>(null);

  useEffect(() => {
    // Update the agent's game state when FEN changes
    if (trainingModeEnabled && fen) {
      trainingAgentService.updateGameState(fen);
    }
  }, [fen, trainingModeEnabled]);

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDifficulty = e.target.value as DifficultyLevel;
    setDifficulty(newDifficulty);
    trainingAgentService.setDifficulty(newDifficulty);
  };

  const handleGetTip = () => {
    const newTip = trainingAgentService.getStrategicTip();
    setTip(newTip);
  };

  const handleSuggestMove = () => {
    if (onSuggestMove) {
      const suggestedMove = trainingAgentService.suggestMove();
      console.log('TrainingPanel - Suggesting move:', suggestedMove);
      if (suggestedMove) {
        onSuggestMove(suggestedMove);
        // Show user feedback
        const moveText = `${suggestedMove.from} → ${suggestedMove.to}${suggestedMove.promotion ? ` (promote to ${suggestedMove.promotion})` : ''}`;
        const moveElement = document.getElementById('suggested-move-text');
        if (moveElement) {
          moveElement.textContent = moveText;
        }
      }
    }
  };

  // If training mode is disabled, don't render the panel
  if (!trainingModeEnabled) {
    return null;
  }

  return (
    <div className="panel glass-card bg-gradient-to-br from-purple-900/20 to-purple-700/10 border border-purple-900/20">
      <h2 className="text-xl font-bold mb-4 text-purple-gradient">Training Mode</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty Level</label>
        <select
          value={difficulty}
          onChange={handleDifficultyChange}
          className="w-full p-2 border border-purple-500/30 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-dark-800/80 text-gray-100"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
      </div>
      
      <button
        onClick={handleSuggestMove}
        className="btn-training w-full py-3 mb-3 text-base font-medium flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Suggest Best Move
      </button>
      
      <div id="suggested-move-text" className="text-center mb-3 text-purple-400 font-medium"></div>
      
      <button
        onClick={handleGetTip}
        className="btn-training w-full py-2 mb-4"
      >
        Get Strategic Tip
      </button>
      
      {tip && (
        <div className="p-3 rounded-md bg-blue-900/20 border border-blue-800/30">
          <h3 className="font-medium mb-1 text-blue-400">Strategic Tip</h3>
          <p className="text-sm text-gray-300">{tip}</p>
        </div>
      )}
    </div>
  );
};

export default TrainingPanel; 