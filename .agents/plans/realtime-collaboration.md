# Feature: Real-time Collaboration Features

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement real-time collaboration features that enable students to study together, share exams, participate in live study sessions, and engage in collaborative learning experiences. The system includes WebSocket-based real-time communication, shared study rooms, live exam sessions, peer-to-peer learning, and collaborative question creation.

## User Story

As a student preparing for exams
I want to study with other students in real-time and share practice exams
So that I can learn collaboratively, stay motivated through peer interaction, and benefit from shared knowledge and different perspectives

## Problem Statement

Students often study in isolation, missing opportunities for collaborative learning, peer motivation, and knowledge sharing. Traditional study methods don't facilitate real-time interaction, shared learning experiences, or collaborative exam preparation, leading to reduced engagement and missed learning opportunities.

## Solution Statement

Build a comprehensive real-time collaboration system using WebSocket technology, shared study rooms, live exam sessions, and peer interaction features. The system will enable students to study together, share resources, participate in group challenges, and learn from each other while maintaining privacy and security.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Real-time communication, collaborative features, shared sessions, peer interaction
**Dependencies**: WebSocket technology, real-time database, presence system, collaborative editing

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

This feature builds upon existing systems:

- `.agents/plans/supabase-user-authentication.md` - User system for collaboration identity
- `.agents/plans/world-class-exam-interface.md` - Exam interface for collaborative sessions
- `.agents/plans/ai-question-generation.md` - Question sharing and collaborative creation
- `.agents/plans/gamification-system.md` - Group achievements and collaborative rewards

### New Files to Create

**Real-time Infrastructure:**
- `lib/realtime/websocket-manager.ts` - WebSocket connection and message handling
- `lib/realtime/presence-system.ts` - User presence and status tracking
- `lib/realtime/room-manager.ts` - Study room creation and management
- `lib/realtime/sync-engine.ts` - Real-time data synchronization
- `lib/realtime/collaboration-events.ts` - Collaboration event handling and broadcasting

**Study Room Components:**
- `components/collaboration/StudyRoom.tsx` - Main study room interface
- `components/collaboration/RoomLobby.tsx` - Room selection and joining interface
- `components/collaboration/ParticipantList.tsx` - Active participants display
- `components/collaboration/ChatSystem.tsx` - Real-time chat functionality
- `components/collaboration/ScreenShare.tsx` - Screen sharing capabilities
- `components/collaboration/WhiteboardTool.tsx` - Collaborative whiteboard

**Live Exam Features:**
- `components/collaboration/LiveExamSession.tsx` - Synchronized exam taking
- `components/collaboration/ExamSpectator.tsx` - Watch others take exams
- `components/collaboration/GroupChallenge.tsx` - Competitive group exams
- `components/collaboration/PeerReview.tsx` - Collaborative answer review
- `components/collaboration/LiveLeaderboard.tsx` - Real-time performance comparison

**Collaborative Tools:**
- `components/collaboration/SharedNotes.tsx` - Collaborative note-taking
- `components/collaboration/QuestionBuilder.tsx` - Collaborative question creation
- `components/collaboration/StudyPlanner.tsx` - Group study planning
- `components/collaboration/ResourceSharing.tsx` - File and resource sharing
- `components/collaboration/VoiceChat.tsx` - Voice communication system

**Collaboration Logic:**
- `lib/collaboration/room-orchestrator.ts` - Study room coordination and management
- `lib/collaboration/permission-manager.ts` - Collaboration permissions and roles
- `lib/collaboration/activity-tracker.ts` - Collaborative activity tracking
- `lib/collaboration/notification-system.ts` - Collaboration notifications
- `lib/collaboration/moderation-tools.ts` - Content moderation and safety

**API Routes:**
- `app/api/collaboration/rooms/route.ts` - Study room management endpoint
- `app/api/collaboration/sessions/route.ts` - Live session management
- `app/api/collaboration/chat/route.ts` - Chat message handling
- `app/api/collaboration/sharing/route.ts` - Resource sharing endpoint

**Database Schema:**
- `supabase/migrations/015_collaboration_rooms.sql` - Study room and session schema
- `supabase/migrations/016_realtime_events.sql` - Real-time event tracking schema

