import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, User, Loader2, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportDetail {
  id: string;
  tanggal_kirim: string;
  status: string;
  ringkas_before_url: string;
  ringkas_after_url: string;
  rapi_before_url: string;
  rapi_after_url: string;
  resik_before_url: string;
  resik_after_url: string;
  rawat_before_url: string;
  rawat_after_url: string;
  rajin_before_url: string;
  rajin_after_url: string;
  profiles: {
    nama: string;
    kelas: string | null;
  };
}

const R_ITEMS = [
  { key: "ringkas", label: "Ringkas", description: "Memilah dan membuang yang tidak perlu" },
  { key: "rapi", label: "Rapi", description: "Menyusun dengan teratur" },
  { key: "resik", label: "Resik", description: "Membersihkan area kerja" },
  { key: "rawat", label: "Rawat", description: "Merawat kondisi optimal" },
  { key: "rajin", label: "Rajin", description: "Membiasakan disiplin" },
];

export default function GuruLaporanDetail() {
  const { id: reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    if (reportId) {
      fetchReportDetail();
    }
  }, [reportId]);

  const fetchReportDetail = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        profiles:user_id (
          nama,
          kelas
        )
      `)
      .eq("id", reportId)
      .single();

    if (data && !error) {
      setReport(data as any);
      setNewStatus(data.status);
    }
    setLoading(false);
  };

  const handleStatusChange = async (value: string) => {
    if (!reportId) return;
    
    // Update status in the database
    const { error } = await supabase
      .from("reports")
      .update({ status: value })
      .eq("id", reportId);

    if (!error) {
      setNewStatus(value);
      // Update local state
      if (report) {
        setReport({ ...report, status: value });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Laporan tidak ditemukan</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DITERIMA":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "DIPROSES":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "DITOLAK":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DITERIMA":
        return "default";
      case "DIPROSES":
        return "secondary";
      case "DITOLAK":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/guru/laporan")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        {/* Report Header */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Detail Laporan Praktikum 5R
                </CardTitle>
                <CardDescription>Laporan praktikum dari murid {report.profiles.nama}</CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(report.status)}
                  <Badge variant={getStatusVariant(report.status)}>
                    {report.status}
                  </Badge>
                </div>
                
                <Select value={newStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ubah status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIPROSES">Diproses</SelectItem>
                    <SelectItem value="DITERIMA">Diterima</SelectItem>
                    <SelectItem value="DITOLAK">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nama Murid</p>
                  <p className="font-semibold">{report.profiles.nama}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kelas</p>
                <p className="font-semibold">{report.profiles.kelas || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Kirim</p>
                  <p className="font-semibold">
                    {format(new Date(report.tanggal_kirim), "dd MMMM yyyy, HH:mm", {
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Photos Grid */}
        <div className="space-y-6">
          {R_ITEMS.map((r) => {
            const beforeUrl = report[`${r.key}_before_url` as keyof ReportDetail] as string;
            const afterUrl = report[`${r.key}_after_url` as keyof ReportDetail] as string;

            return (
              <Card key={r.key} className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{r.label}</CardTitle>
                  <CardDescription>{r.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Before Photo */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Foto Before</h3>
                      <div className="overflow-hidden rounded-lg border-2 border-border bg-muted aspect-[4/3] flex items-center justify-center">
                        {beforeUrl ? (
                          <img
                            src={beforeUrl}
                            alt={`${r.label} Before`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-4 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-2" />
                            <p>Foto tidak tersedia</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* After Photo */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Foto After</h3>
                      <div className="overflow-hidden rounded-lg border-2 border-accent bg-muted aspect-[4/3] flex items-center justify-center">
                        {afterUrl ? (
                          <img
                            src={afterUrl}
                            alt={`${r.label} After`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-4 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-2" />
                            <p>Foto tidak tersedia</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
