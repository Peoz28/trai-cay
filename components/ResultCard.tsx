
import React from 'react';
import { FruitAnalysis } from '../types';
import { LeafIcon } from './IconComponents';

interface ResultCardProps {
  result: FruitAnalysis;
}

const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
        case 'chín':
        case 'tươi':
        case 'tốt':
            return 'text-green-500 bg-green-100';
        case 'xanh':
            return 'text-yellow-500 bg-yellow-100';
        case 'hỏng':
        case 'xấu':
            return 'text-red-500 bg-red-100';
        default:
            return 'text-gray-500 bg-gray-100';
    }
}

const RipenessBar: React.FC<{ score: number }> = ({ score }) => {
    const percentage = Math.max(0, Math.min(100, score * 10));
    const barColor = percentage > 75 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Điểm Độ Chín</span>
                <span className="text-sm font-medium text-gray-700">{score}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto animate-fade-in-up">
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-green-100 p-3 rounded-full">
            <LeafIcon className="w-8 h-8 text-green-600" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{result.fruitName}</h2>
            <p className={`text-sm font-semibold px-2.5 py-0.5 rounded-full inline-block ${getConditionColor(result.condition)}`}>
                {result.condition.charAt(0).toUpperCase() + result.condition.slice(1)}
            </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600 text-center md:text-left">{result.description}</p>
        
        <div className="border-t border-gray-200 pt-4">
            <RipenessBar score={result.ripenessScore} />
        </div>
        
        <div className="text-center text-xs text-gray-400">
            Độ Tin Cậy: {(result.confidence * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
