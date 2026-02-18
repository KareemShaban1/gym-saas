import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trainerApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClipboardList, Search } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  muscle_group?: string;
  equipment?: string;
  is_global?: boolean;
  description?: string;
}

export default function TrainerExercisesPage() {
  const [search, setSearch] = useState("");

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["trainer", "exercises"],
    queryFn: async () => {
      const res = await trainerApi.get<Exercise[] | { data: Exercise[] }>("/exercises?per_page=200");
      return Array.isArray(res) ? res : (res as { data?: Exercise[] }).data ?? [];
    },
  });

  const filtered = search.trim()
    ? exercises.filter(
        (e) =>
          e.name?.toLowerCase().includes(search.toLowerCase()) ||
          (e.muscle_group && e.muscle_group.toLowerCase().includes(search.toLowerCase())) ||
          (e.equipment && e.equipment.toLowerCase().includes(search.toLowerCase()))
      )
    : exercises;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Exercises</h1>
      <p className="text-muted-foreground text-sm">
        Browse exercises to use when building workout plans. Global and your gym exercises are listed.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, muscle group, equipment"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Available exercises ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exercises match. Try a different search.</p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((e) => (
                <li key={e.id} className="py-3">
                  <p className="font-medium">{e.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {e.muscle_group && (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted">{e.muscle_group}</span>
                    )}
                    {e.equipment && (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted">{e.equipment}</span>
                    )}
                    {e.is_global && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">Global</span>
                    )}
                  </div>
                  {e.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
