"use client";

import { useState, useEffect } from "react";
import { ChartAreaInteractive } from "~/components/dashboard/admin/chart-area-interactive";
import { SectionCards } from "~/components/dashboard/admin/section-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { PlusIcon, AlertCircle } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { MagicCard, Shimmer } from "~/components/ui/magic-card";

export default function DashboardPage() {
  const [hasError, setHasError] = useState(false);

  // Error handling for uncaught errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Error boundary fallback UI
  if (hasError) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="mx-auto max-w-2xl border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-destructive/10 p-3 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">Terjadi Kesalahan</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Terjadi kesalahan saat memuat data dashboard. Silakan coba refresh halaman.
            </p>
            <Button onClick={() => window.location.reload()} variant="destructive" className="font-semibold">
              Refresh Halaman
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Welcome Section with MagicCard */}
      <div className="px-4 lg:px-6">
        <MagicCard 
          className="mb-8 border-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 backdrop-blur-sm"
          gradientColor="rgba(59, 130, 246, 0.15)"
        >
          <div className="p-8 md:p-12">
            <div className="flex items-start gap-6 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  Dashboard Admin
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                  Kelola platform VBTicket dengan mudah dan efisien. Monitor aktivitas real-time dan kelola semua aspek platform.
                </p>
              </div>
            </div>
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status Sistem</p>
                    <p className="text-lg font-bold text-green-600">Aktif</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Events Aktif</p>
                    <p className="text-lg font-bold text-blue-600">24</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Organizers</p>
                    <p className="text-lg font-bold text-purple-600">156</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MagicCard>
      </div>

      {/* Section Cards */}
      <div className="px-4 lg:px-6">
        <SectionCards />
      </div>

      {/* Chart Area */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>      {/* Enhanced Table Section with MagicCard */}
      <div className="px-4 lg:px-6">
        <MagicCard 
          className="border-0 bg-background/50 backdrop-blur-sm shadow-2xl"
          gradientColor="rgba(148, 163, 184, 0.1)"
        >
          <CardContent className="p-8">
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-600 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Aktivitas Terbaru
                </h3>
                <p className="text-base text-muted-foreground">
                  Pantau aktivitas dan status terbaru di platform
                </p>
              </div>
              <Shimmer className="rounded-xl">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  <PlusIcon className="mr-3 h-5 w-5" />
                  Tambah Data
                </Button>
              </Shimmer>
            </div>

            <Tabs defaultValue="outline" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="outline" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="past-performance" className="text-xs sm:text-sm">
                  Performance
                  <span className="bg-primary/20 text-primary ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                    3
                  </span>
                </TabsTrigger>
                <TabsTrigger value="key-personnel" className="text-xs sm:text-sm">
                  Personnel
                  <span className="bg-primary/20 text-primary ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                    2
                  </span>
                </TabsTrigger>
                <TabsTrigger value="focus-documents" className="text-xs sm:text-sm">Documents</TabsTrigger>
              </TabsList>

              <div className="overflow-hidden rounded-lg border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Header</TableHead>
                      <TableHead className="font-semibold">Section Type</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Target</TableHead>
                      <TableHead className="text-right font-semibold">Limit</TableHead>
                      <TableHead className="font-semibold">Reviewer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">Table of Contents</TableCell>
                      <TableCell>Cover Page</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Done
                        </span>
                      </TableCell>
                      <TableCell className="text-right">10</TableCell>
                      <TableCell className="text-right">20</TableCell>
                      <TableCell>Eddie Lake</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">Executive Summary</TableCell>
                      <TableCell>Narrative</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          In Progress
                        </span>
                      </TableCell>
                      <TableCell className="text-right">15</TableCell>
                      <TableCell className="text-right">25</TableCell>
                      <TableCell>Jamik Tashpulatov</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">Technical Approach</TableCell>
                      <TableCell>Design</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Not Started
                        </span>
                      </TableCell>
                      <TableCell className="text-right">20</TableCell>
                      <TableCell className="text-right">30</TableCell>
                      <TableCell>Emily Whalen</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>              </div>
            </Tabs>
          </CardContent>
        </MagicCard>
      </div>
    </div>
  );
}
