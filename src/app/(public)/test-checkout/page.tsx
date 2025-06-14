"use client";

import React, { useState } from "react";
import { MagicInput, MagicCard, MagicButton } from "~/components/ui/magic-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { User, Users, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface BuyerInfo {
  fullName: string;
  identityType: string;
  identityNumber: string;
  email: string;
  whatsapp: string;
}

interface TicketHolder {
  fullName: string;
  identityType: string;
  identityNumber: string;
  email: string;
  whatsapp: string;
}

export default function TestCheckoutPage() {
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    fullName: "",
    identityType: "",
    identityNumber: "",
    email: "",
    whatsapp: "",
  });

  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([
    {
      fullName: "",
      identityType: "",
      identityNumber: "",
      email: "",
      whatsapp: "",
    },
  ]);

  const updateTicketHolder = (index: number, field: keyof TicketHolder, value: string) => {
    setTicketHolders(prev => 
      prev.map((holder, i) => 
        i === index ? { ...holder, [field]: value } : holder
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { buyerInfo, ticketHolders });
    alert(`Checkout Form Submitted!\n\nBuyer Info:\n${JSON.stringify(buyerInfo, null, 2)}\n\nTicket Holders:\n${JSON.stringify(ticketHolders, null, 2)}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Checkout Form Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Test Instructions:</h3>
              <ol className="list-decimal list-inside text-sm text-green-700 space-y-1">
                <li><strong>Buyer Information:</strong> Fill out all buyer data fields (name, identity, email, WhatsApp)</li>
                <li><strong>Ticket Holder Information:</strong> Fill out ticket holder data fields</li>
                <li><strong>Input Testing:</strong> Verify all MagicInput fields accept text input</li>
                <li><strong>Tab Navigation:</strong> Use Tab key to navigate between fields</li>
                <li><strong>Form Submission:</strong> Submit the form to see captured data</li>
                <li><strong>Visual Design:</strong> Notice Magic UI styling with gradients and hover effects</li>
              </ol>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">🔧 Checkout Form Fixes Applied:</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li><strong>MagicInput Components:</strong> Replaced all standard Input components with MagicInput</li>
                <li><strong>MagicCard Containers:</strong> Enhanced card styling with gradient backgrounds</li>
                <li><strong>MagicButton Components:</strong> Converted submit and action buttons to MagicButton</li>
                <li><strong>Direct State Management:</strong> Maintained existing onChange handlers for form state</li>
                <li><strong>React.forwardRef:</strong> All Magic UI components now properly support refs</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-yellow-50 rounded border">
                <h4 className="font-medium text-yellow-800">Current Buyer Info:</h4>
                <pre className="text-xs text-yellow-700 mt-1 overflow-auto">
                  {JSON.stringify(buyerInfo, null, 2)}
                </pre>
              </div>
              <div className="p-3 bg-purple-50 rounded border">
                <h4 className="font-medium text-purple-800">Current Ticket Holders:</h4>
                <pre className="text-xs text-purple-700 mt-1 overflow-auto">
                  {JSON.stringify(ticketHolders, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Buyer Information */}
        <MagicCard className="bg-gradient-to-br from-background/90 to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Data Pemesan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <MagicInput
                  id="fullName"
                  value={buyerInfo.fullName}
                  onChange={(e) =>
                    setBuyerInfo((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div>
                <Label htmlFor="identityType">Jenis Identitas *</Label>
                <Select
                  value={buyerInfo.identityType}
                  onValueChange={(value) =>
                    setBuyerInfo((prev) => ({
                      ...prev,
                      identityType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis identitas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KTP">KTP</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                    <SelectItem value="PASSPORT">Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="identityNumber">Nomor Identitas *</Label>
                <MagicInput
                  id="identityNumber"
                  value={buyerInfo.identityNumber}
                  onChange={(e) =>
                    setBuyerInfo((prev) => ({
                      ...prev,
                      identityNumber: e.target.value,
                    }))
                  }
                  placeholder="Masukkan nomor identitas"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <MagicInput
                  id="email"
                  type="email"
                  value={buyerInfo.email}
                  onChange={(e) =>
                    setBuyerInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Masukkan email"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
              <MagicInput
                id="whatsapp"
                value={buyerInfo.whatsapp}
                onChange={(e) =>
                  setBuyerInfo((prev) => ({
                    ...prev,
                    whatsapp: e.target.value,
                  }))
                }
                placeholder="Masukkan nomor WhatsApp"
                required
              />
            </div>
          </CardContent>
        </MagicCard>

        {/* Ticket Holders */}
        <MagicCard className="bg-gradient-to-br from-background/90 to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Data Pemilik Tiket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ticketHolders.map((holder, index) => (
              <div key={index} className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium">Tiket #{index + 1}</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`holder-name-${index}`}>Nama Lengkap *</Label>
                    <MagicInput
                      id={`holder-name-${index}`}
                      value={holder.fullName}
                      onChange={(e) =>
                        updateTicketHolder(index, "fullName", e.target.value)
                      }
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`holder-identity-type-${index}`}>Jenis Identitas *</Label>
                    <Select
                      value={holder.identityType}
                      onValueChange={(value) =>
                        updateTicketHolder(index, "identityType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis identitas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KTP">KTP</SelectItem>
                        <SelectItem value="SIM">SIM</SelectItem>
                        <SelectItem value="PASSPORT">Passport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`holder-identity-${index}`}>Nomor Identitas *</Label>
                    <MagicInput
                      id={`holder-identity-${index}`}
                      value={holder.identityNumber}
                      onChange={(e) =>
                        updateTicketHolder(index, "identityNumber", e.target.value)
                      }
                      placeholder="Masukkan nomor identitas"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`holder-email-${index}`}>Email *</Label>
                    <MagicInput
                      id={`holder-email-${index}`}
                      type="email"
                      value={holder.email}
                      onChange={(e) =>
                        updateTicketHolder(index, "email", e.target.value)
                      }
                      placeholder="Masukkan email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`holder-whatsapp-${index}`}>Nomor WhatsApp *</Label>
                  <MagicInput
                    id={`holder-whatsapp-${index}`}
                    value={holder.whatsapp}
                    onChange={(e) =>
                      updateTicketHolder(index, "whatsapp", e.target.value)
                    }
                    placeholder="Masukkan nomor WhatsApp"
                    required
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </MagicCard>

        {/* Submit Button */}
        <div className="flex justify-end">
          <MagicButton
            type="submit"
            size="lg"
            variant="magic"
            className="w-full md:w-auto"
          >
            Submit Checkout Form
          </MagicButton>
        </div>
      </form>
    </div>
  );
}
