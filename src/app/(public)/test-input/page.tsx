"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MagicInput, MagicCard, MagicButton } from "~/components/ui/magic-card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface TestFormData {
  magicInput: string;
  standardInput: string;
  email: string;
  number: string;
}

export default function TestInputPage() {
  const [formData, setFormData] = useState<TestFormData>({
    magicInput: "",
    standardInput: "",
    email: "",
    number: "",
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TestFormData>({
    defaultValues: formData,
  });

  const watchedValues = watch();

  const onSubmit = (data: TestFormData) => {
    console.log("Form submitted:", data);
    alert(`Form Data: ${JSON.stringify(data, null, 2)}`);
  };

  const handleDirectChange = (field: keyof TestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Input Component Test Page</h1>
      
      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>React Hook Form Values:</strong></p>
            <pre className="bg-muted p-2 rounded text-sm">
              {JSON.stringify(watchedValues, null, 2)}
            </pre>
            <p><strong>Direct State Values:</strong></p>
            <pre className="bg-muted p-2 rounded text-sm">
              {JSON.stringify(formData, null, 2)}
            </pre>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Test Instructions:</h4>
              <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Try typing in each input field below</li>
                <li>Check if the values appear in the debug info above</li>
                <li>Test Tab navigation between fields</li>
                <li>Test form submission</li>
                <li>Compare Magic UI inputs vs Standard inputs</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* React Hook Form Test */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <MagicCard className="bg-gradient-to-br from-background/90 to-muted/20">
          <CardHeader>
            <CardTitle>React Hook Form Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="magicInput">Magic Input (React Hook Form)</Label>
              <MagicInput
                id="magicInput"
                {...register("magicInput")}
                placeholder="Type in Magic Input..."
              />
            </div>

            <div>
              <Label htmlFor="standardInput">Standard Input (React Hook Form)</Label>
              <Input
                id="standardInput"
                {...register("standardInput")}
                placeholder="Type in Standard Input..."
              />
            </div>

            <div>
              <Label htmlFor="email">Email Magic Input</Label>
              <MagicInput
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email..."
              />
            </div>

            <div>
              <Label htmlFor="number">Number Magic Input</Label>
              <MagicInput
                id="number"
                type="number"
                {...register("number")}
                placeholder="Enter number..."
              />
            </div>

            <MagicButton type="submit" variant="magic">
              Submit Form
            </MagicButton>
          </CardContent>
        </MagicCard>
      </form>

      {/* Direct State Test */}
      <MagicCard className="bg-gradient-to-br from-background/90 to-muted/20">
        <CardHeader>
          <CardTitle>Direct State Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="directMagic">Magic Input (Direct State)</Label>
            <MagicInput
              id="directMagic"
              value={formData.magicInput}
              onChange={(e) => handleDirectChange("magicInput", e.target.value)}
              placeholder="Type in Magic Input (Direct)..."
            />
          </div>

          <div>
            <Label htmlFor="directStandard">Standard Input (Direct State)</Label>
            <Input
              id="directStandard"
              value={formData.standardInput}
              onChange={(e) => handleDirectChange("standardInput", e.target.value)}
              placeholder="Type in Standard Input (Direct)..."
            />
          </div>

          <MagicButton 
            onClick={() => alert(`Direct State: ${JSON.stringify(formData, null, 2)}`)}
            variant="outline"
          >
            Show Direct State
          </MagicButton>
        </CardContent>
      </MagicCard>

      {/* Raw HTML Test */}
      <Card>
        <CardHeader>
          <CardTitle>Raw HTML Input Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rawInput">Raw HTML Input</Label>
            <input
              id="rawInput"
              type="text"
              placeholder="Raw HTML input..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              style={{
                pointerEvents: 'auto',
                userSelect: 'auto',
                cursor: 'text',
                zIndex: 50,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
