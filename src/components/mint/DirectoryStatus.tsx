import { useState, useEffect } from 'react';
import { publicMintService } from '../../services/mint/publicMintService';

export const DirectoryStatus: React.FC<{
  directoryId: string;
  onConfirmed: () => void;
}> = ({ directoryId, onConfirmed }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const status = await publicMintService.checkArweaveStatus([directoryId], 'directory');
      setLastChecked(new Date());
      
      if (status[directoryId]) {
        setIsConfirmed(true);
        onConfirmed();
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Directory Creation Status</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Directory ID:</p>
        <p className="font-mono text-sm break-all">{directoryId}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={checkStatus}
          disabled={isChecking || isConfirmed}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isChecking ? 'Checking...' : 'Check Directory Status'}
        </button>

        {lastChecked && !isConfirmed && (
          <p className="text-sm text-gray-600">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}

        {isConfirmed && (
          <div className="bg-green-50 p-4 rounded">
            <p className="text-green-600">Directory confirmed! Ready for file upload.</p>
          </div>
        )}
      </div>
    </div>
  );
};
