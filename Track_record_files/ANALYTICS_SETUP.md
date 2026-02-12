# Analytics Setup Guide

The analytics system now pulls real data from your database instead of using mock data. Here's how to set it up:

## 1. Database Setup

Make sure your database is set up with the required tables by running the setup script:

```sql
-- Run this in your Supabase SQL Editor
-- File: scripts/setup-database.sql
```

## 2. Add Sample Data (Optional)

To test the analytics with sample data, run the sample data script:

```sql
-- Run this in your Supabase SQL Editor
-- File: scripts/add-sample-data.sql
```

This will add:
- 12 sample exam results over the past 30 days
- Sample questions from different subjects
- Realistic score distributions and study times

## 3. How Analytics Work

The analytics system tracks:

### Real Data Sources
- **Exam Results**: From `exam_results` table
- **Questions**: From `questions` table for subject analysis
- **User Activities**: Tracked automatically when taking exams

### Calculated Metrics
- **Total Exams**: Count of completed exams
- **Study Time**: Sum of `study_time_minutes` from exam results
- **Average Score**: Mean of all exam scores
- **Streak Days**: Consecutive days with exam activity
- **Subject Performance**: Analyzed from exam titles and question subjects
- **Knowledge Gaps**: Areas with scores < 70%
- **Mastery Areas**: Areas with scores ≥ 85% and consistency

### User ID Management
- Uses localStorage to maintain user identity
- Generates unique ID if none exists
- All exam results are tied to this user ID

## 4. Testing Analytics

1. **Take some exams** - Upload PDFs and take practice exams
2. **Check the dashboard** - View basic stats on `/dashboard`
3. **View detailed analytics** - Go to `/analytics` for comprehensive insights
4. **Test API directly** - Visit `/api/analytics/test` to test the API

## 5. Customization

To customize analytics:

- **Add new metrics**: Modify `/app/api/analytics/route.ts`
- **Change calculations**: Update the calculation functions
- **Add new visualizations**: Extend `AnalyticsDashboard.tsx`
- **Modify time ranges**: Update the time range selector

## 6. Troubleshooting

### No Data Showing
- Check if database tables exist
- Verify user ID consistency
- Ensure exam results are being saved properly

### API Errors
- Check Supabase connection
- Verify environment variables
- Check browser console for errors

### Performance Issues
- Add database indexes for large datasets
- Implement pagination for large result sets
- Cache frequently accessed data

## 7. Production Considerations

For production use:
- Implement proper user authentication
- Add data validation and sanitization
- Set up proper error logging
- Implement rate limiting
- Add data backup and recovery
- Consider data retention policies