# Feature: Gamification System

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement a comprehensive gamification system that transforms the exam preparation experience into an engaging, motivating journey. The system will include achievement badges, study streaks, progress levels, challenge modes, and optional leaderboards to increase user engagement, motivation, and retention while maintaining focus on educational outcomes.

## User Story

As a student using the Exam Fever Simulator
I want to earn achievements, maintain study streaks, and participate in challenges
So that I stay motivated to study consistently and feel rewarded for my progress and dedication

## Problem Statement

Students often struggle with motivation and consistency in their study habits. Traditional exam preparation can feel monotonous and discouraging, leading to procrastination and inconsistent practice. A gamification system can provide the psychological rewards and social motivation needed to maintain engagement.

## Solution Statement

Build an engaging gamification system using achievement mechanics, progress tracking, streak counters, and challenge modes. The system will use psychological principles of motivation (achievement, progress, social comparison) while maintaining educational focus. Features include animated celebrations, progress visualization, and optional social elements.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: User engagement, progress tracking, achievement system, social features
**Dependencies**: Animation libraries, achievement logic, progress tracking, notification system

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

This feature builds upon existing systems:

- `.agents/plans/supabase-user-authentication.md` - User system for personalized gamification
- `.agents/plans/world-class-exam-interface.md` - Exam interface for achievement triggers
- `.agents/plans/learning-analytics-dashboard.md` - Analytics for progress tracking
- `.kiro/steering/structure.md` - Project structure for gamification components

### New Files to Create

**Gamification Components:**
- `components/gamification/AchievementBadge.tsx` - Individual achievement badge display
- `components/gamification/AchievementModal.tsx` - Achievement unlock celebration
- `components/gamification/StreakCounter.tsx` - Study streak display and animation
- `components/gamification/ProgressLevel.tsx` - User level and XP visualization
- `components/gamification/ChallengeCard.tsx` - Challenge mode display
- `components/gamification/Leaderboard.tsx` - Optional ranking display
- `components/gamification/RewardAnimation.tsx` - Celebration animations
- `components/gamification/GamificationDashboard.tsx` - Main gamification overview

**Achievement System:**
- `lib/gamification/achievement-engine.ts` - Achievement logic and validation
- `lib/gamification/streak-tracker.ts` - Study streak calculation and management
- `lib/gamification/level-calculator.ts` - XP and level progression system
- `lib/gamification/challenge-manager.ts` - Challenge creation and validation
- `lib/gamification/reward-system.ts` - Reward distribution and tracking
- `lib/gamification/leaderboard-manager.ts` - Ranking and comparison logic

**API Routes:**
- `app/api/gamification/achievements/route.ts` - Achievement management endpoint
- `app/api/gamification/streaks/route.ts` - Streak tracking endpoint
- `app/api/gamification/challenges/route.ts` - Challenge management endpoint
- `app/api/gamification/leaderboard/route.ts` - Leaderboard data endpoint

**Database Schema:**
- `supabase/migrations/007_gamification_schema.sql` - Gamification data tables
- `supabase/migrations/008_achievements_system.sql` - Achievement tracking schema