**Types:**
- `types/collaboration.ts` - Collaboration feature type definitions
- `types/realtime.ts` - Real-time communication types

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
  - Specific section: Real-time subscriptions and presence
  - Why: Foundation for real-time collaboration features
- [WebRTC Documentation](https://webrtc.org/getting-started/overview)
  - Specific section: Peer-to-peer communication and screen sharing
  - Why: Essential for voice chat and screen sharing features
- [Socket.IO Documentation](https://socket.io/docs/v4/)
  - Specific section: Real-time bidirectional communication
  - Why: Alternative WebSocket implementation for collaboration
- [Collaborative Editing Algorithms](https://en.wikipedia.org/wiki/Operational_transformation)
  - Specific section: Conflict resolution and synchronization
  - Why: Technical foundation for collaborative editing features

### Patterns to Follow

**Real-time Connection Pattern:**
```typescript
class CollaborationManager {
  private socket: WebSocket;
  private roomId: string;
  private userId: string;
  
  async joinRoom(roomId: string): Promise<void> {
    // Join study room and establish real-time connection
  }
  
  sendMessage(type: string, data: any): void {
    // Send real-time message to room participants
  }
  
  onMessage(callback: (message: CollaborationMessage) => void): void {
    // Handle incoming real-time messages
  }
}
```

**Presence System Pattern:**
```typescript
interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'studying' | 'in-exam';
  lastSeen: Date;
  currentActivity: string;
}

const usePresence = (roomId: string) => {
  const [participants, setParticipants] = useState<UserPresence[]>([]);
  
  // Manage user presence and status updates
};
```

**Collaborative State Pattern:**
```typescript
interface CollaborativeState {
  participants: UserPresence[];
  sharedData: any;
  permissions: RoomPermissions;
  activity: CollaborativeActivity;
}

const useCollaborativeState = (roomId: string) => {
  // Manage shared state across participants
};
```

---

## IMPLEMENTATION PLAN

### Phase 1: Real-time Infrastructure

Build the foundation for real-time communication and collaboration.

**Tasks:**
- Set up WebSocket infrastructure and connection management
- Implement user presence system and status tracking
- Create room management and participant coordination
- Build real-time data synchronization engine

### Phase 2: Study Room System

Develop collaborative study rooms with chat and shared activities.

**Tasks:**
- Create study room interface and lobby system
- Implement real-time chat functionality
- Build participant management and permissions
- Add collaborative whiteboard and note-taking

### Phase 3: Live Exam Features

Add real-time exam collaboration and competitive features.

**Tasks:**
- Implement synchronized exam taking sessions
- Create group challenges and competitions
- Build live leaderboards and performance comparison
- Add peer review and collaborative grading

### Phase 4: Advanced Collaboration

Develop advanced collaboration tools and communication features.

**Tasks:**
- Add voice chat and screen sharing capabilities
- Implement collaborative question creation
- Build resource sharing and file collaboration
- Create group study planning tools

### Phase 5: Safety & Moderation

Implement safety features, content moderation, and privacy controls.

**Tasks:**
- Add content moderation and reporting systems
- Implement privacy controls and permission management
- Create safety guidelines and community standards
- Build administrative tools for room management

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE types/collaboration.ts

- **IMPLEMENT**: Collaboration feature type definitions
- **PATTERN**: TypeScript interfaces for collaboration features and real-time data
- **IMPORTS**: User types, room types, message types
- **GOTCHA**: Include all collaboration mechanics and real-time communication types
- **VALIDATE**: `npx tsc --noEmit`

### CREATE types/realtime.ts

- **IMPLEMENT**: Real-time communication type definitions
- **PATTERN**: Interface-based types for WebSocket messages and presence
- **IMPORTS**: Collaboration types, user types
- **GOTCHA**: Include message types, presence states, and synchronization data
- **VALIDATE**: `npx tsc --noEmit`

### CREATE supabase/migrations/015_collaboration_rooms.sql

- **IMPLEMENT**: Study room and collaboration session database schema
- **PATTERN**: SQL schema optimized for real-time collaboration queries
- **IMPORTS**: None required
- **GOTCHA**: Include room management, participant tracking, and session data
- **VALIDATE**: `supabase db push` and verify collaboration schema

### CREATE supabase/migrations/016_realtime_events.sql

- **IMPLEMENT**: Real-time event tracking and message history schema
- **PATTERN**: SQL schema for event logging and message persistence
- **IMPORTS**: None required
- **GOTCHA**: Include event types, message history, and activity tracking
- **VALIDATE**: `supabase db push` and verify realtime events schema

### CREATE lib/realtime/websocket-manager.ts

- **IMPLEMENT**: WebSocket connection and message handling system
- **PATTERN**: WebSocket manager with connection lifecycle and message routing
- **IMPORTS**: Realtime types, event utilities, connection management
- **GOTCHA**: Handle connection drops, reconnection, and message queuing
- **VALIDATE**: Test WebSocket connection and message handling

### CREATE lib/realtime/presence-system.ts

- **IMPLEMENT**: User presence and status tracking system
- **PATTERN**: Presence management with status updates and heartbeat
- **IMPORTS**: User types, realtime types, WebSocket manager
- **GOTCHA**: Handle presence updates, status changes, and offline detection
- **VALIDATE**: Test presence tracking with multiple users

### CREATE lib/realtime/room-manager.ts

- **IMPLEMENT**: Study room creation and management system
- **PATTERN**: Room orchestration with participant management and permissions
- **IMPORTS**: Collaboration types, presence system, database client
- **GOTCHA**: Handle room lifecycle, participant limits, and access control
- **VALIDATE**: Test room creation, joining, and management

### CREATE lib/realtime/sync-engine.ts

- **IMPLEMENT**: Real-time data synchronization engine
- **PATTERN**: Data sync with conflict resolution and state management
- **IMPORTS**: Realtime types, collaboration state, WebSocket manager
- **GOTCHA**: Handle data conflicts, synchronization order, and consistency
- **VALIDATE**: Test data synchronization with concurrent updates

### CREATE lib/collaboration/room-orchestrator.ts

- **IMPLEMENT**: Study room coordination and activity management
- **PATTERN**: Room orchestrator with activity coordination and state management
- **IMPORTS**: Room manager, sync engine, collaboration types
- **GOTCHA**: Coordinate multiple activities and maintain room state
- **VALIDATE**: Test room orchestration with various activities

### CREATE lib/collaboration/permission-manager.ts

- **IMPLEMENT**: Collaboration permissions and role management
- **PATTERN**: Permission system with role-based access control
- **IMPORTS**: User types, collaboration types, room management
- **GOTCHA**: Handle permission inheritance, role changes, and access validation
- **VALIDATE**: Test permission management with different user roles

### CREATE lib/collaboration/activity-tracker.ts

- **IMPLEMENT**: Collaborative activity tracking and analytics
- **PATTERN**: Activity tracking with engagement metrics and insights
- **IMPORTS**: Collaboration types, analytics utilities, database client
- **GOTCHA**: Track meaningful collaboration metrics and user engagement
- **VALIDATE**: Test activity tracking with collaborative sessions

### CREATE components/collaboration/RoomLobby.tsx

- **IMPLEMENT**: Room selection and joining interface
- **PATTERN**: Lobby component with room browsing and creation
- **IMPORTS**: Room manager, UI components, user authentication
- **GOTCHA**: Show available rooms, participant counts, and join options
- **VALIDATE**: Test room lobby with room creation and joining

### CREATE components/collaboration/ParticipantList.tsx

- **IMPLEMENT**: Active participants display with presence indicators
- **PATTERN**: Participant list with real-time presence and status updates
- **IMPORTS**: Presence system, user types, UI components
- **GOTCHA**: Show participant status, activity, and interaction options
- **VALIDATE**: Test participant list with presence updates

### CREATE components/collaboration/ChatSystem.tsx

- **IMPLEMENT**: Real-time chat functionality with message history
- **PATTERN**: Chat component with message sending, receiving, and history
- **IMPORTS**: WebSocket manager, message types, UI components
- **GOTCHA**: Handle message ordering, delivery confirmation, and history
- **VALIDATE**: Test chat system with multiple participants

### CREATE components/collaboration/StudyRoom.tsx

- **IMPLEMENT**: Main study room interface with all collaboration features
- **PATTERN**: Room container orchestrating all collaboration components
- **IMPORTS**: All collaboration components, room orchestrator, presence system
- **GOTCHA**: Coordinate all room features and maintain consistent state
- **VALIDATE**: Test complete study room functionality

### CREATE components/collaboration/SharedNotes.tsx

- **IMPLEMENT**: Collaborative note-taking with real-time synchronization
- **PATTERN**: Collaborative editor with operational transformation
- **IMPORTS**: Sync engine, text editor utilities, collaboration types
- **GOTCHA**: Handle concurrent editing, conflict resolution, and formatting
- **VALIDATE**: Test collaborative note editing with multiple users

### CREATE components/collaboration/WhiteboardTool.tsx

- **IMPLEMENT**: Collaborative whiteboard with drawing and annotation tools
- **PATTERN**: Canvas-based whiteboard with real-time drawing synchronization
- **IMPORTS**: Canvas utilities, sync engine, drawing tools
- **GOTCHA**: Synchronize drawing operations, handle different drawing tools
- **VALIDATE**: Test whiteboard collaboration with drawing and annotations

### CREATE components/collaboration/LiveExamSession.tsx

- **IMPLEMENT**: Synchronized exam taking with real-time progress
- **PATTERN**: Exam component with synchronized timing and progress sharing
- **IMPORTS**: Exam interface, sync engine, timer utilities
- **GOTCHA**: Synchronize exam timing, question progression, and results
- **VALIDATE**: Test live exam sessions with multiple participants

### CREATE components/collaboration/GroupChallenge.tsx

- **IMPLEMENT**: Competitive group exam challenges
- **PATTERN**: Challenge component with real-time scoring and competition
- **IMPORTS**: Live exam session, leaderboard, gamification utilities
- **GOTCHA**: Handle fair competition, scoring, and real-time updates
- **VALIDATE**: Test group challenges with competitive scoring

### CREATE components/collaboration/LiveLeaderboard.tsx

- **IMPLEMENT**: Real-time performance comparison and ranking
- **PATTERN**: Leaderboard with live score updates and ranking changes
- **IMPORTS**: Performance data, sync engine, ranking utilities
- **GOTCHA**: Update rankings in real-time, handle score ties and changes
- **VALIDATE**: Test live leaderboard with score updates

### CREATE components/collaboration/VoiceChat.tsx

- **IMPLEMENT**: Voice communication system using WebRTC
- **PATTERN**: Voice chat with mute/unmute controls and audio management
- **IMPORTS**: WebRTC utilities, audio management, permission handling
- **GOTCHA**: Handle audio permissions, quality, and connection management
- **VALIDATE**: Test voice chat with multiple participants

### CREATE components/collaboration/ScreenShare.tsx

- **IMPLEMENT**: Screen sharing capabilities for collaborative learning
- **PATTERN**: Screen sharing with viewer controls and quality management
- **IMPORTS**: WebRTC screen capture, video streaming utilities
- **GOTCHA**: Handle screen capture permissions and streaming quality
- **VALIDATE**: Test screen sharing with different content types

### CREATE app/api/collaboration/rooms/route.ts

- **IMPLEMENT**: Study room management API endpoint
- **PATTERN**: Next.js API route with room CRUD operations
- **IMPORTS**: Room manager, user authentication, database client
- **GOTCHA**: Handle room creation, updates, and participant management
- **VALIDATE**: `curl -X POST http://localhost:3000/api/collaboration/rooms`

### CREATE app/api/collaboration/sessions/route.ts

- **IMPLEMENT**: Live session management API endpoint
- **PATTERN**: Next.js API route with session lifecycle management
- **IMPORTS**: Session manager, collaboration orchestrator, real-time sync
- **GOTCHA**: Handle session creation, participant joining, and cleanup
- **VALIDATE**: Test session API with live collaboration scenarios

### CREATE app/api/collaboration/chat/route.ts

- **IMPLEMENT**: Chat message handling API endpoint
- **PATTERN**: Next.js API route with message processing and moderation
- **IMPORTS**: Chat system, message validation, moderation tools
- **GOTCHA**: Handle message validation, moderation, and history storage
- **VALIDATE**: Test chat API with message sending and moderation

### CREATE hooks/useCollaboration.ts

- **IMPLEMENT**: Collaboration state and functionality management hook
- **PATTERN**: Custom hook with collaboration features and real-time updates
- **IMPORTS**: Collaboration utilities, WebSocket manager, React hooks
- **GOTCHA**: Handle collaboration state, real-time updates, and cleanup
- **VALIDATE**: Test collaboration hook with React Testing Library

### CREATE hooks/useRealtime.ts

- **IMPLEMENT**: Real-time communication management hook
- **PATTERN**: Custom hook with WebSocket connection and message handling
- **IMPORTS**: WebSocket manager, realtime types, React hooks
- **GOTCHA**: Handle connection lifecycle, message routing, and error recovery
- **VALIDATE**: Test realtime hook with connection scenarios

### CREATE hooks/usePresence.ts

- **IMPLEMENT**: User presence tracking and status management hook
- **PATTERN**: Custom hook with presence updates and participant tracking
- **IMPORTS**: Presence system, user types, React hooks
- **GOTCHA**: Handle presence updates, status changes, and participant lists
- **VALIDATE**: Test presence hook with multiple user scenarios

### CREATE app/collaborate/page.tsx

- **IMPLEMENT**: Collaboration hub page with room access and features
- **PATTERN**: Next.js page with collaboration interface and room management
- **IMPORTS**: Collaboration components, room lobby, user authentication
- **GOTCHA**: Provide easy access to collaboration features and room joining
- **VALIDATE**: Navigate to /collaborate and test collaboration features

### CREATE app/rooms/[id]/page.tsx

- **IMPLEMENT**: Individual study room page with full collaboration features
- **PATTERN**: Dynamic Next.js page with room-specific collaboration
- **IMPORTS**: Study room component, room management, real-time features
- **GOTCHA**: Handle room access, permissions, and feature availability
- **VALIDATE**: Navigate to specific room and test all collaboration features

### UPDATE components/exam/ExamInterface.tsx

- **IMPLEMENT**: Add collaboration options to exam interface
- **PATTERN**: Integrate collaborative exam features into main exam interface
- **IMPORTS**: Live exam session, group challenge, collaboration hooks
- **GOTCHA**: Provide collaboration options without disrupting solo exam experience
- **VALIDATE**: Test exam interface with collaboration features enabled

---

## TESTING STRATEGY

### Unit Tests

**Framework**: Jest with WebSocket mocking and React Testing Library
**Scope**: Collaboration logic, real-time communication, and component functionality
**Coverage**: 85% minimum for collaboration and real-time features

### Integration Tests

**Framework**: Playwright with multi-browser testing for collaboration
**Scope**: Complete collaboration workflows with multiple participants
**Coverage**: Room creation, joining, chat, and collaborative activities

### Real-time Tests

**Framework**: Custom WebSocket testing with multiple connections
**Scope**: Real-time communication, synchronization, and presence
**Coverage**: All real-time features and edge cases

### Load Tests

**Framework**: Load testing for concurrent collaboration sessions
**Scope**: Performance with multiple rooms and participants
**Coverage**: Scalability and performance under load

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
npm run test -- --testPathPattern=collaboration
npm run test -- --testPathPattern=realtime
npm run test:coverage
```

### Level 3: Integration Tests
```bash
npm run dev
npx playwright test --grep "collaboration" --workers=2
```

### Level 4: Real-time Tests
```bash
npm run test:realtime
npm run test:websocket-connections
npm run test:collaboration-sync
```

### Level 5: Manual Validation
- Create study room and invite multiple participants
- Test real-time chat with message delivery and history
- Verify collaborative whiteboard synchronization
- Test live exam sessions with synchronized timing
- Validate voice chat and screen sharing functionality

---

## ACCEPTANCE CRITERIA

- [ ] Students can create and join study rooms in real-time
- [ ] Real-time chat works smoothly with message history
- [ ] Collaborative whiteboard synchronizes drawing across participants
- [ ] Live exam sessions maintain synchronized timing and progress
- [ ] Voice chat provides clear audio communication
- [ ] Screen sharing works for collaborative learning
- [ ] Presence system accurately shows participant status
- [ ] Group challenges provide fair competitive experiences
- [ ] Collaborative note-taking handles concurrent editing
- [ ] Safety and moderation tools protect user experience

---

## NOTES

**Privacy**: All collaboration features respect user privacy and consent
**Safety**: Comprehensive moderation tools and community guidelines
**Performance**: Optimized for real-time performance with multiple participants
**Scalability**: Designed to handle multiple concurrent collaboration sessions
**Accessibility**: All collaboration features are accessible to users with disabilities
