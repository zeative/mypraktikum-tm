import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid").trim(),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const registerSchema = z.object({
  email: z.string().email("Email tidak valid").trim(),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nama: z.string().min(3, "Nama minimal 3 karakter").trim(),
  role: z.enum(["GURU", "MURID"]),
  kelas: z.string().optional(),
}).refine((data) => {
  if (data.role === "MURID" && !data.kelas) {
    return false;
  }
  return true;
}, {
  message: "Kelas wajib diisi untuk Murid",
  path: ["kelas"],
});

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [role, setRole] = useState<"GURU" | "MURID">("MURID");
  const [kelas, setKelas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; nama?: string; kelas?: string; role?: string }>({});
  const { signIn, signUp, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      // Redirect based on role
      if (profile.role === "GURU") {
        navigate("/guru/dashboard");
      } else {
        navigate("/murid/dashboard");
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      if (isRegister) {
        // Validate registration input
        const validated = registerSchema.parse({ email, password, nama, role, kelas: kelas || undefined });
        
        setIsLoading(true);
        await signUp(validated.email, validated.password, validated.nama, validated.role, validated.kelas);
        
        // Switch to login mode after successful registration
        setIsRegister(false);
        setPassword("");
      } else {
        // Validate login input
        const validated = loginSchema.parse({ email, password });
        
        setIsLoading(true);
        await signIn(validated.email, validated.password);
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {isRegister ? "Daftar Akun Baru" : "Laporan Praktikum 5R"}
            </CardTitle>
            <CardDescription className="mt-2">
              {isRegister ? "Buat akun untuk mengakses sistem" : "Sistem Pelaporan Lab untuk Guru dan Murid"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    type="text"
                    placeholder="Nama lengkap Anda"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    disabled={isLoading}
                    className={errors.nama ? "border-destructive" : ""}
                  />
                  {errors.nama && (
                    <p className="text-sm text-destructive">{errors.nama}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Daftar Sebagai</Label>
                  <Select value={role} onValueChange={(value: "GURU" | "MURID") => setRole(value)} disabled={isLoading}>
                    <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MURID">Murid</SelectItem>
                      <SelectItem value="GURU">Guru</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role}</p>
                  )}
                </div>
                
                {role === "MURID" && (
                  <div className="space-y-2">
                    <Label htmlFor="kelas">Kelas</Label>
                    <Input
                      id="kelas"
                      type="text"
                      placeholder="Contoh: X-A, XI IPA 1"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      disabled={isLoading}
                      className={errors.kelas ? "border-destructive" : ""}
                    />
                    {errors.kelas && (
                      <p className="text-sm text-destructive">{errors.kelas}</p>
                    )}
                  </div>
                )}
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@sekolah.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                isRegister ? "Daftar" : "Login"
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrors({});
              }}
              disabled={isLoading}
              className="text-sm"
            >
              {isRegister ? "Sudah punya akun? Login" : "Belum punya akun? Daftar"}
            </Button>
          </div>
          
          {!isRegister && (
            <div className="mt-6 space-y-2 rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold">Akun Testing:</p>
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  <strong>Guru:</strong> guru.budi@sekolah.edu / GuruPass123
                </p>
                <p className="text-muted-foreground">
                  <strong>Murid:</strong> murid.maya@sekolah.edu / MuridPass456
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
