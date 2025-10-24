import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileText, LogOut, Users, ClipboardList, Eye, GraduationCap } from "lucide-react";
import { StudentListTable, StatsCard } from "@/components/ui/dashboard";

interface Student {
  id: string;
  nama: string;
  kelas: string | null;
  email: string;
  created_at: string;
}

export default function GuruDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [totalReports, setTotalReports] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStats();
    fetchStudents();
  }, []);

  const fetchStats = async () => {
    // Fetch total reports
    const { count: reportsCount } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true });

    // Fetch total students
    const { count: studentsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "MURID");

    setTotalReports(reportsCount || 0);
    setTotalStudents(studentsCount || 0);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nama, kelas, email, created_at")
      .eq("role", "MURID")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setStudents(data);
    }
  };

  const handleStudentClick = (student: Student) => {
    // For now, we'll just log the student clicked
    // In a real implementation, you might navigate to a student detail page
    console.log("View student:", student);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard Guru</h1>
            <p className="text-slate-600 dark:text-slate-300">Selamat datang, {profile?.nama}!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <GraduationCap className="h-4 w-4" />
              <span>Admin</span>
            </div>
            <Button variant="outline" onClick={signOut} className="h-10">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-5 md:grid-cols-1 lg:grid-cols-2">
          <StatsCard
            title="Total Murid"
            value={totalStudents}
            subtitle="Murid terdaftar"
            icon={<Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            color="text-slate-800 dark:text-white"
          />

          <StatsCard
            title="Total Laporan"
            value={totalReports}
            subtitle="Laporan masuk"
            icon={<FileText className="h-4 w-4 text-green-600 dark:text-green-400" />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            color="text-slate-800 dark:text-white"
          />
        </div>

        {/* Main Action Card */}
        <Card className="border-0 bg-white/80 dark:bg-slate-800/90 shadow-xl backdrop-blur-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-white">
                <ClipboardList className="h-6 w-6 flex-shrink-0" />
                <span>Kelola Laporan Praktikum</span>
              </CardTitle>
            </CardHeader>
          </div>
          <CardContent className="pt-6 space-y-5">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/30 p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Fitur Evaluasi
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Lihat dan evaluasi semua laporan praktikum 5R yang telah dikirim oleh murid-murid Anda. 
                Berikan feedback dan penilaian untuk membantu perkembangan mereka.
              </p>
            </div>
            
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 h-12 text-base"
              onClick={() => navigate("/guru/laporan")}
            >
              <FileText className="mr-2 h-5 w-5" />
              Lihat Semua Laporan Murid
            </Button>
          </CardContent>
        </Card>

        {/* Student List */}
        <StudentListTable 
          students={students} 
          onRowClick={handleStudentClick}
        />
        
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Sistem Laporan Praktikum 5R - Membangun Generasi Disiplin dan Bertanggung Jawab</p>
        </div>
      </div>
    </div>
  );
}
