# Admin Approval Workflow - Testing Guide

## Overview
This guide provides step-by-step instructions for testing the newly implemented admin approval workflow system.

## Prerequisites
- Admin account access
- Development server running (`npm run dev`)
- Database with sample data

## Test Scenarios

### 1. Admin Dashboard Navigation Test

**Objective**: Verify the new navigation structure and approval-focused interface

**Steps**:
1. Login as admin user
2. Navigate to `/admin/events`
3. Verify the page shows:
   - "Event Management" title
   - Approval Summary Card with statistics
   - Quick Actions Card with overview
   - "Review Pengajuan" button is prominent

**Expected Results**:
- ✅ Page loads without errors
- ✅ Approval summary shows pending count
- ✅ Quick actions show total events and organizers
- ✅ Navigation emphasizes approval workflow

### 2. Event Origin Identification Test

**Objective**: Verify events are properly categorized by origin

**Steps**:
1. View events list at `/admin/events`
2. Check each event card for origin badges
3. Look for:
   - "Admin" badge for admin-created events
   - "Organizer" badge for organizer-submitted events

**Expected Results**:
- ✅ Each event shows correct origin badge
- ✅ Visual distinction is clear
- ✅ Badge colors are appropriate (blue for admin, amber for organizer)

### 3. Admin Event Creation Test

**Objective**: Test admin event creation workflow

**Steps**:
1. Click "Tambah Event Admin" button
2. Navigate to `/admin/events/create`
3. Fill out the event creation form:
   - Title: "Test Admin Event"
   - Venue: "Test Venue"
   - Province: "Test Province"
   - Start Date: Future date
   - End Date: Future date
4. Submit the form

**Expected Results**:
- ✅ Form loads correctly
- ✅ Admin event creation notice is displayed
- ✅ Event is created with "PUBLISHED" status
- ✅ Event shows "Admin" badge in events list
- ✅ Event has full edit capabilities

### 4. Organizer Event Approval Test

**Objective**: Test the approval workflow for organizer-submitted events

**Steps**:
1. Navigate to `/admin/approval`
2. Look for events with "PENDING_REVIEW" status
3. Click on a pending event
4. Verify approval interface shows:
   - Event details
   - "Organizer" origin indicator
   - Approval/rejection buttons
   - Feedback textarea

**Expected Results**:
- ✅ Approval dashboard loads correctly
- ✅ Pending events are displayed
- ✅ Event detail shows approval interface
- ✅ Approval actions are available

### 5. Event Permission Restrictions Test

**Objective**: Verify permission restrictions work correctly

**Steps**:
1. View an organizer-submitted event detail
2. Check available actions:
   - Pending events: Should show approval actions only
   - Approved events: Should be read-only
3. View an admin-created event detail
4. Check available actions:
   - Should show full edit capabilities

**Expected Results**:
- ✅ Organizer events (pending): Only approval actions
- ✅ Organizer events (approved): Read-only with clear messaging
- ✅ Admin events: Full edit access
- ✅ Appropriate messaging for each state

### 6. Sidebar Navigation Test

**Objective**: Test the enhanced sidebar with pending events counter

**Steps**:
1. Check the admin sidebar
2. Look for "Event Approval" menu item
3. Verify it shows pending events count badge
4. Click on "Event Approval" to navigate

**Expected Results**:
- ✅ Sidebar shows pending events count
- ✅ Badge updates in real-time
- ✅ Navigation works correctly
- ✅ Badge disappears when no pending events

### 7. Approval Statistics Test

**Objective**: Test real-time approval statistics

**Steps**:
1. Navigate to `/admin/events`
2. Check the Approval Summary Card
3. Verify it shows:
   - Pending events count
   - Today's approved events
   - Today's rejected events
   - Average approval time

**Expected Results**:
- ✅ Statistics load correctly
- ✅ Numbers are accurate
- ✅ Updates in real-time
- ✅ Loading states work properly

### 8. Quick Actions Test

**Objective**: Test the quick actions functionality

**Steps**:
1. Check the Quick Actions Card
2. Test each quick action button:
   - Filter Pending Events
   - View Published Events
   - Manage Organizers
   - View Analytics

**Expected Results**:
- ✅ All buttons navigate correctly
- ✅ Filters work as expected
- ✅ Statistics are accurate
- ✅ Priority alerts show when appropriate

## Error Scenarios to Test

### 1. API Error Handling
- Disconnect internet and verify graceful error handling
- Check loading states during slow connections

### 2. Permission Edge Cases
- Test with events that have no organizer
- Test with malformed event data

### 3. Real-time Updates
- Approve an event and verify counters update
- Create a new event and verify it appears correctly

## Performance Testing

### 1. Page Load Times
- Measure initial page load for `/admin/events`
- Check API response times for approval statistics

### 2. Real-time Updates
- Test the 30-second auto-refresh for sidebar statistics
- Verify no memory leaks during extended usage

## Browser Compatibility

Test the interface in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Mobile Responsiveness

Test the interface on:
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

## Accessibility Testing

- ✅ Keyboard navigation works
- ✅ Screen reader compatibility
- ✅ Color contrast meets standards
- ✅ Focus indicators are visible

## Data Validation

### Sample Test Data Needed:
1. **Admin-created events**: Events created directly by admin
2. **Organizer events (pending)**: Events with "PENDING_REVIEW" status
3. **Organizer events (approved)**: Events with "PUBLISHED" status from organizers
4. **Multiple organizers**: To test organizer statistics

## Troubleshooting Common Issues

### Issue: Approval statistics not loading
**Solution**: Check API endpoint `/api/admin/events/approval?includeStats=true`

### Issue: Event origin badges not showing
**Solution**: Verify `currentUserId` is passed to AdminEventCard component

### Issue: Permission restrictions not working
**Solution**: Check event organizer user ID comparison logic

### Issue: Sidebar counter not updating
**Solution**: Verify the 30-second interval in useAdminSidebarStats hook

## Success Criteria

The implementation is successful if:
- ✅ All test scenarios pass
- ✅ No console errors during normal usage
- ✅ Performance is acceptable (< 3s page loads)
- ✅ Mobile interface is usable
- ✅ Approval workflow is intuitive for admins
- ✅ Clear distinction between admin and organizer events
- ✅ Real-time statistics work correctly

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Console errors (if any)
5. Screenshots (if applicable)

## Next Steps After Testing

1. Gather user feedback from admin users
2. Monitor performance in production
3. Consider additional features based on usage patterns
4. Plan for bulk approval actions if needed
