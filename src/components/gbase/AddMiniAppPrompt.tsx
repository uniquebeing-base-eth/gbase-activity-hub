
import { Bell } from "lucide-react";

interface AddMiniAppPromptProps {
  isOpen: boolean;
  onAdd: () => void;
  onDismiss: () => void;
}

const AddMiniAppPrompt = ({ isOpen, onAdd, onDismiss }: AddMiniAppPromptProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-t-2xl p-6 animate-slide-up">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-center mb-2">
          Stay Active with Notifications
        </h2>

        <p className="text-muted-foreground text-center text-sm mb-6">
          Add gBase to your Farcaster apps to receive reminders when you're eligible to send again.
        </p>

        <div className="space-y-3">
          <button
            onClick={onAdd}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Enable Notifications
          </button>

          <button
            onClick={onDismiss}
            className="w-full text-muted-foreground py-2 text-sm hover:text-foreground transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMiniAppPrompt;
