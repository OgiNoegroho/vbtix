"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Mail, Send, Eye, CheckCircle, AlertCircle } from "lucide-react";

export default function EmailTemplatesPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestEmail = async (type: "verification" | "ticket") => {
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test/email-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          email,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Failed to send test email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">📧 Email Templates</h1>
        <p className="text-muted-foreground mt-2">
          Preview and test email templates for VBTicket
        </p>
      </div>

      <div className="grid gap-6">
        {/* Test Email Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test Email Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Test Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => sendTestEmail("verification")}
                disabled={loading}
                variant="outline"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Verification Email
              </Button>
              
              <Button
                onClick={() => sendTestEmail("ticket")}
                disabled={loading}
                variant="outline"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Ticket Email
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    result.success ? "text-green-800" : "text-red-800"
                  }`}>
                    {result.success ? "Success!" : "Error"}
                  </span>
                </div>
                <p className={`text-sm ${
                  result.success ? "text-green-700" : "text-red-700"
                }`}>
                  {result.message || result.error}
                </p>
                {result.messageId && (
                  <p className="text-xs text-green-600 mt-1">
                    Message ID: {result.messageId}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates Overview */}
        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="verification">Account Verification</TabsTrigger>
            <TabsTrigger value="ticket">Ticket Delivery</TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Account Verification Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary">Template Features</Badge>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Professional VBTicket branding</li>
                      <li>• Clear verification button</li>
                      <li>• Fallback verification link</li>
                      <li>• 24-hour expiration notice</li>
                      <li>• Feature highlights</li>
                      <li>• Responsive design</li>
                    </ul>
                  </div>

                  <div>
                    <Badge variant="outline">Use Cases</Badge>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• New user registration</li>
                      <li>• Email address changes</li>
                      <li>• Account reactivation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ticket" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Ticket Delivery Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary">Template Features</Badge>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Event banner with image</li>
                      <li>• Complete event details</li>
                      <li>• Order summary with invoice</li>
                      <li>• Individual ticket cards</li>
                      <li>• QR codes for each ticket</li>
                      <li>• Important instructions</li>
                      <li>• Professional styling</li>
                    </ul>
                  </div>

                  <div>
                    <Badge variant="outline">Use Cases</Badge>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Payment confirmation</li>
                      <li>• Manual payment approval</li>
                      <li>• Ticket resend requests</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>📧 Email Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Provider</Label>
                <p className="text-muted-foreground">Resend</p>
              </div>
              <div>
                <Label className="font-medium">From Address</Label>
                <p className="text-muted-foreground">vb-club.social</p>
              </div>
              <div>
                <Label className="font-medium">Reply To</Label>
                <p className="text-muted-foreground">support@vbticket.com</p>
              </div>
              <div>
                <Label className="font-medium">Company Name</Label>
                <p className="text-muted-foreground">VBTicket</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
