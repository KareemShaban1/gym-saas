import { ProgressRecord } from "@/data/workouts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TrendingDown, TrendingUp, Minus, User, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ProgressTrackerProps {
  progress: ProgressRecord[];
}

const metricLabels: Record<string, string> = {
  weight: "Weight (kg)",
  bodyFat: "Body Fat (%)",
  chest: "Chest (cm)",
  waist: "Waist (cm)",
  hips: "Hips (cm)",
  arms: "Arms (cm)",
  thighs: "Thighs (cm)",
};

const ProgressTracker = ({ progress }: ProgressTrackerProps) => {
  const [expandedTrainee, setExpandedTrainee] = useState<number | null>(
    progress.length > 0 ? progress[0].traineeId : null
  );
  const [selectedMetric, setSelectedMetric] = useState<string>("weight");

  const toggle = (id: number) => setExpandedTrainee(expandedTrainee === id ? null : id);

  return (
    <div className="space-y-3">
      {progress.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          No progress records yet.
        </div>
      ) : (
        progress.map((rec) => {
          const isExpanded = expandedTrainee === rec.traineeId;
          const latest = rec.measurements[rec.measurements.length - 1];
          const prev = rec.measurements.length > 1 ? rec.measurements[rec.measurements.length - 2] : null;
          const weightDiff = prev ? latest.weight - prev.weight : 0;

          const chartData = rec.measurements.map((m) => ({
            date: format(new Date(m.date), "MMM d"),
            value: (m as any)[selectedMetric] ?? null,
          })).filter((d) => d.value !== null);

          return (
            <div key={rec.traineeId} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => toggle(rec.traineeId)}
              >
                <div className="shrink-0">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> {rec.traineeName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rec.measurements.length} measurement{rec.measurements.length !== 1 ? "s" : ""} · Latest: {format(new Date(latest.date), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg font-bold">{latest.weight} kg</span>
                  {weightDiff !== 0 && (
                    <span className={cn("flex items-center gap-0.5 text-xs font-medium",
                      weightDiff < 0 ? "text-success" : "text-destructive"
                    )}>
                      {weightDiff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                      {Math.abs(weightDiff).toFixed(1)}
                    </span>
                  )}
                  {weightDiff === 0 && prev && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                      {/* Metric selector */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.keys(metricLabels).map((key) => {
                          const hasData = rec.measurements.some((m) => (m as any)[key] != null);
                          if (!hasData) return null;
                          return (
                            <button
                              key={key}
                              onClick={() => setSelectedMetric(key)}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                                selectedMetric === key
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {metricLabels[key]}
                            </button>
                          );
                        })}
                      </div>

                      {/* Chart */}
                      {chartData.length > 1 && (
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={["auto", "auto"]} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "0.5rem",
                                  fontSize: 12,
                                }}
                              />
                              <Line
                                type="monotone" dataKey="value" stroke="hsl(var(--primary))"
                                strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                name={metricLabels[selectedMetric]}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Measurements table */}
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="text-left font-medium text-muted-foreground px-4 py-2 text-xs">Date</th>
                                <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs">Weight</th>
                                <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs hidden sm:table-cell">Body Fat</th>
                                <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs hidden md:table-cell">Chest</th>
                                <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs hidden md:table-cell">Waist</th>
                                <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs hidden lg:table-cell">Arms</th>
                                <th className="text-center font-medium text-muted-foreground px-3 py-2 text-xs hidden lg:table-cell">Thighs</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...rec.measurements].reverse().map((m, i) => (
                                <tr key={i} className="border-t border-border">
                                  <td className="px-4 py-2.5 font-medium">{format(new Date(m.date), "MMM d, yyyy")}</td>
                                  <td className="text-center px-3 py-2.5">{m.weight} kg</td>
                                  <td className="text-center px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{m.bodyFat != null ? `${m.bodyFat}%` : "—"}</td>
                                  <td className="text-center px-3 py-2.5 text-muted-foreground hidden md:table-cell">{m.chest ?? "—"}</td>
                                  <td className="text-center px-3 py-2.5 text-muted-foreground hidden md:table-cell">{m.waist ?? "—"}</td>
                                  <td className="text-center px-3 py-2.5 text-muted-foreground hidden lg:table-cell">{m.arms ?? "—"}</td>
                                  <td className="text-center px-3 py-2.5 text-muted-foreground hidden lg:table-cell">{m.thighs ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProgressTracker;
