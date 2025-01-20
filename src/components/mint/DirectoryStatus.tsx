import React, { useState, useEffect } from 'react';
import { checkArweaveStatus, type DirectoryStatusResponse } from '../../services/arweave/statusCheck';

interface DirectoryStatusProps {
  directoryId: string;
  metadataTxId?: string;
  onConfirmed: () => void;
}

// Define just the status type we need
type DirectoryStatus = {
  exists: boolean;
  ready: boolean;
  transactionStatus: string;
  message: string;
  estimatedConfirmation?: number;
};

export const DirectoryStatus: React.FC<DirectoryStatusProps> = ({ 
  directoryId, 
  metadataTxId,
  onConfirmed 
}) => {
  const [status, setStatus] = useState<DirectoryStatus | null>(null);
  const [checkCount, setCheckCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [submissionTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - submissionTime.getTime();
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setElapsedTime(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [submissionTime]);

  const checkStatus = async () => {
    if (!metadataTxId) {
      setStatus({
        exists: false,
        ready: false,
        transactionStatus: 'pending',
        message: 'Waiting for transaction ID'
      });
      return;
    }

    try {
      const result = await checkArweaveStatus(metadataTxId, 'public');
      
      // Now in the success case:
      if (result.directoryStatus) {
              setStatus({
                exists: true,
                ready: result.directoryStatus.ready,
                transactionStatus: 'confirmed',
                message: result.message
              });
        setLastCheckTime(new Date());
        setCheckCount(prev => prev + 1);
        
        if (result.directoryStatus.ready) {
          onConfirmed();
        }
      }
    } catch (error) {
      setStatus({
        exists: false,
        ready: false,
        transactionStatus: 'pending',
        message: 'Transaction not yet indexed on Arweave'
      });
      setLastCheckTime(new Date());
      setCheckCount(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Directory Creation in Progress
        </h2>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
          <p className="text-amber-700">
            Please keep this page open while we wait for confirmation.
            This process typically takes 15-20 minutes.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={checkStatus}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors flex items-center gap-2"
          >
            Check Status
          </button>
          {lastCheckTime && (
            <span className="text-sm text-gray-500">
              Last checked: {lastCheckTime.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Time elapsed: {elapsedTime}
          </p>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Directory ID: {directoryId}
          </p>
          {status && (
            <p className="text-sm text-gray-600">
              Status: {status.message}
            </p>
          )}
          {status?.estimatedConfirmation && (
            <p className="text-sm text-gray-600">
              Estimated time until confirmed: {Math.ceil(status.estimatedConfirmation / 60)} minutes
            </p>
          )}
          {checkCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Checks attempted: {checkCount}
            </p>
          )}
        </div>
      </div>
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          What's happening?
        </h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Your directory is being created on the Arweave network
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            This process ensures permanent, decentralized storage
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Once confirmed, you'll proceed to file uploads
          </li>
        </ul>
      </div>
    </div>
  );
};
