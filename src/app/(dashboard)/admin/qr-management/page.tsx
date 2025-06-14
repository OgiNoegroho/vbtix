"use client";

import { useState } from "react";
import { AdminRoute } from "~/components/auth/admin-route";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useTransactionQRGeneration, useBatchQROperations } from "~/lib/api/hooks/qr-code";
import {
  QrCode,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Settings,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export default function QRManagementPage() {
  const [transactionId, setTransactionId] = useState("");
  const [batchTransactionIds, setBatchTransactionIds] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [batchResults, setBatchResults] = useState<any>(null);

  const { generateQRCodes } = useTransactionQRGeneration();
  const { generateBatchQRCodes } = useBatchQROperations();

  const handleSingleGeneration = async () => {
    if (!transactionId.trim()) {
      toast.error("Please enter a transaction ID");
      return;
    }

    setIsGenerating(true);
    setResults(null);

    try {
      const result = await generateQRCodes(transactionId);
      setResults(result);
      
      if (result.success) {
        toast.success(`Generated ${result.data.generatedCount} QR codes`);
      } else {
        toast.error("Failed to generate QR codes");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGeneration = async () => {
    const ids = batchTransactionIds
      .split("\n")
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (ids.length === 0) {
      toast.error("Please enter at least one transaction ID");
      return;
    }

    setIsBatchGenerating(true);
    setBatchResults(null);

    try {
      const result = await generateBatchQRCodes(ids);
      setBatchResults(result);
      
      toast.success(
        `Processed ${result.totalProcessed} transactions. ${result.successCount} successful, ${result.failureCount} failed.`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Batch generation failed");
    } finally {
      setIsBatchGenerating(false);
    }
  };

  return (
    <AdminRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="px-4 lg:px-6">
          <MagicCard
            className="border-0 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 backdrop-blur-sm"
            gradientColor="rgba(147, 51, 234, 0.15)"
          >
            <div className="p-8 md:p-12">
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg">
                  <QrCode className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent mb-3">
                    QR Code Management
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                    Generate, manage, and monitor QR codes for ticket verification and event check-ins.
                  </p>
                </div>
              </div>
            </div>
          </MagicCard>
        </div>

        {/* Main Content */}
        <div className="px-4 lg:px-6">
          <Tabs defaultValue="single" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Single Generation
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Batch Generation
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Single Generation */}
            <TabsContent value="single" className="space-y-6">
              <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Generate QR Codes for Transaction</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transaction-id">Transaction ID</Label>
                    <Input
                      id="transaction-id"
                      placeholder="Enter transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>

                  <Button
                    onClick={handleSingleGeneration}
                    disabled={isGenerating || !transactionId.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR Codes
                      </>
                    )}
                  </Button>

                  {results && (
                    <div className="mt-4 p-4 rounded-lg border bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        {results.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          {results.success ? "Success" : "Failed"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{results.message}</p>
                      {results.data && (
                        <div className="space-y-1 text-sm">
                          <p>Generated: {results.data.generatedCount} QR codes</p>
                          {results.data.errors.length > 0 && (
                            <div>
                              <p className="text-red-600">Errors:</p>
                              <ul className="list-disc list-inside text-red-600">
                                {results.data.errors.map((error: string, index: number) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </MagicCard>
            </TabsContent>

            {/* Batch Generation */}
            <TabsContent value="batch" className="space-y-6">
              <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Batch QR Code Generation</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batch-ids">Transaction IDs (one per line)</Label>
                    <textarea
                      id="batch-ids"
                      className="w-full h-32 p-3 border rounded-md resize-none"
                      placeholder="Enter transaction IDs, one per line..."
                      value={batchTransactionIds}
                      onChange={(e) => setBatchTransactionIds(e.target.value)}
                      disabled={isBatchGenerating}
                    />
                  </div>

                  <Button
                    onClick={handleBatchGeneration}
                    disabled={isBatchGenerating || !batchTransactionIds.trim()}
                    className="w-full"
                  >
                    {isBatchGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Generate Batch QR Codes
                      </>
                    )}
                  </Button>

                  {batchResults && (
                    <div className="mt-4 p-4 rounded-lg border bg-gray-50">
                      <h4 className="font-medium mb-2">Batch Results</h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {batchResults.totalProcessed}
                          </div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {batchResults.successCount}
                          </div>
                          <div className="text-sm text-gray-600">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {batchResults.failureCount}
                          </div>
                          <div className="text-sm text-gray-600">Failed</div>
                        </div>
                      </div>
                      
                      {batchResults.failed.length > 0 && (
                        <div>
                          <p className="text-red-600 font-medium mb-2">Failed Transactions:</p>
                          <ul className="list-disc list-inside text-sm text-red-600">
                            {batchResults.failed.map((error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </MagicCard>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
                <div className="p-8 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">QR Code Analytics</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and reporting for QR code usage coming soon.
                  </p>
                </div>
              </MagicCard>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
                <div className="p-8 text-center">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">QR Code Settings</h3>
                  <p className="text-muted-foreground">
                    Configuration options for QR code generation and security settings coming soon.
                  </p>
                </div>
              </MagicCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
}
