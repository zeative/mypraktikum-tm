import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  LogOut, 
  User, 
  Calendar, 
  CheckCircle2, 
  GraduationCap,
  Eye,
  AlertCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/dashboard";

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
  const [reports, setReports] = useState<Report[]>([]);

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
      setReports(data);
      setTotalReports(data.length);
      if (data.length > 0) {
        setLatestReport(data[0]);
      }
    }
  };

  const handleReportClick = (report: Report) => {
    // For now, we'll navigate to a view report page if it exists
    // In a real implementation, you might want to show a modal or detailed view
    console.log("View report:", report);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard Murid</h1>
            <p className="text-slate-600 dark:text-slate-300">Selamat datang, {profile?.nama}!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <User className="h-4 w-4" />
              <span>{profile?.kelas || "Tidak ada kelas"}</span>
            </div>
            <Button variant="outline" onClick={signOut} className="h-10">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mb-8 grid gap-5 md:grid-cols-1 lg:grid-cols-3">
          <StatsCard
            title="Profil Saya"
            value={profile?.nama || "-"}
            subtitle={`Kelas: ${profile?.kelas || "Tidak ada data"}`}
            icon={<User className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            color="text-slate-800 dark:text-white"
          />

          <StatsCard
            title="Total Laporan"
            value={totalReports}
            subtitle="Laporan terkirim"
            icon={<FileText className="h-4 w-4 text-green-600 dark:text-green-400" />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            color="text-slate-800 dark:text-white"
          />

          <StatsCard
            title="Status Terakhir"
            value={latestReport ? latestReport.status : "-"}
            subtitle={latestReport
              ? format(new Date(latestReport.tanggal_kirim), "dd MMM yyyy", { locale: id })
              : "Belum ada laporan"}
            icon={<CheckCircle2 className={`h-4 w-4 ${latestReport && latestReport.status === 'DITERIMA' ? 'text-green-600 dark:text-green-400' : latestReport && latestReport.status === 'DIPROSES' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`} />}
            iconBg={latestReport && latestReport.status === 'DITERIMA' ? 'bg-green-100 dark:bg-green-900/30' : latestReport && latestReport.status === 'DIPROSES' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}
            color={latestReport && latestReport.status === 'DITERIMA' ? 'text-green-600 dark:text-green-400' : latestReport && latestReport.status === 'DIPROSES' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}
          />
        </div>

        {/* Main Action Card */}
        <Card className="border-0 bg-white/80 dark:bg-slate-800/90 shadow-xl backdrop-blur-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-white">
                <FileText className="h-6 w-6 flex-shrink-0" />
                <span>Laporan Praktikum 5R</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Kirimkan laporan praktikum 5R Anda dengan mengisi form dan mengunggah foto Before & After
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className="pt-6 space-y-5">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/30 p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Konsep 5R
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="font-medium mr-2 text-blue-600 dark:text-blue-400">• Ringkas:</span>
                  <span>Memilah dan membuang yang tidak perlu</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2 text-blue-600 dark:text-blue-400">• Rapi:</span>
                  <span>Menyusun dengan teratur</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2 text-blue-600 dark:text-blue-400">• Resik:</span>
                  <span>Membersihkan area kerja</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2 text-blue-600 dark:text-blue-400">• Rawat:</span>
                  <span>Merawat kondisi optimal</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2 text-blue-600 dark:text-blue-400">• Rajin:</span>
                  <span>Membiasakan disiplin</span>
                </li>
              </ul>
            </div>
            
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-12 text-base"
              onClick={() => navigate("/murid/laporan/form")}
            >
              <FileText className="mr-2 h-5 w-5" />
              Kirim Laporan Praktikum Baru
            </Button>
          </CardContent>
        </Card>

        {/* Report History */}
        <Card className="shadow-md border-0 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Riwayat Laporan
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/murid/laporan")}
              >
                Lihat Semua
              </Button>
            </CardTitle>
            <CardDescription>Daftar laporan praktikum 5R yang telah Anda kirim</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p>Belum ada laporan yang dikirim</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal Kirim</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right\">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.slice(0, 5).map((report) => ( // Menampilkan hanya 5 laporan terbaru
                      <TableRow 
                        key={report.id} 
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        onClick={() => handleReportClick(report)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(report.tanggal_kirim), "dd MMM yyyy, HH:mm", {
                              locale: id,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={report.status === "DITERIMA" ? "default" : 
                                    report.status === "DIPROSES" ? "secondary" : 
                                    "destructive"}
                          >
                            {report.status === "DITERIMA" ? (
                              <>
                                <CheckCircle2 className="mr-1 h-3 w-3" /> DITERIMA
                              </>
                            ) : report.status === "DIPROSES" ? (
                              <>
                                <Clock className="mr-1 h-3 w-3" /> DIPROSES
                              </>
                            ) : (
                              <>
                                <AlertCircle className="mr-1 h-3 w-3" /> DITOLAK
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" /> Lihat
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Sistem Laporan Praktikum 5R - Selalu jaga semangat belajar!</p>
        </div>
      </div>
    </div>
  );
}
