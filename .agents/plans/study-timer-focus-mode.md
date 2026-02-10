# Feature: Study Timer & Focus Mode

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement a comprehensive study timer and focus mode system that helps students maintain concentration, manage study sessions effectively, and reduce exam anxiety. The system includes Pomodoro technique integration, ambient sounds, distraction-free interfaces, break reminders, and stress-relief features to optimize learning conditions and mental well-being.

## User Story

As a student preparing for exams
I want a study timer with focus mode and stress-relief features
So that I can maintain concentration during study sessions, manage my time effectively, and stay calm and focused while preparing for exams

## Problem Statement

Students often struggle with maintaining focus during study sessions, managing study time effectively, and dealing with exam-related stress and anxiety. Traditional study methods don't provide structured time management or stress-relief support, leading to inefficient studying and increased anxiety.

## Solution Statement

Build a comprehensive study timer system with Pomodoro technique, customizable focus modes, ambient soundscapes, breathing exercises, and distraction-free interfaces. The system will provide structured study sessions, break reminders, progress tracking, and stress-relief tools to optimize learning effectiveness and mental well-being.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Study session management, focus enhancement, stress relief, time tracking
**Dependencies**: Timer utilities, audio management, animation libraries, meditation/breathing techniques

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

This feature integrates with existing systems:

- `.agents/plans/world-class-exam-interface.md` - Exam interface for focus mode integration
- `.agents/plans/gamification-system.md` - Achievement system for study session rewards
- `.agents/plans/learning-analytics-dashboard.md` - Analytics for study time tracking
- `.agents/plans/progressive-web-app.md` - PWA for background timers and notifications

### New Files to Create

**Timer Components:**
- `components/timer/StudyTimer.tsx` - Main study timer with Pomodoro functionality
- `components/timer/PomodoroTimer.tsx` - Dedicated Pomodoro technique timer
- `components/timer/CustomTimer.tsx` - Customizable study session timer
- `components/timer/TimerControls.tsx` - Timer control buttons and settings
- `components/timer/TimerDisplay.tsx` - Visual timer display with animations
- `components/timer/SessionProgress.tsx` - Study session progress tracking

**Focus Mode Components:**
- `components/focus/FocusMode.tsx` - Main focus mode container
- `components/focus/DistractionBlocker.tsx` - Distraction-free interface overlay
- `components/focus/AmbientSounds.tsx` - Background sound selection and player
- `components/focus/BreathingExercise.tsx` - Guided breathing exercises
- `components/focus/FocusSettings.tsx` - Focus mode preferences and customization
- `components/focus/ZenMode.tsx` - Minimal, distraction-free study interface

**Stress Relief Components:**
- `components/wellness/StressReliefCenter.tsx` - Stress management tools hub
- `components/wellness/MeditationTimer.tsx` - Guided meditation sessions
- `components/wellness/BreathingGuide.tsx` - Interactive breathing guide
- `components/wellness/RelaxationSounds.tsx` - Calming soundscapes
- `components/wellness/MotivationalQuotes.tsx` - Encouraging messages and quotes

**Timer Logic:**
- `lib/timer/pomodoro-engine.ts` - Pomodoro technique implementation
- `lib/timer/session-manager.ts` - Study session management and tracking
- `lib/timer/break-scheduler.ts` - Break reminder and scheduling system
- `lib/timer/time-tracker.ts` - Time tracking and analytics
- `lib/timer/notification-manager.ts` - Timer notifications and alerts

**Audio System:**
- `lib/audio/sound-manager.ts` - Audio playback and management
- `lib/audio/ambient-sounds.ts` - Ambient sound library and controls
- `lib/audio/notification-sounds.ts` - Timer notification sounds
- `lib/audio/audio-mixer.ts` - Audio mixing and volume control

**Wellness Utilities:**
- `lib/wellness/breathing-patterns.ts` - Breathing exercise patterns and timing
- `lib/wellness/meditation-scripts.ts` - Guided meditation content
- `lib/wellness/stress-assessment.ts` - Stress level monitoring and feedback
- `lib/wellness/motivation-engine.ts` - Motivational content delivery

**API Routes:**
- `app/api/timer/sessions/route.ts` - Study session tracking endpoint
- `app/api/timer/analytics/route.ts` - Timer analytics and insights
- `app/api/wellness/progress/route.ts` - Wellness activity tracking

**Database Schema:**
- `supabase/migrations/013_timer_sessions.sql` - Study session tracking schema
- `supabase/migrations/014_wellness_activities.sql` - Wellness activity tracking

