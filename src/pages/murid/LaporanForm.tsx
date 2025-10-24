import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, Loader2, CheckCircle2, X } from "lucide-react";
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

  const [previewUrls, setPreviewUrls] = useState<{
    [key: string]: { before: string | null; after: string | null };
  }>({
    ringkas: { before: null, after: null },
    rapi: { before: null, after: null },
    resik: { before: null, after: null },
    rawat: { before: null, after: null },
    rajin: { before: null, after: null },
  });

  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      Object.values(previewUrls).forEach(photoSet => {
        if (photoSet.before) URL.revokeObjectURL(photoSet.before);
        if (photoSet.after) URL.revokeObjectURL(photoSet.after);
      });
    };
  }, []);

  const handleFileChange = (rKey: string, type: "before" | "after", file: File | null) => {
    // Revoke previous preview URL if exists
    if (previewUrls[rKey][type]) {
      URL.revokeObjectURL(previewUrls[rKey][type]!);
    }

    // Create new preview URL if file exists
    let newPreviewUrl: string | null = null;
    if (file) {
      newPreviewUrl = URL.createObjectURL(file);
    }

    setPhotos((prev) => ({
      ...prev,
      [rKey]: { ...prev[rKey], [type]: file },
    }));

    setPreviewUrls((prev) => ({
      ...prev,
      [rKey]: { ...prev[rKey], [type]: newPreviewUrl },
    }));
  };

  const removeFile = (rKey: string, type: "before" | "after") => {
    // Revoke preview URL if exists
    if (previewUrls[rKey][type]) {
      URL.revokeObjectURL(previewUrls[rKey][type]!);
    }

    setPhotos((prev) => ({
      ...prev,
      [rKey]: { ...prev[rKey], [type]: null },
    }));

    setPreviewUrls((prev) => ({
      ...prev,
      [rKey]: { ...prev[rKey], [type]: null },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
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

        <Card className="border-0 bg-white/80 dark:bg-slate-800/90 shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-2xl">Form Laporan Praktikum 5R</CardTitle>
              <CardDescription className="text-blue-100">
                Upload foto Before dan After untuk setiap kategori 5R
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Info */}
              <div className="grid gap-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 p-4 md:grid-cols-2 border border-slate-200 dark:border-slate-700">
                <div>
                  <Label className="text-sm text-slate-600 dark:text-slate-300">Nama</Label>
                  <p className="font-semibold text-slate-800 dark:text-white">{profile?.nama}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-600 dark:text-slate-300">Kelas</Label>
                  <p className="font-semibold text-slate-800 dark:text-white">{profile?.kelas || "-"}</p>
                </div>
              </div>

              {/* Photo Upload Sections */}
              {R_ITEMS.map((r) => (
                <Card key={r.key} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg text-slate-800 dark:text-white">
                      {r.label}
                      {uploadProgress[r.key] && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      {r.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Before Photo */}
                      <div className="space-y-2">
                        <Label htmlFor={`${r.key}-before`} className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <Upload className="h-4 w-4" />
                          Foto Before
                        </Label>
                        
                        {/* Preview Container */}
                        {previewUrls[r.key].before ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                            <img 
                              src={previewUrls[r.key].before} 
                              alt={`Preview Before ${r.label}`} 
                              className="w-full h-full object-contain"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full"
                              onClick={() => removeFile(r.key, "before")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full h-48 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30">
                            <span className="text-center px-4">Upload foto before</span>
                          </div>
                        )}
                        
                        <Input
                          id={`${r.key}-before`}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(r.key, "before", e.target.files?.[0] || null)
                          }
                          disabled={isSubmitting}
                          className="mt-2"
                        />
                        {photos[r.key].before && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            ✓ {photos[r.key].before!.name}
                          </p>
                        )}
                      </div>

                      {/* After Photo */}
                      <div className="space-y-2">
                        <Label htmlFor={`${r.key}-after`} className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <Upload className="h-4 w-4" />
                          Foto After
                        </Label>
                        
                        {/* Preview Container */}
                        {previewUrls[r.key].after ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                            <img 
                              src={previewUrls[r.key].after} 
                              alt={`Preview After ${r.label}`} 
                              className="w-full h-full object-contain"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full"
                              onClick={() => removeFile(r.key, "after")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full h-48 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30">
                            <span className="text-center px-4">Upload foto after</span>
                          </div>
                        )}
                        
                        <Input
                          id={`${r.key}-after`}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(r.key, "after", e.target.files?.[0] || null)
                          }
                          disabled={isSubmitting}
                          className="mt-2"
                        />
                        {photos[r.key].after && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            ✓ {photos[r.key].after!.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-12 text-base"
                disabled={isSubmitting}
              >
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
