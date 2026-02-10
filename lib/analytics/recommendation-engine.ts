import { StudyRecommendation } from '@/types/analytics'
import { PerformanceMetrics, DetailedPerformance } from '@/types/performance'
import { KnowledgeGap, TopicMastery } from '@/types/analytics'
import { StudyHabits } from './study-pattern-analyzer'

export interface PersonalizedRecommendations {
  immediate_actions: ActionableRecommendation[]
  weekly_goals: WeeklyGoal[]
  study_strategy: StudyStrategy
  motivation_boosters: MotivationBooster[]
  adaptive_suggestions: AdaptiveSuggestion[]
}

export interface ActionableRecommendation {
  id: string
  title: string
  description: string
  category: 'study_technique' | 'time_management' | 'knowledge_gap' | 'motivation' | 'health'
  priority: 'high' | 'medium' | 'low'
  estimated_time: number
  expected_impact: number
  difficulty: 'easy' | 'medium' | 'hard'
  steps: string[]
  success_metrics: string[]
}

export interface WeeklyGoal {
  goal_type: 'accuracy' | 'speed' | 'consistency' | 'coverage' | 'streak'
  target_value: number
  current_value: number
  progress_percentage: number
  recommended_actions: string[]
  reward_suggestion: string
}

export interface StudyStrategy {
  primary_approach: string
  secondary_techniques: string[]
  focus_areas: string[]
  time_allocation: { [topic: string]: number }
  review_schedule: ReviewSchedule
}

export interface ReviewSchedule {
  daily_review: string[]
  weekly_review: string[]
  monthly_review: string[]
  spaced_repetition: SpacedRepetitionItem[]
}

export interface SpacedRepetitionItem {
  topic: string
  next_review_date: string
  interval_days: number
  difficulty_level: number
}

export interface MotivationBooster {
  type: 'achievement' | 'progress' | 'comparison' | 'gamification'
  message: string
  visual_element: string
  action_trigger: string
}

export interface AdaptiveSuggestion {
  condition: string
  suggestion: string
  confidence: number
  learning_source: string
}

export class RecommendationEngine {
  
  generatePersonalizedRecommendations(
    performance: DetailedPerformance,
    knowledgeGaps: KnowledgeGap[],
    masteryAreas: TopicMastery[],
    studyHabits: StudyHabits
  ): PersonalizedRecommendations {
    
    const immediateActions = this.generateImmediateActions(performance, knowledgeGaps, studyHabits)
    const weeklyGoals = this.generateWeeklyGoals(performance, knowledgeGaps)
    const studyStrategy = this.generateStudyStrategy(performance, knowledgeGaps, masteryAreas)
    const motivationBoosters = this.generateMotivationBoosters(performance, masteryAreas)
    const adaptiveSuggestions = this.generateAdaptiveSuggestions(performance, studyHabits)

    return {
      immediate_actions: immediateActions,
      weekly_goals: weeklyGoals,
      study_strategy: studyStrategy,
      motivation_boosters: motivationBoosters,
      adaptive_suggestions: adaptiveSuggestions
    }
  }

