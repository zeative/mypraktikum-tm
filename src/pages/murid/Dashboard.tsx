import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileText, LogOut, User, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Report {
  id: string;
  tanggal_kirim: string;
  status: string;
}

export default function MuridDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", profile.id)
      .order("tanggal_kirim", { ascending: false });

    if (data && !error) {
      setTotalReports(data.length);
      if (data.length > 0) {
        setLatestReport(data[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Murid</h1>
            <p className="text-muted-foreground">Selamat datang, {profile?.nama}!</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Info Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profil</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.nama}</div>
              <p className="text-xs text-muted-foreground">Kelas: {profile?.kelas || "-"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">Laporan terkirim</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Terakhir</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestReport ? latestReport.status : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {latestReport
                  ? format(new Date(latestReport.tanggal_kirim), "dd MMM yyyy", { locale: id })
                  : "Belum ada laporan"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Card */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Laporan Praktikum 5R
            </CardTitle>
            <CardDescription>
              Kirimkan laporan praktikum 5R Anda dengan mengisi form dan mengunggah foto Before & After
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-semibold">5R yang perlu dilaporkan:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Ringkas</strong> - Memilah dan membuang yang tidak perlu</li>
                <li>• <strong>Rapi</strong> - Menyusun dengan teratur</li>
                <li>• <strong>Resik</strong> - Membersihkan area kerja</li>
                <li>• <strong>Rawat</strong> - Merawat kondisi optimal</li>
                <li>• <strong>Rajin</strong> - Membiasakan disiplin</li>
              </ul>
            </div>
            
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate("/murid/laporan")}
            >
              <FileText className="mr-2 h-5 w-5" />
              Kirim Laporan Praktikum Baru
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
