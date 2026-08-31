import React, { useState } from 'react';
import { migrationService, MigrationSummary } from '../../services/migrationService';
import { CloudUpload, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  summary: MigrationSummary;
  onMigrated: () => void;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({
  isOpen,
  onClose,
  userId,
  summary,
  onMigrated
}) => {
  const [migrating, setMigrating] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleMigrate = async () => {
    setMigrating(true);
    const res = await migrationService.migrateToCloud(userId);
    setMigrating(false);
    if (res.success) {
      setDone(true);
      setTimeout(() => {
        onMigrated();
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#E8EDE9]">
        <div className="p-5 bg-[#17211B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-[#3FAE68]" />
            <h3 className="font-extrabold text-sm">Sync Local Data to Cloud</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#6B756C] leading-relaxed">
            We found local meal plans and preferences on this device ({summary.profileName || 'Thabo'}). Would you like to upload and sync them to your cloud account?
          </p>

          <div className="p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#17211B]">
              <span>Planned meals:</span>
              <strong className="font-bold">{summary.mealCount} meals</strong>
            </div>
            <div className="flex justify-between text-[#17211B]">
              <span>Daily habits:</span>
              <strong className="font-bold">{summary.habitsCount} habits</strong>
            </div>
            <div className="flex justify-between text-[#17211B]">
              <span>Pantry ingredients:</span>
              <strong className="font-bold">{summary.pantryCount} items</strong>
            </div>
          </div>

          {done ? (
            <div className="p-3 rounded-2xl bg-[#EAF7EF] text-[#2C854E] text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3FAE68]" />
              <span>Successfully synced to your cloud account!</span>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#E8EDE9] text-xs font-bold text-[#6B756C] hover:text-[#17211B] transition"
              >
                Skip
              </button>
              <button
                onClick={handleMigrate}
                disabled={migrating}
                className="flex-1 py-2.5 rounded-xl bg-[#3FAE68] text-white hover:bg-[#349859] disabled:opacity-50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>{migrating ? 'Syncing...' : 'Sync Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};