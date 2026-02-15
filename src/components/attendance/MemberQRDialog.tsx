import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { MemberUI } from "@/types/api";

interface MemberQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberUI | null;
}

const MemberQRDialog = ({ open, onOpenChange, member }: MemberQRDialogProps) => {
  if (!member) return null;

  const qrValue = JSON.stringify({ memberId: member.id, name: member.name, gym: "gymflow" });

  const handleDownload = () => {
    const svg = document.getElementById("member-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `${member.name.replace(/\s/g, "-")}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-center">Member QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <QRCodeSVG
              id="member-qr-code"
              value={qrValue}
              size={220}
              level="H"
              includeMargin
              bgColor="hsl(0 0% 100%)"
              fgColor="hsl(220 25% 8%)"
            />
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-lg">{member.name}</p>
            <p className="text-sm text-muted-foreground">ID: #{member.id}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Download QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberQRDialog;
