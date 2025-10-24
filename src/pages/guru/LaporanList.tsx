import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, Calendar, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ReportWithProfile {
  id: string;
  tanggal_kirim: string;
  status: string;
  profiles: {
    nama: string;
    kelas: string | null;
  };
}

export default function GuruLaporanList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select(`
        id,
        tanggal_kirim,
        status,
        profiles:user_id (
          nama,
          kelas
        )
      `)
      .order("tanggal_kirim", { ascending: false });

    if (data && !error) {
      setReports(data as any);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/guru/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Daftar Laporan Praktikum Murid</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Memuat data...</p>
            ) : reports.length === 0 ? (
              <p className="text-center text-muted-foreground">Belum ada laporan masuk</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Murid</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Tanggal Kirim</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            {report.profiles.nama}
                          </div>
                        </TableCell>
                        <TableCell>{report.profiles.kelas || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(report.tanggal_kirim), "dd MMM yyyy, HH:mm", {
                              locale: id,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{report.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/guru/laporan/${report.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
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
      </div>
    </div>
  );
}
