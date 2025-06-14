"use client";

import React from "react";
import { TicketPurchaseForm } from "~/components/forms/ticket-purchase-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { type BulkTicketPurchaseSchema } from "~/lib/validations/ticket-purchase.schema";

// Mock ticket types for testing
const mockTicketTypes = [
  {
    id: "ticket-1",
    name: "Early Bird",
    price: 150000,
    currency: "IDR",
    quantity: 100,
    sold: 25,
    maxPerPurchase: 5,
  },
  {
    id: "ticket-2", 
    name: "Regular",
    price: 200000,
    currency: "IDR",
    quantity: 200,
    sold: 50,
    maxPerPurchase: 10,
  },
  {
    id: "ticket-3",
    name: "VIP",
    price: 500000,
    currency: "IDR", 
    quantity: 50,
    sold: 10,
    maxPerPurchase: 2,
  },
];

export default function TestTicketFormPage() {
  const handleSubmit = async (data: BulkTicketPurchaseSchema) => {
    console.log("Form submitted with data:", data);
    
    // Show alert with formatted data
    alert(`Form Submitted Successfully!\n\nData:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Ticket Purchase Form Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Test Instructions:</h3>
              <ol className="list-decimal list-inside text-sm text-green-700 space-y-1">
                <li><strong>Input Field Testing:</strong> Try typing in all input fields (name, identity number, email, WhatsApp)</li>
                <li><strong>Ticket Selection:</strong> Click "Tambah Jenis Tiket" to add ticket types, then select from dropdown</li>
                <li><strong>Quantity Input:</strong> Test the number input for ticket quantities</li>
                <li><strong>Dynamic Fields:</strong> Notice how ticket holder fields appear based on total tickets selected</li>
                <li><strong>Form Validation:</strong> Try submitting with empty fields to test validation</li>
                <li><strong>Tab Navigation:</strong> Use Tab key to navigate between fields</li>
                <li><strong>Form Submission:</strong> Fill out the complete form and submit to see the data</li>
              </ol>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">🔧 What Was Fixed:</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li><strong>React.forwardRef:</strong> Added proper ref forwarding to MagicInput, MagicTextarea, and MagicButton components</li>
                <li><strong>React Hook Form Integration:</strong> Fixed compatibility with register() function</li>
                <li><strong>Input Functionality:</strong> All input fields should now accept user input properly</li>
                <li><strong>Form Validation:</strong> Maintained all existing validation logic</li>
                <li><strong>Magic UI Styling:</strong> Preserved enhanced visual design and animations</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">📋 Available Mock Ticket Types:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {mockTicketTypes.map((ticket) => (
                  <div key={ticket.id} className="bg-white p-3 rounded border">
                    <div className="font-medium">{ticket.name}</div>
                    <div className="text-sm text-gray-600">
                      Rp {ticket.price.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ticket.sold}/{ticket.quantity} sold • Max {ticket.maxPerPurchase} per purchase
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The actual form */}
      <TicketPurchaseForm
        ticketTypes={mockTicketTypes}
        onSubmit={handleSubmit}
        isLoading={false}
      />
    </div>
  );
}
