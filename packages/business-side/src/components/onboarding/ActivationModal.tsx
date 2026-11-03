'use client';

import { ActivationButton } from './ActivationButton';

interface ActivationModalProps {
  partnerId: string;
}

export function ActivationModal({ partnerId }: ActivationModalProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Activation</h2>
      <p className="text-gray-700 mb-4">
        To activate your account, you will need to pay KES 1,499 via M-Pesa.
        This one-time payment activates your partner account and unlocks all features.
      </p>
      <p className="font-semibold text-gray-900 mb-2">Instructions:</p>
      <ol className="list-decimal list-inside space-y-1 text-gray-700 mb-4">
        <li>Click the &quot;Activate with M-Pesa&quot; button below</li>
        <li>You will receive an M-Pesa prompt on your phone</li>
        <li>Confirm the payment of KES 1,499</li>
        <li>Your account will be activated immediately</li>
      </ol>
      <ActivationButton partnerId={partnerId} />
    </div>
  );
}
