# 🗄️ Settings Database Migration Guide

## Overview
The user settings feature requires three new database tables to be created in your Supabase project. This guide will walk you through the migration process.

## 📋 Required Tables

1. **`user_profiles`** - Stores user personal information and physical data
2. **`user_nutrition_goals`** - Stores daily nutrition targets
3. **`user_app_preferences`** - Stores app customization settings

## 🚀 Quick Migration (Recommended)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration Script
1. Copy the contents of `supabase-settings-simple.sql`
2. Paste it into the SQL editor
3. Click **Run** to execute the script

### Step 3: Verify Tables Created
1. Go to **Table Editor** in the left sidebar
2. You should see three new tables:
   - `user_profiles`
   - `user_nutrition_goals`
   - `user_app_preferences`

## 🔧 Detailed Migration (Advanced)

If you want more control and validation, use the full migration script from `supabase-settings-migration.sql`. This includes:

- Data validation constraints
- Performance indexes
- Automatic timestamp triggers
- Comprehensive RLS policies

## ✅ Post-Migration Verification

After running the migration, verify that:

1. **Tables exist** in the Table Editor
2. **RLS is enabled** on all three tables
3. **Policies are created** (check the Authentication > Policies section)
4. **Settings page loads** without the "Unable to load profile information" error

## 🐛 Troubleshooting

### Common Issues

#### 1. "relation does not exist" error
- Make sure you're running the script in the correct Supabase project
- Check that the SQL editor is connected to your project

#### 2. "permission denied" error
- Ensure you have admin access to your Supabase project
- Check that you're logged in with the correct account

#### 3. RLS policies not working
- Verify that Row Level Security is enabled on all tables
- Check that the policies are created correctly
- Ensure your user is authenticated

#### 4. Settings page still shows error
- Check the browser console for specific error messages
- Verify the table names match exactly
- Ensure the user authentication is working

### Debug Steps

1. **Check Console Logs**: Open browser dev tools and look for errors
2. **Verify Table Structure**: Use the Table Editor to inspect table schemas
3. **Test RLS Policies**: Try querying the tables directly in SQL Editor
4. **Check Authentication**: Verify user login status

## 🔄 Rollback (If Needed)

If you need to remove the settings tables:

```sql
-- Drop tables (WARNING: This will delete all user settings data)
DROP TABLE IF EXISTS user_app_preferences;
DROP TABLE IF EXISTS user_nutrition_goals;
DROP TABLE IF EXISTS user_profiles;
```

## 📱 Testing the Settings Page

After successful migration:

1. **Navigate** to `/settings` in your app
2. **Check** that the page loads without errors
3. **Try** updating profile information
4. **Verify** that nutrition goals can be set
5. **Test** app preferences changes

## 🎯 What Happens After Migration

- **New users** will automatically get default profiles created
- **Existing users** will see empty forms that they can fill out
- **All data** is protected by Row Level Security
- **Settings** are automatically saved to the database

## 🔗 Integration Points

The settings tables integrate with:

- **Dashboard**: Uses nutrition goals for progress tracking
- **Calendar**: Respects user preferences and goals
- **Food Catalog**: Integrates with user profile data
- **Progress Tracking**: Personalized based on user settings

## 📞 Support

If you encounter issues:

1. **Check** the troubleshooting section above
2. **Verify** your Supabase project configuration
3. **Ensure** you have the latest version of the app code
4. **Check** that all required environment variables are set

---

**Migration completed successfully!** 🎉

Your settings page should now work properly, allowing users to manage their profiles, nutrition goals, and app preferences.