**Types:**
- `types/timer.ts` - Timer and session type definitions
- `types/wellness.ts` - Wellness and stress-relief types

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Pomodoro Technique Guide](https://francescocirillo.com/pages/pomodoro-technique)
  - Specific section: Timer intervals, break scheduling, and productivity principles
  - Why: Scientific foundation for effective study time management
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
  - Specific section: Audio playback, mixing, and control
  - Why: Essential for ambient sounds and notification audio
- [Breathing Exercise Techniques](https://www.healthline.com/health/breathing-exercises)
  - Specific section: 4-7-8 breathing, box breathing, and relaxation techniques
  - Why: Evidence-based stress relief and focus enhancement methods
- [Focus and Attention Research](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4635443/)
  - Specific section: Attention management and distraction reduction
  - Why: Scientific basis for focus mode design and effectiveness

### Patterns to Follow

**Timer State Management Pattern:**
```typescript
interface TimerState {
  isRunning: boolean;
  timeRemaining: number;
  currentPhase: 'work' | 'shortBreak' | 'longBreak';
  sessionCount: number;
  totalStudyTime: number;
}

const useTimer = (initialTime: number) => {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    timeRemaining: initialTime,
    currentPhase: 'work',
    sessionCount: 0,
    totalStudyTime: 0
  });
  
  // Timer logic and controls
};
```

**Audio Management Pattern:**
```typescript
class AudioManager {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer>;
  
  async loadSound(name: string, url: string): Promise<void> {
    // Load and cache audio files
  }
  
  playSound(name: string, volume: number = 1): void {
    // Play audio with volume control
  }
  
  stopAllSounds(): void {
    // Stop all playing audio
  }
}
```

**Focus Mode Pattern:**
```typescript
interface FocusSettings {
  ambientSound: string | null;
  distractionBlocking: boolean;
  breathingReminders: boolean;
  motivationalQuotes: boolean;
  zenMode: boolean;
}

const useFocusMode = (settings: FocusSettings) => {
  // Focus mode state and controls
};
```

---

## IMPLEMENTATION PLAN

### Phase 1: Core Timer System

Build the foundation timer system with Pomodoro technique and basic session management.

**Tasks:**
- Create timer state management and controls
- Implement Pomodoro technique with work/break cycles
- Build customizable timer with user preferences
- Add timer notifications and alerts

### Phase 2: Focus Mode Features

Develop focus-enhancing features including distraction blocking and ambient sounds.

**Tasks:**
- Create distraction-free interface modes
- Implement ambient sound system with audio management
- Build focus settings and customization options
- Add visual focus aids and minimal interfaces

### Phase 3: Stress Relief & Wellness

Add stress management tools including breathing exercises and meditation features.

**Tasks:**
- Implement guided breathing exercises with visual guides
- Create meditation timer with guided sessions
- Build stress assessment and relief recommendations
- Add motivational content and encouragement system

### Phase 4: Analytics & Tracking

Develop comprehensive tracking for study sessions and wellness activities.

**Tasks:**
- Build study session analytics and insights
- Create time tracking with productivity metrics
- Implement wellness activity tracking
- Add progress visualization and goal setting

### Phase 5: Integration & Polish

Integrate timer features with existing systems and add polish for optimal user experience.

**Tasks:**
- Integrate with gamification system for study achievements
- Add PWA support for background timers
- Create smooth animations and transitions
- Optimize performance and accessibility

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE types/timer.ts

- **IMPLEMENT**: Timer and study session type definitions
- **PATTERN**: TypeScript interfaces for timer states and session data
- **IMPORTS**: User types, analytics types
- **GOTCHA**: Include all timer phases, session tracking, and analytics data
- **VALIDATE**: `npx tsc --noEmit`

### CREATE types/wellness.ts

- **IMPLEMENT**: Wellness and stress-relief type definitions
- **PATTERN**: Interface-based types for wellness activities and tracking
- **IMPORTS**: Timer types, user activity types
- **GOTCHA**: Include breathing patterns, meditation sessions, and stress metrics
- **VALIDATE**: `npx tsc --noEmit`

### CREATE supabase/migrations/013_timer_sessions.sql

- **IMPLEMENT**: Study session tracking database schema
- **PATTERN**: SQL schema optimized for session analytics and tracking
- **IMPORTS**: None required
- **GOTCHA**: Include session duration, productivity metrics, and user preferences
- **VALIDATE**: `supabase db push` and verify timer schema

### CREATE supabase/migrations/014_wellness_activities.sql

- **IMPLEMENT**: Wellness activity tracking database schema
- **PATTERN**: SQL schema for wellness and stress-relief activity tracking
- **IMPORTS**: None required
- **GOTCHA**: Include breathing exercises, meditation sessions, and stress assessments
- **VALIDATE**: `supabase db push` and verify wellness schema

### CREATE lib/timer/pomodoro-engine.ts

- **IMPLEMENT**: Pomodoro technique implementation with work/break cycles
- **PATTERN**: Timer engine with phase management and automatic transitions
- **IMPORTS**: Timer types, notification utilities
- **GOTCHA**: Handle work sessions, short breaks, long breaks, and cycle counting
- **VALIDATE**: Test Pomodoro cycles with different timing configurations

### CREATE lib/timer/session-manager.ts

- **IMPLEMENT**: Study session management and tracking system
- **PATTERN**: Session management with start/stop/pause functionality
- **IMPORTS**: Timer types, database client, analytics utilities
- **GOTCHA**: Track session duration, productivity, and interruptions
- **VALIDATE**: Test session management with various session scenarios

### CREATE lib/timer/break-scheduler.ts

- **IMPLEMENT**: Break reminder and scheduling system
- **PATTERN**: Scheduling system with customizable break intervals
- **IMPORTS**: Timer types, notification manager
- **GOTCHA**: Handle different break types and user preferences
- **VALIDATE**: Test break scheduling with various timing preferences

### CREATE lib/timer/time-tracker.ts

- **IMPLEMENT**: Time tracking and analytics for study sessions
- **PATTERN**: Analytics engine with productivity metrics calculation
- **IMPORTS**: Session data, analytics types, statistical utilities
- **GOTCHA**: Calculate meaningful productivity metrics and trends
- **VALIDATE**: Test time tracking with sample session data

### CREATE lib/audio/sound-manager.ts

- **IMPLEMENT**: Audio playback and management system
- **PATTERN**: Audio manager with loading, playback, and volume control
- **IMPORTS**: Web Audio API, audio types
- **GOTCHA**: Handle audio loading, mixing, and browser compatibility
- **VALIDATE**: Test audio management with different sound files

### CREATE lib/audio/ambient-sounds.ts

- **IMPLEMENT**: Ambient sound library and playback controls
- **PATTERN**: Sound library with categorized ambient sounds
- **IMPORTS**: Sound manager, audio utilities
- **GOTCHA**: Provide variety of focus-enhancing ambient sounds
- **VALIDATE**: Test ambient sound playback and mixing

### CREATE lib/wellness/breathing-patterns.ts

- **IMPLEMENT**: Breathing exercise patterns and timing algorithms
- **PATTERN**: Breathing pattern definitions with timing and guidance
- **IMPORTS**: Wellness types, timer utilities
- **GOTCHA**: Include scientifically-backed breathing techniques
- **VALIDATE**: Test breathing patterns with different techniques

### CREATE lib/wellness/meditation-scripts.ts

- **IMPLEMENT**: Guided meditation content and session management
- **PATTERN**: Meditation content library with session timing
- **IMPORTS**: Wellness types, audio manager
- **GOTCHA**: Provide calming, effective meditation guidance
- **VALIDATE**: Test meditation scripts with different session lengths

### CREATE lib/wellness/stress-assessment.ts

- **IMPLEMENT**: Stress level monitoring and feedback system
- **PATTERN**: Stress assessment with recommendations and tracking
- **IMPORTS**: Wellness types, user activity data
- **GOTCHA**: Provide helpful stress management recommendations
- **VALIDATE**: Test stress assessment with various user scenarios

### CREATE components/timer/TimerDisplay.tsx

- **IMPLEMENT**: Visual timer display with smooth animations
- **PATTERN**: Timer display component with circular progress and animations
- **IMPORTS**: Timer types, animation utilities, progress components
- **GOTCHA**: Create visually appealing, easy-to-read timer display
- **VALIDATE**: Test timer display with different time values and states

### CREATE components/timer/TimerControls.tsx

- **IMPLEMENT**: Timer control buttons and settings interface
- **PATTERN**: Control component with play/pause/stop/settings functionality
- **IMPORTS**: Timer hooks, UI components, settings utilities
- **GOTCHA**: Provide intuitive timer controls with clear visual feedback
- **VALIDATE**: Test timer controls with different timer states

### CREATE components/timer/PomodoroTimer.tsx

- **IMPLEMENT**: Dedicated Pomodoro technique timer component
- **PATTERN**: Pomodoro timer with work/break cycle visualization
- **IMPORTS**: Pomodoro engine, timer display, timer controls
- **GOTCHA**: Show current phase, cycle progress, and next phase preview
- **VALIDATE**: Test Pomodoro timer with complete work/break cycles

### CREATE components/timer/StudyTimer.tsx

- **IMPLEMENT**: Main study timer with multiple timer modes
- **PATTERN**: Timer container with mode selection and session tracking
- **IMPORTS**: All timer components, session manager, analytics
- **GOTCHA**: Integrate all timer functionality in cohesive interface
- **VALIDATE**: Test study timer with different modes and settings

### CREATE components/focus/AmbientSounds.tsx

- **IMPLEMENT**: Background sound selection and audio player
- **PATTERN**: Sound selection interface with playback controls
- **IMPORTS**: Ambient sounds library, audio manager, UI components
- **GOTCHA**: Provide sound preview and smooth volume transitions
- **VALIDATE**: Test ambient sounds with different sound categories

### CREATE components/focus/DistractionBlocker.tsx

- **IMPLEMENT**: Distraction-free interface overlay and controls
- **PATTERN**: Overlay component with distraction blocking features
- **IMPORTS**: Focus settings, UI utilities, animation components
- **GOTCHA**: Block distractions without hindering legitimate functionality
- **VALIDATE**: Test distraction blocking with various interface elements

### CREATE components/focus/FocusMode.tsx

- **IMPLEMENT**: Main focus mode container with all focus features
- **PATTERN**: Focus mode orchestrator with settings and feature integration
- **IMPORTS**: All focus components, focus settings, timer integration
- **GOTCHA**: Coordinate all focus features for optimal user experience
- **VALIDATE**: Test focus mode with different settings combinations

### CREATE components/wellness/BreathingExercise.tsx

- **IMPLEMENT**: Interactive breathing exercise with visual guidance
- **PATTERN**: Breathing guide with animated visual cues and timing
- **IMPORTS**: Breathing patterns, animation utilities, wellness types
- **GOTCHA**: Provide clear, calming visual guidance for breathing
- **VALIDATE**: Test breathing exercises with different patterns

### CREATE components/wellness/MeditationTimer.tsx

- **IMPLEMENT**: Guided meditation timer with audio and visual guidance
- **PATTERN**: Meditation timer with guided content and progress tracking
- **IMPORTS**: Meditation scripts, audio manager, timer utilities
- **GOTCHA**: Create calming, distraction-free meditation experience
- **VALIDATE**: Test meditation timer with different session lengths

### CREATE components/wellness/StressReliefCenter.tsx

- **IMPLEMENT**: Stress management tools hub and dashboard
- **PATTERN**: Wellness dashboard with stress relief tool access
- **IMPORTS**: All wellness components, stress assessment, progress tracking
- **GOTCHA**: Provide easy access to stress relief tools when needed
- **VALIDATE**: Test stress relief center with various wellness activities

### CREATE hooks/useTimer.ts

- **IMPLEMENT**: Timer state management and control hook
- **PATTERN**: Custom hook with timer state, controls, and session tracking
- **IMPORTS**: Timer utilities, session manager, React hooks
- **GOTCHA**: Handle timer state persistence and background operation
- **VALIDATE**: Test timer hook with React Testing Library

### CREATE hooks/useFocusMode.ts

- **IMPLEMENT**: Focus mode state and settings management hook
- **PATTERN**: Custom hook with focus settings and distraction management
- **IMPORTS**: Focus utilities, user preferences, React hooks
- **GOTCHA**: Manage focus mode state and user preference persistence
- **VALIDATE**: Test focus mode hook with different settings

### CREATE hooks/useWellness.ts

- **IMPLEMENT**: Wellness activity tracking and management hook
- **PATTERN**: Custom hook with wellness activity state and progress
- **IMPORTS**: Wellness utilities, progress tracking, React hooks
- **GOTCHA**: Track wellness activities and provide progress insights
- **VALIDATE**: Test wellness hook with various activity scenarios

### CREATE app/api/timer/sessions/route.ts

- **IMPLEMENT**: Study session tracking API endpoint
- **PATTERN**: Next.js API route with session data management
- **IMPORTS**: Session manager, database client, user authentication
- **GOTCHA**: Handle session creation, updates, and analytics
- **VALIDATE**: `curl -X POST http://localhost:3000/api/timer/sessions`

### CREATE app/api/timer/analytics/route.ts

- **IMPLEMENT**: Timer analytics and insights API endpoint
- **PATTERN**: Next.js API route with analytics calculations
- **IMPORTS**: Time tracker, analytics utilities, performance metrics
- **GOTCHA**: Provide meaningful productivity insights and trends
- **VALIDATE**: Test analytics API with session data

### CREATE app/api/wellness/progress/route.ts

- **IMPLEMENT**: Wellness activity tracking API endpoint
- **PATTERN**: Next.js API route with wellness progress management
- **IMPORTS**: Wellness utilities, progress tracking, user data
- **GOTCHA**: Track wellness activities and provide progress feedback
- **VALIDATE**: Test wellness API with activity data

### CREATE app/timer/page.tsx

- **IMPLEMENT**: Study timer page with full timer functionality
- **PATTERN**: Next.js page with timer interface and settings
- **IMPORTS**: Study timer component, focus mode, wellness center
- **GOTCHA**: Integrate all timer features in cohesive page experience
- **VALIDATE**: Navigate to /timer and test all timer functionality

### CREATE app/focus/page.tsx

- **IMPLEMENT**: Focus mode page with distraction-free interface
- **PATTERN**: Next.js page optimized for focus and concentration
- **IMPORTS**: Focus mode components, minimal UI, timer integration
- **GOTCHA**: Create truly distraction-free environment for studying
- **VALIDATE**: Navigate to /focus and test focus mode features

### CREATE app/wellness/page.tsx

- **IMPLEMENT**: Wellness center page with stress relief tools
- **PATTERN**: Next.js page with wellness activities and tracking
- **IMPORTS**: Wellness components, progress tracking, user dashboard
- **GOTCHA**: Provide calming, supportive wellness experience
- **VALIDATE**: Navigate to /wellness and test stress relief features

### UPDATE components/exam/ExamInterface.tsx

- **IMPLEMENT**: Integrate timer and focus features into exam interface
- **PATTERN**: Add timer and focus mode options to exam taking
- **IMPORTS**: Timer hooks, focus mode utilities, wellness components
- **GOTCHA**: Enhance exam experience without adding complexity
- **VALIDATE**: Test exam interface with timer and focus features

---

## TESTING STRATEGY

### Unit Tests

**Framework**: Jest with React Testing Library and timer testing utilities
**Scope**: Timer logic, wellness algorithms, and component functionality
**Coverage**: 85% minimum for timer and wellness logic

### Integration Tests

**Framework**: Playwright for end-to-end timer and focus workflows
**Scope**: Complete study session and wellness activity flows
**Coverage**: Timer functionality, focus mode, and stress relief features

### Audio Tests

**Framework**: Custom audio testing with Web Audio API mocks
**Scope**: Audio playback, mixing, and ambient sound functionality
**Coverage**: All audio features and browser compatibility

### Wellness Tests

**Framework**: Custom testing for breathing and meditation features
**Scope**: Breathing exercise timing and meditation session functionality
**Coverage**: All wellness activities and stress relief tools

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
npm run test -- --testPathPattern=timer
npm run test -- --testPathPattern=wellness
npm run test:coverage
```

### Level 3: Integration Tests
```bash
npm run dev
npx playwright test --grep "timer"
npx playwright test --grep "focus mode"
```

### Level 4: Manual Validation
- Test complete Pomodoro cycles with work and break phases
- Verify ambient sounds play correctly and mix properly
- Test breathing exercises with different patterns
- Validate focus mode blocks distractions effectively
- Test timer persistence across page navigation

---

## ACCEPTANCE CRITERIA

- [ ] Pomodoro timer works with accurate work/break cycles
- [ ] Custom timers allow flexible study session timing
- [ ] Focus mode provides distraction-free study environment
- [ ] Ambient sounds enhance concentration without distraction
- [ ] Breathing exercises provide effective stress relief
- [ ] Meditation timer guides users through calming sessions
- [ ] Study session tracking provides meaningful analytics
- [ ] Timer notifications work without being disruptive
- [ ] All audio features work across different browsers
- [ ] Wellness activities help reduce study-related stress

---

## NOTES

**Psychology**: Based on proven productivity and stress management techniques
**Audio**: Optimized for focus enhancement and stress relief
**Accessibility**: All timer and wellness features are accessible to all users
**Performance**: Timer accuracy and smooth animations without performance impact
**Integration**: Seamless integration with existing exam and study features