  private generateImmediateActions(
    performance: DetailedPerformance,
    knowledgeGaps: KnowledgeGap[],
    studyHabits: StudyHabits
  ): ActionableRecommendation[] {
    const actions: ActionableRecommendation[] = []

    // Critical knowledge gap actions
    const criticalGaps = knowledgeGaps.filter(gap => gap.improvement_needed >= 0.7)
    if (criticalGaps.length > 0) {
      const topGap = criticalGaps[0]
      if (topGap) {
        actions.push({
          id: `critical_gap_${topGap.topic}`,
          title: `Address Critical Gap in ${topGap.topic}`,
          description: `Your performance in ${topGap.topic} needs immediate attention with ${Math.round(topGap.accuracy_rate * 100)}% accuracy`,
          category: 'knowledge_gap',
          priority: 'high',
          estimated_time: 120,
          expected_impact: 85,
          difficulty: 'medium',
          steps: [
            'Review fundamental concepts',
            'Practice 10 basic questions',
            'Identify specific problem areas',
            'Create a focused study plan'
        ],
        success_metrics: ['Achieve 70%+ accuracy', 'Complete 20+ practice questions']
      })
      }
    }

    // Speed improvement actions
    if (performance.overall.average_time > 120) {
      actions.push({
        id: 'improve_speed',
        title: 'Improve Response Speed',
        description: `Your average response time of ${Math.round(performance.overall.average_time)}s can be optimized`,
        category: 'study_technique',
        priority: 'medium',
        estimated_time: 60,
        expected_impact: 60,
        difficulty: 'easy',
        steps: [
          'Practice timed questions daily',
          'Use elimination techniques',
          'Build topic familiarity',
          'Set time limits for practice'
        ],
        success_metrics: ['Reduce average time by 20%', 'Maintain accuracy above 75%']
      })
    }

    // Consistency improvement actions
    if (studyHabits.study_consistency.daily_consistency < 70) {
      actions.push({
        id: 'build_consistency',
        title: 'Build Study Consistency',
        description: `Your daily consistency of ${Math.round(studyHabits.study_consistency.daily_consistency)}% needs improvement`,
        category: 'time_management',
        priority: 'high',
        estimated_time: 15,
        expected_impact: 75,
        difficulty: 'easy',
        steps: [
          'Set a daily 15-minute minimum',
          'Choose a consistent study time',
          'Use habit tracking apps',
          'Start with easy topics'
        ],
        success_metrics: ['Study 7 days in a row', 'Achieve 80%+ daily consistency']
      })
    }

    // Health and wellness actions
    if (studyHabits.session_patterns.length > 0) {
      const firstPattern = studyHabits.session_patterns[0]
      if (firstPattern && firstPattern.typical_duration > 120) {
        actions.push({
          id: 'optimize_breaks',
          title: 'Optimize Study Breaks',
          description: 'Long study sessions without breaks can reduce effectiveness',
          category: 'health',
          priority: 'medium',
          estimated_time: 0,
          expected_impact: 40,
          difficulty: 'easy',
          steps: [
            'Take 5-minute breaks every 25 minutes',
            'Do light physical activity during breaks',
            'Stay hydrated throughout sessions',
            'Practice eye exercises'
          ],
          success_metrics: ['Maintain focus for full sessions', 'Feel less fatigued after studying']
        })
      }
    }

    return actions.slice(0, 4) // Return top 4 most important actions
  }

  private generateWeeklyGoals(
    performance: DetailedPerformance,
    knowledgeGaps: KnowledgeGap[]
  ): WeeklyGoal[] {
    const goals: WeeklyGoal[] = []

    // Accuracy goal
    const currentAccuracy = performance.overall.accuracy
    const targetAccuracy = Math.min(100, currentAccuracy + 5)
    goals.push({
      goal_type: 'accuracy',
      target_value: targetAccuracy,
      current_value: currentAccuracy,
      progress_percentage: (currentAccuracy / targetAccuracy) * 100,
      recommended_actions: [
        'Focus on weak topics',
        'Review incorrect answers',
        'Practice similar questions'
      ],
      reward_suggestion: 'Treat yourself to your favorite snack'
    })

    // Speed goal
    const currentSpeed = performance.overall.average_time
    const targetSpeed = Math.max(30, currentSpeed * 0.9)
    goals.push({
      goal_type: 'speed',
      target_value: targetSpeed,
      current_value: currentSpeed,
      progress_percentage: (targetSpeed / currentSpeed) * 100,
      recommended_actions: [
        'Practice timed questions',
        'Use quick elimination methods',
        'Build automatic responses'
      ],
      reward_suggestion: 'Watch an episode of your favorite show'
    })

    // Coverage goal (number of topics practiced)
    const topicsToImprove = knowledgeGaps.length
    goals.push({
      goal_type: 'coverage',
      target_value: Math.min(5, topicsToImprove),
      current_value: 0,
      progress_percentage: 0,
      recommended_actions: [
        'Practice one new topic daily',
        'Mix easy and difficult questions',
        'Track topic completion'
      ],
      reward_suggestion: 'Buy a new study accessory'
    })

    return goals
  }

