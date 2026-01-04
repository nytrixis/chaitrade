"use client";

import { useState, useEffect } from 'react';

export interface ZKProofStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface ZKProofProgressProps {
  invoiceId?: number;
  creditScore: number;
  onComplete?: (proofCid: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * ZK Proof Progress Indicator
 * Shows step-by-step progress of zero-knowledge proof generation
 */
export function ZKProofProgress({
  invoiceId,
  creditScore,
  onComplete,
  onError,
  className = ''
}: ZKProofProgressProps) {
  const [steps, setSteps] = useState<ZKProofStep[]>([
    {
      id: 'fetch_credit_data',
      title: 'Fetch Credit Data',
      description: 'Retrieving credit score and payment history',
      status: 'pending',
    },
    {
      id: 'generate_witness',
      title: 'Generate Witness',
      description: 'Creating cryptographic witness from credit data',
      status: 'pending',
    },
    {
      id: 'compute_proof',
      title: 'Compute ZK Proof',
      description: 'Generating zero-knowledge proof (this may take a moment)',
      status: 'pending',
    },
    {
      id: 'verify_proof',
      title: 'Verify Proof',
      description: 'Verifying proof validity',
      status: 'pending',
    },
    {
      id: 'upload_ipfs',
      title: 'Upload to IPFS',
      description: 'Storing proof on decentralized storage',
      status: 'pending',
    },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [proofCid, setProofCid] = useState<string | null>(null);

  // Mock ZK proof generation (replace with actual ZK proof logic)
  const generateZKProof = async () => {
    setOverallStatus('running');

    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);

      // Mark current step as in_progress
      setSteps(prev => prev.map((step, idx) =>
        idx === i ? { ...step, status: 'in_progress', startedAt: new Date() } : step
      ));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Simulate occasional failures (5% chance)
      if (Math.random() < 0.05 && i > 0) {
        const error = `Failed at step: ${steps[i].title}`;
        setSteps(prev => prev.map((step, idx) =>
          idx === i ? { ...step, status: 'failed', error } : step
        ));
        setOverallStatus('failed');
        if (onError) onError(error);
        return;
      }

      // Mark current step as completed
      setSteps(prev => prev.map((step, idx) =>
        idx === i ? { ...step, status: 'completed', completedAt: new Date() } : step
      ));
    }

    // Generate mock proof CID
    const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setProofCid(mockCid);
    setOverallStatus('completed');

    if (onComplete) {
      onComplete(mockCid);
    }
  };

  // Auto-start proof generation
  useEffect(() => {
    if (overallStatus === 'idle') {
      generateZKProof();
    }
  }, []);

  const getStepIcon = (status: ZKProofStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-sage-green-500/20 border-2 border-sage-green-500 flex items-center justify-center">
            <span className="text-sage-green-400">✓</span>
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'failed':
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
            <span className="text-red-400">✕</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-medium-gray/20 border-2 border-medium-gray flex items-center justify-center">
            <span className="text-light-gray">○</span>
          </div>
        );
    }
  };

  const getOverallProgress = () => {
    const completedCount = steps.filter(s => s.status === 'completed').length;
    return (completedCount / steps.length) * 100;
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-off-white">ZK Proof Generation</h3>
        {overallStatus === 'running' && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-400">Processing...</span>
          </div>
        )}
        {overallStatus === 'completed' && (
          <div className="flex items-center gap-2">
            <span className="text-sage-green-400 text-xl">✓</span>
            <span className="text-sm text-sage-green-400">Complete</span>
          </div>
        )}
        {overallStatus === 'failed' && (
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xl">✕</span>
            <span className="text-sm text-red-400">Failed</span>
          </div>
        )}
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-light-gray">Overall Progress</span>
          <span className="text-off-white font-semibold">{getOverallProgress().toFixed(0)}%</span>
        </div>
        <div className="w-full bg-dark-gray rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              overallStatus === 'failed' ? 'bg-red-500' :
              overallStatus === 'completed' ? 'bg-sage-green-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${getOverallProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Step-by-Step Progress */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            {/* Icon and connecting line */}
            <div className="flex flex-col items-center">
              {getStepIcon(step.status)}
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-full min-h-[40px] mt-2 ${
                  step.status === 'completed' ? 'bg-sage-green-500/50' : 'bg-medium-gray/30'
                }`}></div>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between mb-1">
                <div className={`font-semibold ${
                  step.status === 'completed' ? 'text-sage-green-400' :
                  step.status === 'in_progress' ? 'text-blue-400' :
                  step.status === 'failed' ? 'text-red-400' :
                  'text-light-gray'
                }`}>
                  {step.title}
                </div>
                {step.status === 'in_progress' && (
                  <div className="text-xs text-blue-400 animate-pulse">In progress...</div>
                )}
                {step.status === 'completed' && step.completedAt && (
                  <div className="text-xs text-light-gray">
                    {((step.completedAt.getTime() - (step.startedAt?.getTime() || 0)) / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
              <div className="text-sm text-light-gray">{step.description}</div>
              {step.status === 'failed' && step.error && (
                <div className="text-xs text-red-400 mt-1 bg-red-500/10 rounded px-2 py-1">
                  {step.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Success state */}
      {overallStatus === 'completed' && proofCid && (
        <div className="mt-6 bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div className="flex-1">
              <h4 className="text-sage-green-400 font-semibold mb-2">Proof Generated Successfully</h4>
              <div className="text-sm text-light-gray mb-2">
                Your credit score has been verified using zero-knowledge proofs to protect your privacy.
              </div>
              <div className="bg-dark-gray/50 rounded p-2">
                <div className="text-xs text-light-gray mb-1">Proof IPFS CID:</div>
                <div className="font-mono text-xs text-off-white break-all">{proofCid}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-light-gray text-xs mb-1">Credit Score Range</div>
                  <div className="text-off-white font-semibold">
                    {creditScore >= 750 ? '750+' :
                     creditScore >= 700 ? '700-749' :
                     creditScore >= 650 ? '650-699' : '< 650'}
                  </div>
                </div>
                <div>
                  <div className="text-light-gray text-xs mb-1">Privacy</div>
                  <div className="text-sage-green-400 font-semibold">Protected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retry button for failed state */}
      {overallStatus === 'failed' && (
        <div className="mt-6">
          <button
            onClick={() => {
              setSteps(steps.map(s => ({ ...s, status: 'pending' as const })));
              setCurrentStepIndex(0);
              setOverallStatus('idle');
              generateZKProof();
            }}
            className="btn-primary w-full"
          >
            Retry Proof Generation
          </button>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-6 pt-4 border-t border-medium-gray/30">
        <p className="text-xs text-light-gray text-center">
          🔐 Zero-knowledge proofs allow verification without revealing sensitive data
        </p>
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function ZKProofProgressCompact({ status = 'completed' }: { status?: 'idle' | 'running' | 'completed' | 'failed' }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-gray/50 border border-medium-gray/30">
      {status === 'running' && (
        <>
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-blue-400">Generating ZK Proof...</span>
        </>
      )}
      {status === 'completed' && (
        <>
          <span className="text-sage-green-400">✓</span>
          <span className="text-xs text-sage-green-400">ZK Verified</span>
        </>
      )}
      {status === 'failed' && (
        <>
          <span className="text-red-400">✕</span>
          <span className="text-xs text-red-400">Verification Failed</span>
        </>
      )}
      {status === 'idle' && (
        <>
          <div className="w-2 h-2 bg-light-gray rounded-full"></div>
          <span className="text-xs text-light-gray">Not Verified</span>
        </>
      )}
    </div>
  );
}
