import { useState } from "react";
import { Exercise, MuscleGroup, muscleGroups } from "@/data/workouts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Dumbbell, Globe, Building2, Pencil, Trash2 } from "lucide-react";

interface ExerciseLibraryProps {
  exercises: Exercise[];
  onAdd: (formData: FormData) => void;
  onUpdate?: (id: number, formData: FormData) => void;
  onDelete?: (id: number) => void;
}

const ExerciseLibrary = ({ exercises, onAdd, onUpdate, onDelete }: ExerciseLibraryProps) => {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "All">("All");
  const [formOpen, setFormOpen] = useState(false);
  const [viewExercise, setViewExercise] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>("Chest");
  const [newEquipment, setNewEquipment] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [gifFile, setGifFile] = useState<File | null>(null);

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.equipment.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscleFilter === "All" || e.muscleGroup === muscleFilter;
    return matchSearch && matchMuscle;
  });

  const openAddForm = () => {
    setEditingExercise(null);
    setNewName(""); setNewEquipment(""); setNewDesc("");
    setImageFile(null); setVideoFile(null); setGifFile(null);
    setNewMuscle("Chest");
    setFormOpen(true);
  };

  const openEditForm = (ex: Exercise) => {
    setEditingExercise(ex);
    setNewName(ex.name); setNewMuscle(ex.muscleGroup); setNewEquipment(ex.equipment);
    setNewDesc(ex.description ?? "");
    setImageFile(null); setVideoFile(null); setGifFile(null);
    setFormOpen(true);
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append("name", newName);
    fd.append("muscle_group", newMuscle);
    fd.append("equipment", newEquipment);
    fd.append("description", newDesc);
    if (imageFile) fd.append("image", imageFile);
    if (videoFile) fd.append("video", videoFile);
    if (gifFile) fd.append("gif", gifFile);
    return fd;
  };

  const handleAdd = () => {
    if (!newName || !newEquipment) return;
    const formData = buildFormData();
    if (editingExercise && onUpdate) {
      onUpdate(editingExercise.id, formData);
      setEditingExercise(null);
    } else {
      onAdd(formData);
    }
    setFormOpen(false);
    setNewName(""); setNewEquipment(""); setNewDesc("");
    setImageFile(null); setVideoFile(null); setGifFile(null);
  };

  const handleDelete = (ex: Exercise) => {
    if (onDelete) onDelete(ex.id);
    setViewExercise(null);
  };

  const grouped = muscleGroups.reduce((acc, mg) => {
    const items = filtered.filter((e) => e.muscleGroup === mg);
    if (items.length > 0) acc.push({ group: mg, items });
    return acc;
  }, [] as { group: MuscleGroup; items: Exercise[] }[]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search exercises..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={muscleFilter} onValueChange={(v) => setMuscleFilter(v as MuscleGroup | "All")}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Muscle Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Groups</SelectItem>
              {muscleGroups.map((mg) => <SelectItem key={mg} value={mg}>{mg}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={openAddForm}>
            <Plus className="w-3.5 h-3.5" /> Add Exercise
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} exercises</div>

      <div className="space-y-4">
        {grouped.map(({ group, items }) => (
          <div key={group}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {items.map((ex) => (
                <div
                  key={ex.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setViewExercise(ex)}
                  onKeyDown={(e) => e.key === "Enter" && setViewExercise(ex)}
                  className="rounded-lg border border-border bg-card p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {ex.imageUrl || ex.gifUrl ? (
                      <img src={ex.imageUrl || ex.gifUrl || ""} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Dumbbell className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.equipment}</p>
                  </div>
                  <div className="shrink-0" aria-label={ex.isGlobal ? "Global" : "Custom"}>
                    {ex.isGlobal
                      ? <Globe className="w-3.5 h-3.5 text-info" />
                      : <Building2 className="w-3.5 h-3.5 text-primary" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No exercises found.</p>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingExercise ? "Edit Exercise" : "Add Custom Exercise"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Exercise Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Landmine Press" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Muscle Group</Label>
                <Select value={newMuscle} onValueChange={(v) => setNewMuscle(v as MuscleGroup)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((mg) => <SelectItem key={mg} value={mg}>{mg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Equipment</Label>
                <Input value={newEquipment} onChange={(e) => setNewEquipment(e.target.value)} placeholder="e.g. Barbell" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Media (optional)</Label>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Image (JPEG, PNG, WebP, max 5MB)</span>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="cursor-pointer"
                />
                {imageFile && <span className="text-xs text-muted-foreground">{imageFile.name}</span>}
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Video (MP4, WebM, MOV, max 50MB)</span>
                <Input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  className="cursor-pointer"
                />
                {videoFile && <span className="text-xs text-muted-foreground">{videoFile.name}</span>}
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">GIF (max 10MB)</span>
                <Input
                  type="file"
                  accept="image/gif"
                  onChange={(e) => setGifFile(e.target.files?.[0] ?? null)}
                  className="cursor-pointer"
                />
                {gifFile && <span className="text-xs text-muted-foreground">{gifFile.name}</span>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFormOpen(false); setEditingExercise(null); }}>Cancel</Button>
            <Button variant="hero" onClick={handleAdd} disabled={!newName || !newEquipment}>
              {editingExercise ? "Save" : "Add Exercise"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewExercise} onOpenChange={(open) => !open && setViewExercise(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewExercise?.name}</DialogTitle>
          </DialogHeader>
          {viewExercise && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground"><span className="font-medium">Muscle group:</span> {viewExercise.muscleGroup}</p>
              <p className="text-sm text-muted-foreground"><span className="font-medium">Equipment:</span> {viewExercise.equipment}</p>
              {viewExercise.description && <p className="text-sm">{viewExercise.description}</p>}
              <div className="flex flex-wrap gap-2">
                {viewExercise.imageUrl && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Image</span>
                    <img src={viewExercise.imageUrl} alt={viewExercise.name} className="rounded-md max-h-48 w-auto object-contain bg-muted" />
                  </div>
                )}
                {viewExercise.gifUrl && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">GIF</span>
                    <img src={viewExercise.gifUrl} alt={viewExercise.name} className="rounded-md max-h-48 w-auto object-contain bg-muted" />
                  </div>
                )}
                {viewExercise.videoUrl && (
                  <div className="space-y-1 w-full">
                    <span className="text-xs text-muted-foreground">Video</span>
                    <video src={viewExercise.videoUrl} controls className="rounded-md w-full max-h-48 bg-muted" />
                  </div>
                )}
              </div>
              {!viewExercise.isGlobal && (onUpdate || onDelete) && (
                <div className="flex gap-2 pt-2">
                  {onUpdate && (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { openEditForm(viewExercise); setViewExercise(null); setFormOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => handleDelete(viewExercise)}>
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseLibrary;
