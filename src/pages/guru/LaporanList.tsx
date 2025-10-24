import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, Calendar, User as UserIcon, Clock, CheckCircle2, AlertCircle, Filter, FileText } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [filteredReports, setFilteredReports] = useState<ReportWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    // Apply status filter
    if (statusFilter === "semua") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(report => report.status === statusFilter));
    }
  }, [reports, statusFilter]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DITERIMA":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "DIPROSES":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "DITOLAK":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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
          onClick={() => navigate("/guru/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Daftar Laporan Praktikum Murid</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="DITERIMA">Diterima</SelectItem>
                  <SelectItem value="DIPROSES">Diproses</SelectItem>
                  <SelectItem value="DITOLAK">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-muted-foreground">Belum ada laporan {statusFilter !== "semua" ? statusFilter.toLowerCase() : ""}</p>
              </div>
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
                    {filteredReports.map((report) => (
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
                          <div className="flex items-center gap-2">
                            {getStatusIcon(report.status)}
                            <Badge variant={getStatusVariant(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
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
