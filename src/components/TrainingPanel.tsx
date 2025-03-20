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
  const [analysis, setAnalysis] = useState<any>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [moveQuality, setMoveQuality] = useState<'good' | 'neutral' | 'bad' | null>(null);

  useEffect(() => {
    // Update the agent's game state when FEN changes
    if (trainingModeEnabled && fen) {
      trainingAgentService.updateGameState(fen);
    }
  }, [fen, trainingModeEnabled]);

  useEffect(() => {
    // Analyze moves when they happen
    if (trainingModeEnabled && lastMove) {
      const moveAnalysis = trainingAgentService.analyzeMove(lastMove.from, lastMove.to);
      if (moveAnalysis) {
        setAnalysis(moveAnalysis);
        
        // Set move quality for visual feedback
        if (moveAnalysis.evaluation > 1) {
          setMoveQuality('good');
        } else if (moveAnalysis.evaluation < -1) {
          setMoveQuality('bad');
        } else {
          setMoveQuality('neutral');
        }
      }
    }
  }, [lastMove, trainingModeEnabled]);

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
      if (suggestedMove) {
        onSuggestMove(suggestedMove);
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
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleSuggestMove}
          className="btn-training flex-1"
        >
          Suggest Move
        </button>
        <button
          onClick={handleGetTip}
          className="btn-training flex-1"
        >
          Get Tip
        </button>
      </div>
      
      {analysis && (
        <div className="p-3 mb-4 rounded-md border bg-dark-700/80 border-dark-600">
          <h3 className="font-medium mb-1 text-gray-100">Move Analysis</h3>
          <p className="text-sm text-gray-300">{analysis.comment}</p>
          <div className="mt-1 text-xs text-gray-400">
            Evaluation: <span className={
              moveQuality === 'good' ? 'text-green-400' :
              moveQuality === 'bad' ? 'text-red-400' :
              'text-yellow-400'
            }>{analysis.evaluation.toFixed(1)}</span>
          </div>
        </div>
      )}
      
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