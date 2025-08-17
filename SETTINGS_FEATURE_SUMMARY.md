# ⚙️ User Settings Feature

## Overview
A comprehensive user settings page that allows users to manage their profile information, nutrition goals, and app preferences. The settings are organized into logical tabs for easy navigation and management.

## ✨ Features

### 👤 **Profile Management**
- **Personal Information**: Display name, email (read-only)
- **Physical Data**: Age, height (cm), weight (kg)
- **Demographics**: Gender selection, weight goals
- **Activity Level**: From sedentary to extremely active
- **Smart Defaults**: Auto-populates from user metadata

### 🎯 **Nutrition Goals**
- **Daily Targets**: Calories, carbs, protein, fat
- **Additional Nutrients**: Fiber, sugar, sodium
- **Smart Calculator**: BMR-based recommendations using Mifflin-St Jeor Equation
- **Macro Distribution**: Real-time percentage calculations
- **Validation**: Reasonable min/max values for all inputs

### ⚙️ **App Preferences**
- **Theme Selection**: Light, dark, or system default
- **Notifications**: Enable/disable with toggle switches
- **Weekly Reports**: Opt-in for nutrition summaries
- **Reminder Time**: Daily meal logging reminders
- **Data Management**: Export and clear data options

## 🏗️ **Architecture**

### **Custom Hook: `useUserSettings`**
- Manages all user settings state and operations
- Handles database operations for profile, goals, and preferences
- Provides smart nutrition goal calculations
- Optimized data loading and caching

### **Components**
1. **`ProfileSettings`** - Personal information and physical data
2. **`NutritionGoals`** - Daily nutrition targets and macro distribution
3. **`AppPreferences`** - App customization and notification settings
4. **`SettingsPage`** - Main page with tabbed interface

### **Data Flow**
```
useUserSettings Hook → Settings State → Form Components → User Input → Database
       ↓
Smart Calculations → BMR/TDEE → Recommended Goals → Auto-populate Forms
```

## 🎨 **UI/UX Design**

### **Tabbed Interface**
- **Profile Tab**: Personal and physical information
- **Nutrition Tab**: Daily goals and macro calculations
- **Preferences Tab**: App settings and notifications
- **Visual Icons**: Emoji indicators for each section

### **Form Design**
- **Responsive Layout**: Works on all screen sizes
- **Smart Validation**: Input constraints and helpful hints
- **Success Feedback**: Visual confirmation of saved changes
- **Loading States**: Clear indication during save operations

### **Interactive Elements**
- **Toggle Switches**: Modern toggle controls for boolean settings
- **Smart Inputs**: Number inputs with min/max constraints
- **Dropdown Menus**: Organized selection options
- **Real-time Updates**: Live macro distribution calculations

## 📊 **Smart Nutrition Calculations**

### **BMR Calculation (Mifflin-St Jeor)**
```typescript
// Male: BMR = 10 × weight + 6.25 × height - 5 × age + 5
// Female: BMR = 10 × weight + 6.25 × height - 5 × age - 161
```

### **Activity Multipliers**
- **Sedentary**: 1.2 (little or no exercise)
- **Lightly Active**: 1.375 (light exercise 1-3 days/week)
- **Moderately Active**: 1.55 (moderate exercise 3-5 days/week)
- **Very Active**: 1.725 (hard exercise 6-7 days/week)
- **Extremely Active**: 1.9 (very hard exercise, physical job)

### **Goal Adjustments**
- **Lose Weight**: TDEE - 500 calories (deficit)
- **Maintain Weight**: TDEE (maintenance)
- **Gain Weight**: TDEE + 300 calories (surplus)

### **Macro Distribution**
- **Carbs**: 40% of total calories (4 cal/g)
- **Protein**: 30% of total calories (4 cal/g)
- **Fat**: 30% of total calories (9 cal/g)

## 🔧 **Technical Implementation**

### **State Management**
- React hooks for local form state
- Centralized settings management
- Optimized re-renders and updates
- Clean separation of concerns

### **Database Integration**
- Supabase integration for persistent storage
- Efficient upsert operations
- Error handling and fallbacks
- Real-time data synchronization

### **Form Handling**
- Controlled inputs with validation
- Async save operations
- Success/error feedback
- Form state persistence

## 📱 **Responsive Design**

### **Mobile Optimization**
- Stacked form layouts on small screens
- Touch-friendly input sizes
- Optimized spacing and typography
- Mobile-first tab navigation

### **Desktop Experience**
- Multi-column form layouts
- Hover effects and interactions
- Efficient use of screen space
- Professional appearance

## 🚀 **User Experience Features**

### **Smart Defaults**
- Auto-populates from existing data
- Calculates recommended goals
- Suggests reasonable ranges
- Learns from user preferences

### **Real-time Feedback**
- Live macro distribution updates
- Immediate validation feedback
- Success confirmation messages
- Loading state indicators

### **Easy Navigation**
- Clear tab organization
- Intuitive form layouts
- Helpful descriptions
- Quick action buttons

## 🔮 **Future Enhancements**

### **Advanced Features**
- Profile picture/avatar upload
- Social sharing preferences
- Integration with fitness trackers
- Advanced nutrition algorithms

### **User Experience**
- Guided setup wizard
- Progress tracking
- Achievement badges
- Community features

### **Data Management**
- Advanced export formats
- Data backup/restore
- Privacy controls
- GDPR compliance

## 🧪 **Testing Considerations**

### **Unit Tests**
- Form validation logic
- Calculation algorithms
- State management
- Component rendering

### **Integration Tests**
- Database operations
- Form submissions
- Data persistence
- Error handling

### **E2E Tests**
- Complete settings workflows
- Cross-tab navigation
- Form validation
- Save operations

## 📚 **Usage Examples**

### **Basic Profile Update**
```typescript
const { saveProfile } = useUserSettings(user);
await saveProfile({ display_name: 'John Doe', age: 30 });
```

### **Nutrition Goal Calculation**
```typescript
const { calculateRecommendedGoals } = useUserSettings(user);
const recommended = calculateRecommendedGoals();
// Returns calculated goals based on profile
```

### **App Preference Update**
```typescript
const { saveAppPreferences } = useUserSettings(user);
await saveAppPreferences({ theme: 'dark', notifications: false });
```

## 🎯 **Success Metrics**

### **User Engagement**
- Settings page visits
- Profile completion rates
- Goal setting adoption
- Preference customization

### **Data Quality**
- Profile completion percentages
- Goal accuracy improvements
- User satisfaction scores
- Feature usage rates

### **Technical Performance**
- Page load times
- Form submission success
- Database operation efficiency
- Error rate reduction

## 🏁 **Conclusion**

The User Settings feature provides users with comprehensive control over their app experience:

- **Personalization**: Customize profile, goals, and preferences
- **Smart Recommendations**: AI-powered nutrition goal calculations
- **Easy Management**: Intuitive tabbed interface
- **Data Control**: Export, manage, and control personal data
- **Professional Experience**: Clean, responsive design

The implementation follows React best practices with clean architecture, efficient state management, and excellent user experience. Users can now fully customize their nutrition tracking experience while receiving intelligent recommendations based on their profile data.

## 🔗 **Integration Points**

- **Dashboard**: Uses nutrition goals for progress tracking
- **Calendar**: Respects user preferences and goals
- **Food Catalog**: Integrates with user profile data
- **Progress Tracking**: Personalized based on user settings
- **Notifications**: Configurable reminder system

The settings feature creates a foundation for personalized nutrition tracking and enhances the overall user experience of the CalorieCounter app.
