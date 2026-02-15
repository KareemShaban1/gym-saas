import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { memberApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { QrCode } from "lucide-react";

/** QR payload from gym check-in QR (displayed at gym entrance). */
interface GymCheckInQRPayload {
  gymId: number;
  action: "checkin";
  branchId?: number;
}

interface MemberCheckInQRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function MemberCheckInQRScanner({
  open,
  onOpenChange,
  onSuccess,
  onError,
}: MemberCheckInQRScannerProps) {
  const { member } = useMemberAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const scannerRef = useRef<{ html5QrCode: import("html5-qrcode").Html5Qrcode | null }>({ html5QrCode: null });
  const scanAreaId = "member-checkin-qr-reader";

  useEffect(() => {
    if (!open || !member?.gym_id) return;

    let mounted = true;
    let html5QrCode: import("html5-qrcode").Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted) return;
        setStatus("scanning");
        setMessage("Point your camera at the gym's check-in QR code");

        html5QrCode = new Html5Qrcode(scanAreaId);
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!mounted || !html5QrCode) return;
            try {
              const data = JSON.parse(decodedText) as GymCheckInQRPayload;
              if (data.action !== "checkin" || typeof data.gymId !== "number") return;
              if (data.gymId !== member.gym_id) {
                setStatus("error");
                setMessage("This QR is for a different gym.");
                onError?.("This QR is for a different gym.");
                return;
              }
              html5QrCode.stop().then(() => {
                scannerRef.current.html5Qrcode = null;
                memberApi.post("/attendance/check-in").then(() => {
                  if (!mounted) return;
                  setStatus("success");
                  setMessage("You're checked in!");
                  queryClient.invalidateQueries({ queryKey: ["member", "attendance"] });
                  onSuccess?.();
                  setTimeout(() => onOpenChange(false), 1200);
                }).catch((err) => {
                  if (!mounted) return;
                  setStatus("error");
                  setMessage(err?.message ?? "Check-in failed");
                  onError?.(err?.message ?? "Check-in failed");
                });
              }).catch(() => {});
            } catch {
              // not our JSON format, ignore (keep scanning)
            }
          },
          () => {}
        );
        if (!mounted) return;
        scannerRef.current.html5Qrcode = html5QrCode;
      } catch (err) {
        if (!mounted) return;
        setStatus("error");
        const msg = err instanceof Error ? err.message : "Could not access camera. Use manual check-in.";
        setMessage(msg);
        onError?.(msg);
      }
    };

    startScanner();
    return () => {
      mounted = false;
      const scanner = scannerRef.current.html5Qrcode;
      scannerRef.current.html5Qrcode = null;
      if (scanner) {
        try {
          scanner.stop().catch(() => {});
          scanner.clear().catch(() => {});
        } catch {
          // ignore "Cannot stop, scanner is not running or paused"
        }
      }
    };
  }, [open, member?.gym_id, onOpenChange, onSuccess, onError, queryClient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan gym QR to check in
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div
            id={scanAreaId}
            className="rounded-xl overflow-hidden bg-muted min-h-[240px] w-full"
          />
          {status === "scanning" && (
            <p className="text-sm text-muted-foreground mt-3 text-center">{message}</p>
          )}
          {status === "success" && (
            <p className="text-sm text-primary font-medium mt-3 text-center">{message}</p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive mt-3 text-center">{message}</p>
          )}
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
