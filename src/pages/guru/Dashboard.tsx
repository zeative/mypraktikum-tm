import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileText, LogOut, Users, ClipboardList } from "lucide-react";

export default function GuruDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [totalReports, setTotalReports] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchStats();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Guru</h1>
            <p className="text-muted-foreground">Selamat datang, {profile?.nama}!</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Murid</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Murid terdaftar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">Laporan masuk</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Card */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Kelola Laporan Praktikum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Lihat dan evaluasi semua laporan praktikum 5R yang telah dikirim oleh murid-murid Anda.
            </p>
            
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate("/guru/laporan")}
            >
              <FileText className="mr-2 h-5 w-5" />
              Lihat Semua Laporan Murid
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
