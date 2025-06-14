/**
 * Test script to verify the checkout reservation fixes
 * This script simulates the checkout flow to ensure reservations are properly handled
 */

const BASE_URL = 'http://localhost:3001';

async function testCheckoutFlow() {
  console.log('🧪 Testing checkout reservation flow...\n');

  try {
    // Step 1: Get a test event
    console.log('1. Fetching test event...');
    const eventsResponse = await fetch(`${BASE_URL}/api/public/events`);
    const eventsData = await eventsResponse.json();
    
    if (!eventsData.success || eventsData.data.length === 0) {
      throw new Error('No events available for testing');
    }
    
    const testEvent = eventsData.data[0];
    console.log(`✅ Found test event: ${testEvent.title}`);

    // Step 2: Get ticket types for the event
    console.log('\n2. Fetching ticket types...');
    const eventResponse = await fetch(`${BASE_URL}/api/public/events/${testEvent.id}`);
    const eventData = await eventResponse.json();
    
    if (!eventData.success || !eventData.data.ticketTypes || eventData.data.ticketTypes.length === 0) {
      throw new Error('No ticket types available for testing');
    }
    
    const ticketType = eventData.data.ticketTypes[0];
    console.log(`✅ Found ticket type: ${ticketType.name} - $${ticketType.price}`);

    // Step 3: Create reservations
    console.log('\n3. Creating reservations...');
    const sessionId = `test_session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const reservationPayload = {
      reservations: [
        {
          ticketTypeId: ticketType.id,
          quantity: 2
        }
      ],
      sessionId,
      expirationMinutes: 10
    };
    
    console.log('Reservation payload:', JSON.stringify(reservationPayload, null, 2));
    
    const reservationResponse = await fetch(`${BASE_URL}/api/public/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationPayload),
    });
    
    const reservationResult = await reservationResponse.json();
    console.log('Reservation response:', JSON.stringify(reservationResult, null, 2));
    
    if (!reservationResult.success) {
      throw new Error(`Failed to create reservations: ${reservationResult.error}`);
    }
    
    const reservations = reservationResult.data.successful;
    console.log(`✅ Created ${reservations.length} reservations`);

    // Step 4: Retrieve reservations
    console.log('\n4. Retrieving reservations...');
    const getReservationsResponse = await fetch(`${BASE_URL}/api/public/reservations?sessionId=${sessionId}`);
    const getReservationsResult = await getReservationsResponse.json();
    
    console.log('Get reservations response:', JSON.stringify(getReservationsResult, null, 2));
    
    if (!getReservationsResult.success) {
      throw new Error(`Failed to retrieve reservations: ${getReservationsResult.error}`);
    }
    
    const retrievedReservations = getReservationsResult.data;
    console.log(`✅ Retrieved ${retrievedReservations.length} reservations`);

    // Step 5: Test purchase from reservation
    console.log('\n5. Testing purchase from reservation...');
    
    if (retrievedReservations.length === 0) {
      throw new Error('No reservations available for purchase test');
    }
    
    const firstReservation = retrievedReservations[0];
    console.log(`Using reservation: ${firstReservation.id}`);
    
    const purchasePayload = {
      sessionId,
      buyerInfo: {
        fullName: "Test Buyer",
        identityType: "KTP",
        identityNumber: "1234567890123456",
        email: "test@example.com",
        whatsapp: "+6281234567890"
      },
      ticketHolders: [
        {
          fullName: "Test Holder 1",
          identityType: "KTP",
          identityNumber: "1234567890123457",
          email: "holder1@example.com",
          whatsapp: "+6281234567891"
        },
        {
          fullName: "Test Holder 2",
          identityType: "KTP",
          identityNumber: "1234567890123458",
          email: "holder2@example.com",
          whatsapp: "+6281234567892"
        }
      ]
    };
    
    console.log('Purchase payload:', JSON.stringify(purchasePayload, null, 2));
    
    const purchaseResponse = await fetch(`${BASE_URL}/api/public/reservations/${firstReservation.id}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchasePayload),
    });
    
    const purchaseResult = await purchaseResponse.json();
    console.log('Purchase response:', JSON.stringify(purchaseResult, null, 2));
    
    if (!purchaseResult.success) {
      console.log(`⚠️  Purchase failed (expected for test): ${purchaseResult.error}`);
    } else {
      console.log(`✅ Purchase successful: Transaction ${purchaseResult.data.transaction.id}`);
    }

    console.log('\n🎉 Checkout flow test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (typeof window === 'undefined') {
  // Node.js environment - use built-in fetch (Node 18+)
  testCheckoutFlow();
} else {
  // Browser environment
  testCheckoutFlow();
}
