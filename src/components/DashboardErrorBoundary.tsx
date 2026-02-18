import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class DashboardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
            <h2 className="text-xl font-display font-bold">Something went wrong</h2>
            <p className="text-muted-foreground max-w-sm">
              The dashboard could not load. Try refreshing the page or logging out and back in.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </Button>
          </div>
        </DashboardLayout>
      );
    }
    return this.props.children;
  }
}