  private generateStudyStrategy(
    performance: DetailedPerformance,
    knowledgeGaps: KnowledgeGap[],
    masteryAreas: TopicMastery[]
  ): StudyStrategy {
    
    // Determine primary approach based on performance profile
    let primaryApproach = 'balanced_practice'
    
    if (knowledgeGaps.length > masteryAreas.length) {
      primaryApproach = 'gap_focused_learning'
    } else if (performance.overall.consistency < 60) {
      primaryApproach = 'consistency_building'
    } else if (performance.overall.average_time > 120) {
      primaryApproach = 'speed_optimization'
    }

    // Secondary techniques based on specific needs
    const secondaryTechniques: string[] = []
    
    if (performance.overall.accuracy < 70) {
      secondaryTechniques.push('concept_reinforcement', 'error_analysis')
    }
    
    if (performance.overall.improvement < 0) {
      secondaryTechniques.push('motivation_techniques', 'study_method_variation')
    }
    
    secondaryTechniques.push('spaced_repetition', 'active_recall')

    // Focus areas (top 3 knowledge gaps)
    const focusAreas = knowledgeGaps
      .sort((a, b) => b.improvement_needed - a.improvement_needed)
      .slice(0, 3)
      .map(gap => gap.topic)

    // Time allocation based on improvement needed
    const timeAllocation: { [topic: string]: number } = {}
    const totalImprovement = knowledgeGaps.reduce((sum, gap) => sum + gap.improvement_needed, 0)
    
    knowledgeGaps.forEach(gap => {
      const percentage = totalImprovement > 0 ? (gap.improvement_needed / totalImprovement) * 100 : 0
      timeAllocation[gap.topic] = Math.round(percentage)
    })

    // Review schedule
    const reviewSchedule = this.createReviewSchedule(knowledgeGaps, masteryAreas)

    return {
      primary_approach: primaryApproach,
      secondary_techniques: secondaryTechniques,
      focus_areas: focusAreas,
      time_allocation: timeAllocation,
      review_schedule: reviewSchedule
    }
  }

  private createReviewSchedule(
    knowledgeGaps: KnowledgeGap[],
    masteryAreas: TopicMastery[]
  ): ReviewSchedule {
    
    // Daily review: most critical gaps
    const dailyReview = knowledgeGaps
      .filter(gap => gap.improvement_needed >= 0.7)
      .slice(0, 2)
      .map(gap => gap.topic)

    // Weekly review: moderate gaps and mastery maintenance
    const weeklyReview = knowledgeGaps
      .filter(gap => gap.improvement_needed >= 0.4 && gap.improvement_needed < 0.7)
      .slice(0, 3)
      .map(gap => gap.topic)
      .concat(masteryAreas.slice(0, 2).map(area => area.topic))

    // Monthly review: all topics for comprehensive assessment
    const monthlyReview = Array.from(new Set([
      ...knowledgeGaps.map(gap => gap.topic),
      ...masteryAreas.map(area => area.topic)
    ]))

    // Spaced repetition items
    const spacedRepetition: SpacedRepetitionItem[] = knowledgeGaps.map(gap => ({
      topic: gap.topic,
      next_review_date: this.calculateNextReviewDate(gap.improvement_needed),
      interval_days: this.calculateReviewInterval(gap.improvement_needed),
      difficulty_level: gap.improvement_needed
    }))

    return {
      daily_review: dailyReview,
      weekly_review: weeklyReview,
      monthly_review: monthlyReview,
      spaced_repetition: spacedRepetition
    }
  }

