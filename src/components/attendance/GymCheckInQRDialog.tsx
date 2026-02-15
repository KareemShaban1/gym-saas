import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

/** Payload that members scan to check in. Must match MemberCheckInQRScanner. */
const GYM_CHECKIN_QR_PAYLOAD = (gymId: number) =>
  JSON.stringify({ gymId, action: "checkin" as const });

interface GymCheckInQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GymCheckInQRDialog({ open, onOpenChange }: GymCheckInQRDialogProps) {
  const { user } = useAuth();
  const gymId = user?.gym_id;
  if (gymId == null) return null;

  const qrValue = GYM_CHECKIN_QR_PAYLOAD(gymId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-center">
            Gym check-in QR
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Display this QR at the entrance. Members scan it in the member app to check in.
          </p>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <QRCodeSVG
              value={qrValue}
              size={220}
              level="H"
              includeMargin
              bgColor="hsl(0 0% 100%)"
              fgColor="hsl(220 25% 8%)"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
