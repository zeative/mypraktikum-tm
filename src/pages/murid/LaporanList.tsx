import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { DateFilter } from "@/components/ui/date-filter";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye
} from "lucide-react";

interface Report {
  id: string;
  tanggal_kirim: string;
  status: string;
}

export default function MuridLaporanList() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ 
    startDate: "", 
    endDate: new Date().toISOString() 
  });

  useEffect(() => {
    fetchReports();
  }, [profile]);

  useEffect(() => {
    // Apply date filter
    if (dateRange.startDate && dateRange.endDate) {
      const filtered = reports.filter(report => {
        const reportDate = new Date(report.tanggal_kirim);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return reportDate >= startDate && reportDate <= endDate;
      });
      setFilteredReports(filtered);
    } else {
      // If no date range specified, show all reports
      setFilteredReports(reports);
    }
  }, [reports, dateRange]);

  const fetchReports = async () => {
    if (!profile) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", profile.id)
      .order("tanggal_kirim", { ascending: false });

    if (data && !error) {
      setReports(data);
    }
    setLoading(false);
  };

  const handleReportClick = (report: Report) => {
    console.log("View report:", report);
    // Navigasi ke halaman detail laporan jika sudah tersedia
  };

  const handleDateFilterChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
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
          onClick={() => navigate("/murid/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Riwayat Laporan Praktikum</CardTitle>
            <DateFilter onFilterChange={handleDateFilterChange} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-muted-foreground">Belum ada laporan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal Kirim</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
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
                          <div className="flex items-center gap-2">
                            {getStatusIcon(report.status)}
                            <Badge variant={getStatusVariant(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat
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