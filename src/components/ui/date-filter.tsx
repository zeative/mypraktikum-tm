import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Button } from "./button";
import { Calendar, Filter } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DateFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  initialFilterValue?: string;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, initialFilterValue = "semua" }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(initialFilterValue);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date = now;

    switch (value) {
      case "hari":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0); // Tanggal hari ini pukul 00:00
        endDate.setHours(23, 59, 59, 999); // Tanggal hari ini pukul 23:59
        break;
      case "minggu":
        // Awal minggu (Senin)
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day; // Jika hari Minggu (0), maka pindah ke Senin sebelumnya (-6 hari)
        startDate = new Date(now);
        startDate.setDate(now.getDate() + diffToMonday);
        startDate.setHours(0, 0, 0, 0); // Mulai dari pukul 00:00
        
        // Akhir minggu (Minggu)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999); // Sampai pukul 23:59
        break;
      case "bulan":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Awal bulan
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Akhir bulan
        endDate.setHours(23, 59, 59, 999);
        break;
      case "tahun":
        startDate = new Date(now.getFullYear(), 0, 1); // Awal tahun
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(now.getFullYear(), 11, 31); // Akhir tahun
        endDate.setHours(23, 59, 59, 999);
        break;
      case "semua":
      default:
        // Tidak ada filter, kembalikan null untuk startDate
        startDate = null;
        endDate = now;
        break;
    }

    // Panggil callback dengan rentang tanggal
    onFilterChange(
      startDate ? format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") : "",
      format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
    );
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
      </div>
      <Select value={selectedFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Pilih rentang waktu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Tanggal</SelectItem>
          <SelectItem value="hari">Hari Ini</SelectItem>
          <SelectItem value="minggu">Minggu Ini</SelectItem>
          <SelectItem value="bulan">Bulan Ini</SelectItem>
          <SelectItem value="tahun">Tahun Ini</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export { DateFilter };