  private calculateNextReviewDate(improvementNeeded: number): string {
    const daysFromNow = improvementNeeded >= 0.7 ? 1 : 
                       improvementNeeded >= 0.4 ? 3 : 7
    
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + daysFromNow)
    return nextDate.toISOString().split('T')[0] || ''
  }

  private calculateReviewInterval(improvementNeeded: number): number {
    return improvementNeeded >= 0.7 ? 1 :
           improvementNeeded >= 0.4 ? 3 : 7
  }

  private generateMotivationBoosters(
    performance: DetailedPerformance,
    masteryAreas: TopicMastery[]
  ): MotivationBooster[] {
    const boosters: MotivationBooster[] = []

    // Achievement booster
    if (masteryAreas.length > 0) {
      boosters.push({
        type: 'achievement',
        message: `Excellent! You've mastered ${masteryAreas.length} topic${masteryAreas.length > 1 ? 's' : ''}`,
        visual_element: '🏆',
        action_trigger: 'Continue building on your strengths'
      })
    }

    // Progress booster
    if (performance.overall.improvement > 0) {
      boosters.push({
        type: 'progress',
        message: `You're improving! Your performance has increased by ${Math.round(performance.overall.improvement)}%`,
        visual_element: '📈',
        action_trigger: 'Keep up the momentum'
      })
    }

    // Consistency booster
    if (performance.overall.streak > 3) {
      boosters.push({
        type: 'achievement',
        message: `Amazing ${performance.overall.streak}-day study streak!`,
        visual_element: '🔥',
        action_trigger: 'Don\'t break the chain'
      })
    }

    return boosters
  }

  private generateAdaptiveSuggestions(
    performance: DetailedPerformance,
    studyHabits: StudyHabits
  ): AdaptiveSuggestion[] {
    const suggestions: AdaptiveSuggestion[] = []

    // Time-based adaptations
    if (studyHabits.optimal_study_times.length > 0) {
      const bestTime = studyHabits.optimal_study_times[0]
      if (bestTime) {
        suggestions.push({
          condition: 'Peak performance time detected',
          suggestion: `Schedule challenging topics at ${bestTime.hour}:00 on ${this.getDayName(bestTime.day_of_week)}`,
          confidence: bestTime.confidence,
          learning_source: 'Performance pattern analysis'
        })
      }
    }

    // Session length adaptations
    if (studyHabits.session_patterns.length > 0) {
      const firstPattern = studyHabits.session_patterns[0]
      if (firstPattern) {
        const optimalLength = firstPattern.optimal_session_length
        suggestions.push({
          condition: 'Optimal session length identified',
          suggestion: `Limit study sessions to ${optimalLength} minutes for best results`,
          confidence: 85,
          learning_source: 'Session performance analysis'
        })
      }
    }

    // Difficulty progression adaptations
    if (performance.overall.accuracy > 85) {
      suggestions.push({
        condition: 'High accuracy achieved',
        suggestion: 'Consider increasing question difficulty to maintain challenge',
        confidence: 90,
        learning_source: 'Performance threshold analysis'
      })
    }

    return suggestions
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek] || 'Unknown'
  }

  // Method to update recommendations based on user feedback
  updateRecommendationEffectiveness(
    recommendationId: string,
    userFeedback: 'helpful' | 'not_helpful' | 'completed',
    performanceChange: number
  ): void {
    // In a real implementation, this would update ML models
    // For now, we'll just log the feedback
    console.log(`Recommendation ${recommendationId} received feedback: ${userFeedback}, performance change: ${performanceChange}`)
  }

  // Method to generate contextual recommendations based on current activity
  generateContextualRecommendations(
    currentActivity: 'studying' | 'taking_exam' | 'reviewing_results' | 'planning',
    performance: DetailedPerformance
  ): ActionableRecommendation[] {
    const contextualActions: ActionableRecommendation[] = []

    switch (currentActivity) {
      case 'studying':
        if (performance.overall.accuracy < 70) {
          contextualActions.push({
            id: 'study_context_slow_down',
            title: 'Slow Down and Focus',
            description: 'Your accuracy is below 70%. Take time to understand each concept.',
            category: 'study_technique',
            priority: 'high',
            estimated_time: 0,
            expected_impact: 50,
            difficulty: 'easy',
            steps: ['Read questions carefully', 'Think before answering', 'Review explanations'],
            success_metrics: ['Improved accuracy in next 5 questions']
          })
        }
        break

      case 'taking_exam':
        contextualActions.push({
          id: 'exam_context_time_management',
          title: 'Monitor Your Pace',
          description: 'Keep track of time to ensure you complete all questions.',
          category: 'time_management',
          priority: 'medium',
          estimated_time: 0,
          expected_impact: 30,
          difficulty: 'easy',
          steps: ['Check time every 10 questions', 'Skip difficult questions initially', 'Return to skipped questions'],
          success_metrics: ['Complete exam within time limit']
        })
        break

      case 'reviewing_results':
        contextualActions.push({
          id: 'review_context_analyze_mistakes',
          title: 'Analyze Your Mistakes',
          description: 'Understanding why you got questions wrong is key to improvement.',
          category: 'study_technique',
          priority: 'high',
          estimated_time: 15,
          expected_impact: 70,
          difficulty: 'medium',
          steps: ['Review each incorrect answer', 'Identify knowledge gaps', 'Note common mistake patterns'],
          success_metrics: ['Identify 3 improvement areas']
        })
        break
    }

    return contextualActions
  }
}
