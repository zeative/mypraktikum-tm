import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./table";
import { 
  FileText, 
  Users, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  GraduationCap
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Report {
  id: string;
  tanggal_kirim: string;
  status: string;
  profiles?: {
    nama: string;
    kelas: string | null;
  };
}

interface Student {
  id: string;
  nama: string;
  kelas: string | null;
  email: string;
  created_at: string;
}

interface ReportHistoryTableProps {
  reports: Report[];
  onRowClick?: (report: Report) => void;
}

export const ReportHistoryTable: React.FC<ReportHistoryTableProps> = ({ 
  reports, 
  onRowClick 
}) => {
  return (
    <Card className="shadow-md border-0 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Riwayat Laporan
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
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow 
                    key={report.id} 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    onClick={() => onRowClick && onRowClick(report)}
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
  );
};

interface StudentListTableProps {
  students: Student[];
  onRowClick?: (student: Student) => void;
}

export const StudentListTable: React.FC<StudentListTableProps> = ({ 
  students, 
  onRowClick 
}) => {
  return (
    <Card className="shadow-md border-0 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Daftar Murid
        </CardTitle>
        <CardDescription>Daftar murid yang terdaftar dalam sistem</CardDescription>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Users className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p>Belum ada murid yang terdaftar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Terdaftar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow 
                    key={student.id} 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    onClick={() => onRowClick && onRowClick(student)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {student.nama}
                      </div>
                    </TableCell>
                    <TableCell>{student.kelas || "-"}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(student.created_at), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  color: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconBg, 
  color 
}) => {
  return (
    <Card className="shadow-md border-0 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold ${color}`}>
          {value}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
};