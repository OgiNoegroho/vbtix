"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminRoute } from "~/components/auth/admin-route";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { ArrowLeft, Save, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import { MagicCard, MagicInput, MagicTextarea } from "~/components/ui/magic-card";

export default function AdminCreateEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    city: "",
    province: "",
    country: "Indonesia",
    category: "",
    startDate: "",
    endDate: "",
    status: "PUBLISHED", // Admin events are published directly
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          slug: formData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Event berhasil dibuat", {
          description: "Event admin telah dibuat dan dipublikasikan.",
        });
        router.push(`/admin/events/${data.data.id}`);
      } else {
        throw new Error(data.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Gagal membuat event", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminRoute>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Buat Event Admin</h1>
              <p className="text-muted-foreground">
                Buat event baru dengan akses penuh sebagai admin
              </p>
            </div>
          </div>

          <div className="max-w-2xl">
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Event Admin:</strong> Event yang dibuat di sini akan langsung dipublikasikan 
                dan memiliki akses penuh untuk editing. Berbeda dengan event organizer yang memerlukan approval.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Informasi Event</CardTitle>
                <CardDescription>
                  Isi detail event yang akan dibuat sebagai admin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MagicCard className="p-6 bg-gradient-to-br from-card/90 to-muted/20 backdrop-blur-sm border-border/50">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="title">Judul Event *</Label>
                        <MagicInput
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          placeholder="Masukkan judul event"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <MagicTextarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Deskripsi event"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="venue">Venue *</Label>
                        <MagicInput
                          id="venue"
                          name="venue"
                          value={formData.venue}
                          onChange={handleInputChange}
                          required
                          placeholder="Nama venue"
                        />
                      </div>

                      <div>
                        <Label htmlFor="city">Kota</Label>
                        <MagicInput
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Kota"
                        />
                      </div>

                      <div>
                        <Label htmlFor="province">Provinsi *</Label>
                        <MagicInput
                          id="province"
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          required
                          placeholder="Provinsi"
                        />
                      </div>

                    <div>
                      <Label htmlFor="category">Kategori</Label>
                      <Select onValueChange={(value) => handleSelectChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="music">Musik</SelectItem>
                          <SelectItem value="conference">Konferensi</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="sports">Olahraga</SelectItem>
                          <SelectItem value="arts">Seni</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                      <div>
                        <Label htmlFor="startDate">Tanggal Mulai *</Label>
                        <MagicInput
                          id="startDate"
                          name="startDate"
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">Tanggal Selesai *</Label>
                        <MagicInput
                          id="endDate"
                          name="endDate"
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Membuat..." : "Buat Event"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                </MagicCard>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
