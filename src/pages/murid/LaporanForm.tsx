import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const R_ITEMS = [
  { key: "ringkas", label: "Ringkas", description: "Memilah dan membuang yang tidak perlu" },
  { key: "rapi", label: "Rapi", description: "Menyusun dengan teratur" },
  { key: "resik", label: "Resik", description: "Membersihkan area kerja" },
  { key: "rawat", label: "Rawat", description: "Merawat kondisi optimal" },
  { key: "rajin", label: "Rajin", description: "Membiasakan disiplin" },
];

export default function LaporanForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});
  
  const [photos, setPhotos] = useState<{
    [key: string]: { before: File | null; after: File | null };
  }>({
    ringkas: { before: null, after: null },
    rapi: { before: null, after: null },
    resik: { before: null, after: null },
    rawat: { before: null, after: null },
    rajin: { before: null, after: null },
  });

  const handleFileChange = (rKey: string, type: "before" | "after", file: File | null) => {
    setPhotos((prev) => ({
      ...prev,
      [rKey]: { ...prev[rKey], [type]: file },
    }));
  };

  const uploadPhoto = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("laporan-praktikum")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("laporan-praktikum")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all photos are uploaded
    for (const r of R_ITEMS) {
      if (!photos[r.key].before || !photos[r.key].after) {
        toast.error(`Mohon lengkapi foto Before dan After untuk ${r.label}`);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const timestamp = Date.now();
      const userId = profile?.id;
      const photoUrls: { [key: string]: string } = {};

      // Upload all photos
      for (const r of R_ITEMS) {
        setUploadProgress((prev) => ({ ...prev, [r.key]: true }));
        
        const beforeFile = photos[r.key].before!;
        const afterFile = photos[r.key].after!;

        const beforePath = `${userId}/${timestamp}/${r.key}_before_${beforeFile.name}`;
        const afterPath = `${userId}/${timestamp}/${r.key}_after_${afterFile.name}`;

        photoUrls[`${r.key}_before_url`] = await uploadPhoto(beforeFile, beforePath);
        photoUrls[`${r.key}_after_url`] = await uploadPhoto(afterFile, afterPath);
      }

      // Insert report
      const { error } = await supabase.from("reports").insert({
        user_id: userId,
        ...photoUrls,
        status: "Dikirim",
      });

      if (error) throw error;

      toast.success("Laporan berhasil dikirim!");
      navigate("/murid/dashboard");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Gagal mengirim laporan");
    } finally {
      setIsSubmitting(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/murid/dashboard")}
          className="mb-4"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Form Laporan Praktikum 5R</CardTitle>
            <CardDescription>
              Upload foto Before dan After untuk setiap kategori 5R
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Info */}
              <div className="grid gap-4 rounded-lg bg-muted p-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Nama</Label>
                  <p className="font-semibold">{profile?.nama}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Kelas</Label>
                  <p className="font-semibold">{profile?.kelas || "-"}</p>
                </div>
              </div>

              {/* Photo Upload Sections */}
              {R_ITEMS.map((r) => (
                <Card key={r.key} className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      {r.label}
                      {uploadProgress[r.key] && (
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                      )}
                    </CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {/* Before Photo */}
                    <div className="space-y-2">
                      <Label htmlFor={`${r.key}-before`} className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Foto Before
                      </Label>
                      <Input
                        id={`${r.key}-before`}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(r.key, "before", e.target.files?.[0] || null)
                        }
                        disabled={isSubmitting}
                        required
                      />
                      {photos[r.key].before && (
                        <p className="text-xs text-muted-foreground">
                          ✓ {photos[r.key].before!.name}
                        </p>
                      )}
                    </div>

                    {/* After Photo */}
                    <div className="space-y-2">
                      <Label htmlFor={`${r.key}-after`} className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Foto After
                      </Label>
                      <Input
                        id={`${r.key}-after`}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(r.key, "after", e.target.files?.[0] || null)
                        }
                        disabled={isSubmitting}
                        required
                      />
                      {photos[r.key].after && (
                        <p className="text-xs text-muted-foreground">
                          ✓ {photos[r.key].after!.name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mengirim Laporan...
                  </>
                ) : (
                  "Kirim Laporan"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
