import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

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
    }
    setLoading(false);
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
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Detail Laporan Praktikum 5R</CardTitle>
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
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="secondary" className="mt-1">
                {report.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Photos Grid */}
        <div className="space-y-6">
          {R_ITEMS.map((r) => {
            const beforeUrl = report[`${r.key}_before_url` as keyof ReportDetail] as string;
            const afterUrl = report[`${r.key}_after_url` as keyof ReportDetail] as string;

            return (
              <Card key={r.key} className="shadow-lg">
                <CardHeader>
                  <CardTitle>{r.label}</CardTitle>
                  <CardDescription>{r.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Before Photo */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Foto Before</h3>
                      <div className="overflow-hidden rounded-lg border-2 border-border bg-muted">
                        <img
                          src={beforeUrl}
                          alt={`${r.label} Before`}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* After Photo */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Foto After</h3>
                      <div className="overflow-hidden rounded-lg border-2 border-accent bg-muted">
                        <img
                          src={afterUrl}
                          alt={`${r.label} After`}
                          className="h-auto w-full object-cover"
                        />
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