**Types:**
- `types/gamification.ts` - Gamification data type definitions
- `types/achievements.ts` - Achievement and reward types

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Framer Motion Animations](https://www.framer.com/motion/)
  - Specific section: Celebration animations and micro-interactions
  - Why: Smooth animations for achievement unlocks and progress updates
- [React Confetti Documentation](https://www.npmjs.com/package/react-confetti)
  - Specific section: Celebration effects for achievements
  - Why: Satisfying visual feedback for accomplishments
- [Gamification Psychology Principles](https://www.interaction-design.org/literature/article/gamification-the-psychology-of-motivation)
  - Specific section: Achievement mechanics and motivation theory
  - Why: Understanding effective gamification design principles
- [Progressive Web App Notifications](https://web.dev/push-notifications/)
  - Specific section: Achievement and streak notifications
  - Why: Re-engagement through timely notifications

### Patterns to Follow

**Achievement Validation Pattern:**
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (userStats: UserStats) => boolean;
  reward: Reward;
}

const checkAchievements = async (userId: string, activity: UserActivity) => {
  const userStats = await getUserStats(userId);
  const unlockedAchievements = achievements.filter(
    achievement => achievement.condition(userStats) && !userStats.unlockedAchievements.includes(achievement.id)
  );
  // Award achievements
};
```

**Streak Tracking Pattern:**
```typescript
const updateStreak = async (userId: string, activityDate: Date) => {
  const lastActivity = await getLastActivity(userId);
  const daysDiff = getDaysDifference(lastActivity.date, activityDate);
  
  if (daysDiff === 1) {
    // Continue streak
    return incrementStreak(userId);
  } else if (daysDiff === 0) {
    // Same day activity
    return getCurrentStreak(userId);
  } else {
    // Streak broken
    return resetStreak(userId);
  }
};
```

**Level Progression Pattern:**
```typescript
const calculateLevel = (totalXP: number): { level: number; currentXP: number; nextLevelXP: number } => {
  // Progressive XP requirements: 100, 250, 450, 700, 1000, etc.
  const xpForLevel = (level: number) => level * 150 + (level - 1) * 50;
  
  let level = 1;
  let xpUsed = 0;
  
  while (xpUsed + xpForLevel(level) <= totalXP) {
    xpUsed += xpForLevel(level);
    level++;
  }
  
  return {
    level,
    currentXP: totalXP - xpUsed,
    nextLevelXP: xpForLevel(level)
  };
};
```

---

## IMPLEMENTATION PLAN

### Phase 1: Achievement System Foundation

Build the core achievement system with badge definitions, validation logic, and reward mechanics.

**Tasks:**
- Create achievement definitions and validation system
- Implement XP and level progression mechanics
- Set up achievement tracking database schema
- Build reward distribution system

### Phase 2: Streak & Progress Tracking

Implement study streak tracking, progress visualization, and consistency rewards.

**Tasks:**
- Build streak calculation and tracking system
- Create progress level visualization components
- Implement daily/weekly goal tracking
- Add streak milestone achievements

### Phase 3: Challenge System

Create challenge modes with time-based competitions and special objectives.

**Tasks:**
- Design challenge types and mechanics
- Implement challenge validation and scoring
- Create challenge UI components
- Add challenge-specific achievements

### Phase 4: Social Features & Leaderboards

Add optional social comparison features and community engagement.

**Tasks:**
- Build anonymous leaderboard system
- Create social achievement sharing
- Implement friend challenges (optional)
- Add community milestones

### Phase 5: Animations & Polish

Add celebration animations, micro-interactions, and visual polish to enhance the gamification experience.

**Tasks:**
- Implement achievement unlock animations
- Create progress celebration effects
- Add micro-interactions for all gamification elements
- Optimize performance and accessibility

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE types/gamification.ts

- **IMPLEMENT**: Comprehensive gamification data type definitions
- **PATTERN**: TypeScript interfaces for achievements, streaks, levels, challenges
- **IMPORTS**: User types, activity types
- **GOTCHA**: Include all gamification mechanics and reward types
- **VALIDATE**: `npx tsc --noEmit`

### CREATE types/achievements.ts

- **IMPLEMENT**: Achievement and reward system type definitions
- **PATTERN**: Interface-based types with validation functions
- **IMPORTS**: Gamification types, user activity types
- **GOTCHA**: Include achievement conditions and reward mechanics
- **VALIDATE**: `npx tsc --noEmit`

### CREATE supabase/migrations/007_gamification_schema.sql

- **IMPLEMENT**: Database schema for gamification data
- **PATTERN**: SQL schema with proper indexes and relationships
- **IMPORTS**: None required
- **GOTCHA**: Include user progress, streaks, and achievement tracking
- **VALIDATE**: `supabase db push` and verify schema creation

### CREATE supabase/migrations/008_achievements_system.sql

- **IMPLEMENT**: Achievement tracking and reward system schema
- **PATTERN**: SQL schema optimized for achievement queries
- **IMPORTS**: None required
- **GOTCHA**: Include achievement definitions and user unlock tracking
- **VALIDATE**: `supabase db push` and verify achievement schema

### CREATE lib/gamification/achievement-engine.ts

- **IMPLEMENT**: Achievement validation and unlock system
- **PATTERN**: Achievement engine with condition checking and rewards
- **IMPORTS**: Achievement types, user stats, database client
- **GOTCHA**: Handle concurrent achievement unlocks and prevent duplicates
- **VALIDATE**: Test achievement validation with mock user data

### CREATE lib/gamification/streak-tracker.ts

- **IMPLEMENT**: Study streak calculation and management
- **PATTERN**: Streak tracking with date-based validation
- **IMPORTS**: Gamification types, date utilities
- **GOTCHA**: Handle timezone differences and streak recovery grace periods
- **VALIDATE**: Test streak calculations with various activity patterns

### CREATE lib/gamification/level-calculator.ts

- **IMPLEMENT**: XP and level progression system
- **PATTERN**: Progressive leveling with balanced XP requirements
- **IMPORTS**: Gamification types, mathematical utilities
- **GOTCHA**: Ensure balanced progression that maintains engagement
- **VALIDATE**: Test level calculations with different XP amounts

### CREATE lib/gamification/challenge-manager.ts

- **IMPLEMENT**: Challenge creation, validation, and scoring system
- **PATTERN**: Challenge management with time-based validation
- **IMPORTS**: Challenge types, performance metrics
- **GOTCHA**: Handle challenge expiration and fair scoring
- **VALIDATE**: Test challenge mechanics with sample scenarios

### CREATE lib/gamification/reward-system.ts

- **IMPLEMENT**: Reward distribution and tracking system
- **PATTERN**: Reward management with proper validation
- **IMPORTS**: Achievement types, user data, notification system
- **GOTCHA**: Prevent reward duplication and ensure fair distribution
- **VALIDATE**: Test reward distribution with various scenarios

### CREATE lib/gamification/leaderboard-manager.ts

- **IMPLEMENT**: Ranking and comparison logic for leaderboards
- **PATTERN**: Leaderboard calculation with privacy considerations
- **IMPORTS**: User stats, performance metrics, privacy settings
- **GOTCHA**: Handle anonymous rankings and prevent gaming
- **VALIDATE**: Test leaderboard calculations with user data

### CREATE components/gamification/AchievementBadge.tsx

- **IMPLEMENT**: Individual achievement badge display component
- **PATTERN**: Badge component with unlock animations
- **IMPORTS**: Achievement types, animation utilities, UI components
- **GOTCHA**: Include locked/unlocked states and progress indicators
- **VALIDATE**: Test badge rendering with different achievement states

### CREATE components/gamification/AchievementModal.tsx

- **IMPLEMENT**: Achievement unlock celebration modal
- **PATTERN**: Modal component with celebration animations
- **IMPORTS**: Modal components, confetti effects, achievement types
- **GOTCHA**: Include satisfying celebration effects and sharing options
- **VALIDATE**: Test modal with achievement unlock scenarios

### CREATE components/gamification/StreakCounter.tsx

- **IMPLEMENT**: Study streak display with animations
- **PATTERN**: Counter component with flame/fire animations
- **IMPORTS**: Streak data, animation utilities, progress indicators
- **GOTCHA**: Include streak milestones and recovery encouragement
- **VALIDATE**: Test streak display with various streak lengths

### CREATE components/gamification/ProgressLevel.tsx

- **IMPLEMENT**: User level and XP visualization
- **PATTERN**: Progress bar with level indicators and animations
- **IMPORTS**: Level data, progress components, animation utilities
- **GOTCHA**: Show current progress and next level requirements clearly
- **VALIDATE**: Test level display with different XP amounts

### CREATE components/gamification/ChallengeCard.tsx

- **IMPLEMENT**: Challenge mode display and participation
- **PATTERN**: Card component with challenge details and actions
- **IMPORTS**: Challenge types, UI components, timer utilities
- **GOTCHA**: Include challenge progress and time remaining
- **VALIDATE**: Test challenge cards with active and completed challenges

### CREATE components/gamification/Leaderboard.tsx

- **IMPLEMENT**: Optional ranking display with privacy controls
- **PATTERN**: Leaderboard component with anonymous rankings
- **IMPORTS**: Leaderboard data, user preferences, UI components
- **GOTCHA**: Respect privacy settings and prevent user identification
- **VALIDATE**: Test leaderboard with various ranking scenarios

### CREATE components/gamification/RewardAnimation.tsx

- **IMPLEMENT**: Celebration animations for achievements and milestones
- **PATTERN**: Animation component with various celebration types
- **IMPORTS**: Framer Motion, confetti effects, sound effects (optional)
- **GOTCHA**: Include different animation types for different rewards
- **VALIDATE**: Test animations with different reward types

### CREATE components/gamification/GamificationDashboard.tsx

- **IMPLEMENT**: Main gamification overview and progress display
- **PATTERN**: Dashboard layout with all gamification elements
- **IMPORTS**: All gamification components, user data hooks
- **GOTCHA**: Handle loading states and empty progress scenarios
- **VALIDATE**: Test dashboard with various user progress states

### CREATE app/api/gamification/achievements/route.ts

- **IMPLEMENT**: Achievement management API endpoint
- **PATTERN**: Next.js API route with achievement operations
- **IMPORTS**: Achievement engine, database client, user authentication
- **GOTCHA**: Handle achievement validation and unlock notifications
- **VALIDATE**: `curl http://localhost:3000/api/gamification/achievements`

### CREATE app/api/gamification/streaks/route.ts

- **IMPLEMENT**: Streak tracking API endpoint
- **PATTERN**: Next.js API route with streak calculations
- **IMPORTS**: Streak tracker, user activity data
- **GOTCHA**: Handle streak updates and milestone notifications
- **VALIDATE**: Test streak API with activity data

### CREATE app/api/gamification/challenges/route.ts

- **IMPLEMENT**: Challenge management API endpoint
- **PATTERN**: Next.js API route with challenge operations
- **IMPORTS**: Challenge manager, user performance data
- **GOTCHA**: Handle challenge participation and scoring
- **VALIDATE**: Test challenge API with participation scenarios

### CREATE app/api/gamification/leaderboard/route.ts

- **IMPLEMENT**: Leaderboard data API endpoint
- **PATTERN**: Next.js API route with ranking calculations
- **IMPORTS**: Leaderboard manager, user stats, privacy controls
- **GOTCHA**: Respect user privacy and prevent data leakage
- **VALIDATE**: Test leaderboard API with user data

### CREATE hooks/useGamification.ts

- **IMPLEMENT**: Gamification data management hook
- **PATTERN**: Custom hook with achievement and progress state
- **IMPORTS**: React hooks, gamification API utilities
- **GOTCHA**: Handle real-time achievement unlocks and notifications
- **VALIDATE**: Test hook with React Testing Library

### CREATE hooks/useAchievements.ts

- **IMPLEMENT**: Achievement tracking and notification hook
- **PATTERN**: Custom hook with achievement state management
- **IMPORTS**: Achievement API, notification system
- **GOTCHA**: Handle achievement unlock celebrations and persistence
- **VALIDATE**: Test achievement unlocks with mock data

### CREATE app/achievements/page.tsx

- **IMPLEMENT**: Achievements gallery and progress page
- **PATTERN**: Next.js page with achievement display
- **IMPORTS**: Achievement components, user authentication
- **GOTCHA**: Show both unlocked and locked achievements with progress
- **VALIDATE**: Navigate to /achievements and test gallery functionality

### UPDATE components/exam/ExamInterface.tsx

- **IMPLEMENT**: Add gamification triggers to exam completion
- **PATTERN**: Integrate achievement checks and XP rewards
- **IMPORTS**: Achievement engine, XP calculator, celebration components
- **GOTCHA**: Trigger achievements without disrupting exam flow
- **VALIDATE**: Test exam completion with gamification integration

### UPDATE app/dashboard/page.tsx

- **IMPLEMENT**: Add gamification overview to user dashboard
- **PATTERN**: Integrate gamification dashboard into main dashboard
- **IMPORTS**: Gamification dashboard component, user progress data
- **GOTCHA**: Balance gamification with core functionality
- **VALIDATE**: Test dashboard with gamification elements

---

## TESTING STRATEGY

### Unit Tests

**Framework**: Jest with React Testing Library
**Scope**: Gamification logic, achievement validation, and component rendering
**Coverage**: 85% minimum for gamification mechanics

### Integration Tests

**Framework**: Playwright for end-to-end gamification workflows
**Scope**: Achievement unlocks, streak tracking, and challenge participation
**Coverage**: Complete gamification user journeys

### Gamification Tests

**Framework**: Custom testing for achievement mechanics
**Scope**: Achievement conditions, streak calculations, and reward distribution
**Coverage**: All gamification rules and edge cases

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
npx prettier --check .
```

### Level 2: Unit Tests
```bash
npm run test -- --testPathPattern=gamification
npm run test:coverage
```

### Level 3: Integration Tests
```bash
npm run dev
npx playwright test --grep "gamification"
```

### Level 4: Manual Validation
- Complete an exam and verify achievement unlocks
- Test streak tracking with daily activities
- Participate in challenges and verify scoring
- Test all celebration animations and effects

---

## ACCEPTANCE CRITERIA

- [ ] Achievement system unlocks badges based on user activities
- [ ] Study streaks are accurately tracked and displayed
- [ ] Level progression provides clear advancement goals
- [ ] Challenge modes offer engaging competitive elements
- [ ] Celebration animations provide satisfying feedback
- [ ] Leaderboards respect user privacy preferences
- [ ] Gamification enhances rather than distracts from learning
- [ ] All animations are smooth and performant
- [ ] Achievement conditions are fair and achievable
- [ ] Progress is persistent across sessions and devices

---

## NOTES

**Psychology**: Focus on intrinsic motivation and learning outcomes
**Balance**: Gamification should enhance, not replace, educational value
**Privacy**: All social features are optional and privacy-respecting
**Performance**: Animations should not impact core functionality
**Accessibility**: All gamification elements are accessible to all users
