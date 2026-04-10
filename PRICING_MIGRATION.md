# Pricing System Migration - Global to Per-Project

## Summary

Removed global pricing system and implemented per-project tier pricing. Each project now has its own price for Tier 1, Tier 2, and Tier 3.

## Changes Made

### Backend Changes

#### 1. **Admin Routes** (`backend/src/routes/admin.js`)

- **Added**: Tier price fields to POST `/api/admin/projects/create` endpoint
  - `tier1Price`: Price for Basic tier
  - `tier2Price`: Price for Standard tier
  - `tier3Price`: Price for Premium tier
- **Updated**: PUT `/api/admin/projects/:id` endpoint to handle price updates
- **Removed**:
  - `GET /api/admin/settings` endpoint
  - `POST /api/admin/settings` endpoint
  - `getGlobalSettings()` function calls
  - `SETTINGS_FILE` constant
  - `global_settings.json` file handling

#### 2. **Projects Routes** (`backend/src/routes/projects.js`)

- **Removed**: Global settings logic from API responses
- **Updated**: GET `/api/projects` - returns tiers with per-project prices
- **Updated**: GET `/api/projects/:slug` - returns tiers with per-project prices
- **Removed**:
  - `getGlobalSettings()` function
  - `SETTINGS_FILE` constant
  - Settings file imports

### Frontend Changes

#### 1. **Admin Create Project** (`frontend/src/pages/AdminCreateProject.tsx`)

- **Added**: Price input fields for each tier
  - `tier1Price` - input field for Basic tier price
  - `tier2Price` - input field for Standard tier price
  - `tier3Price` - input field for Premium tier price
- **Updated**: Form sends price data to backend in FormData
- **Updated**: Form reset includes new price fields

#### 2. **Projects Listing** (`frontend/src/pages/Projects.tsx`)

- **Removed**: `TIER_PRICES` constant (no longer needed)
- **Updated**: Price display to use `project.tiers?.[0]?.price` directly
- **Removed**: Fallback to hardcoded prices (now all projects have prices)

#### 3. **Admin Projects Table** (`frontend/src/pages/AdminProjects.tsx`)

- **Updated**: Display tier price from `project.tiers?.[0]?.price`
- **Removed**: Reference to non-existent `project.tier1Price` field

#### 4. **App Routes** (`frontend/src/App.tsx`)

- **Removed**: AdminSettings import
- **Removed**: AdminSettings route (`/admin/settings`)

#### 5. **Admin Dashboard** (`frontend/src/pages/AdminDashboard.tsx`)

- **Removed**: Settings navigation button

## Database Impact

### No Migration Needed

- Existing `tiers` JSONB column already stored tier structure
- New `price` field is now added to each tier object during creation/update
- Example tier structure:
  ```json
  {
    "level": 1,
    "name": "Basic",
    "price": 499,
    "drive_link": "https://drive.google.com/...",
    "features": ["Source Code", "Documentation"]
  }
  ```

## API Response Format

### Projects List Response

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Project Title",
      "tiers": [
        {
          "level": 1,
          "name": "Basic",
          "price": 499,
          "drive_link": "...",
          "features": [...]
        },
        {
          "level": 2,
          "name": "Standard",
          "price": 999,
          "drive_link": "...",
          "features": [...]
        },
        {
          "level": 3,
          "name": "Premium",
          "price": 1999,
          "drive_link": "...",
          "features": [...]
        }
      ]
    }
  ]
}
```

## Admin Workflow

### Creating a Project

1. Admin fills in project details
2. **For each tier** (1, 2, 3):
   - Enter price in rupees
   - Provide Google Drive link
   - List tier features
3. Submit form
4. Each tier now has its own price stored in database

### Editing a Project

1. Admin can update prices for each tier individually
2. Prices are updated in the tiers JSONB array
3. Changes take effect immediately

## Benefits

✅ More flexibility - each project can have different pricing strategy
✅ No global settings file needed - cleaner architecture  
✅ Prices stored in database - easier to query and manage
✅ Simplified admin interface - remove settings page
✅ Better scalability - supports dynamic pricing per project

## Files Modified

1. `backend/src/routes/admin.js`
2. `backend/src/routes/projects.js`
3. `frontend/src/pages/AdminCreateProject.tsx`
4. `frontend/src/pages/AdminProjects.tsx`
5. `frontend/src/pages/Projects.tsx`
6. `frontend/src/App.tsx`
7. `frontend/src/pages/AdminDashboard.tsx`

## Backward Compatibility

- Projects created before this change may not have prices in their tier objects
- To fix: Update existing projects via admin panel to set prices for each tier
- Or manually update database: `UPDATE "Project" SET tiers = [updated tiers with prices] WHERE id = '...'`

## Next Steps (Optional)

- Delete `global_settings.json` file if it exists
- Update project creation API documentation
- Remove AdminSettings.tsx file if no longer needed for other settings
