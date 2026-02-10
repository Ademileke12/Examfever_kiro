import { KnowledgeGap, TopicMastery } from '@/types/analytics'
import { TopicPerformance } from '@/types/performance'

export interface GapAnalysis {
  critical_gaps: KnowledgeGap[]
  moderate_gaps: KnowledgeGap[]
  minor_gaps: KnowledgeGap[]
  mastery_areas: TopicMastery[]
  improvement_priority: string[]
}

export interface LearningPath {
  topic: string
  current_level: number
  target_level: number
  estimated_time: number
  prerequisites: string[]
  recommended_actions: string[]
  difficulty_progression: string[]
}

export class KnowledgeGapDetector {
  
  analyzeKnowledgeGaps(topicPerformances: TopicPerformance[]): GapAnalysis {
    const gaps = this.identifyGaps(topicPerformances)
    const masteryAreas = this.identifyMasteryAreas(topicPerformances)
    const priority = this.calculateImprovementPriority(gaps)

    return {
      critical_gaps: gaps.filter(gap => gap.improvement_needed >= 0.7),
      moderate_gaps: gaps.filter(gap => gap.improvement_needed >= 0.4 && gap.improvement_needed < 0.7),
      minor_gaps: gaps.filter(gap => gap.improvement_needed < 0.4),
      mastery_areas: masteryAreas,
      improvement_priority: priority
    }
  }

  generateLearningPaths(gapAnalysis: GapAnalysis): LearningPath[] {
    return gapAnalysis.critical_gaps
      .concat(gapAnalysis.moderate_gaps)
      .map(gap => this.createLearningPath(gap))
      .sort((a, b) => b.target_level - b.current_level) // Prioritize bigger gaps
  }

  private identifyGaps(topicPerformances: TopicPerformance[]): KnowledgeGap[] {
    return topicPerformances
      .filter(performance => performance.metrics.accuracy < 80) // Below 80% is considered a gap
      .map(performance => {
        const accuracyRate = performance.metrics.accuracy / 100
        const improvementNeeded = this.calculateImprovementNeeded(performance)
        const recommendedActions = this.generateRecommendedActions(performance)

        return {
          topic: performance.topic,
          difficulty_level: this.determineDifficultyLevel(performance),
          accuracy_rate: Math.round(accuracyRate * 100) / 100,
          question_count: performance.question_count,
          improvement_needed: Math.round(improvementNeeded * 100) / 100,
          recommended_actions: recommendedActions
        }
      })
  }

  private identifyMasteryAreas(topicPerformances: TopicPerformance[]): TopicMastery[] {
    return topicPerformances
      .filter(performance => performance.mastery_level >= 80) // 80%+ mastery
      .map(performance => ({
        topic: performance.topic,
        mastery_level: performance.mastery_level,
        questions_attempted: performance.question_count,
        questions_correct: Math.round((performance.metrics.accuracy / 100) * performance.question_count),
        average_time: performance.metrics.average_time,
        last_practiced: performance.last_practiced,
        improvement_rate: performance.metrics.improvement
      }))
      .sort((a, b) => b.mastery_level - a.mastery_level)
  }

  private calculateImprovementNeeded(performance: TopicPerformance): number {
    const accuracyGap = (85 - performance.metrics.accuracy) / 85 // Target 85% accuracy
    const consistencyGap = (80 - performance.metrics.consistency) / 80 // Target 80% consistency
    const speedGap = performance.metrics.average_time > 120 ? 0.3 : 0 // Penalty for slow responses

    return Math.max(0, Math.min(1, accuracyGap + consistencyGap + speedGap))
  }

  private determineDifficultyLevel(performance: TopicPerformance): 'easy' | 'medium' | 'hard' {
    if (performance.metrics.accuracy < 50) return 'hard'
    if (performance.metrics.accuracy < 70) return 'medium'
    return 'easy'
  }

  private generateRecommendedActions(performance: TopicPerformance): string[] {
    const actions: string[] = []

    // Accuracy-based recommendations
    if (performance.metrics.accuracy < 50) {
      actions.push('Review fundamental concepts')
      actions.push('Start with easier questions')
      actions.push('Seek additional learning resources')
    } else if (performance.metrics.accuracy < 70) {
      actions.push('Practice more questions in this topic')
      actions.push('Focus on understanding common mistakes')
      actions.push('Review incorrect answers')
    } else {
      actions.push('Practice advanced questions')
      actions.push('Focus on speed improvement')
    }

    // Speed-based recommendations
    if (performance.metrics.average_time > 180) {
      actions.push('Practice time management techniques')
      actions.push('Use elimination strategies')
      actions.push('Build topic familiarity through repetition')
    }

    // Consistency-based recommendations
    if (performance.metrics.consistency < 60) {
      actions.push('Establish regular practice schedule')
      actions.push('Focus on consistent study environment')
      actions.push('Track daily progress')
    }

    // Question count recommendations
    if (performance.question_count < 10) {
      actions.push('Increase practice volume')
      actions.push('Attempt more questions in this topic')
    }

    return actions.slice(0, 4) // Limit to 4 most relevant actions
  }

  private calculateImprovementPriority(gaps: KnowledgeGap[]): string[] {
    return gaps
      .map(gap => ({
        topic: gap.topic,
        priority_score: this.calculatePriorityScore(gap)
      }))
      .sort((a, b) => b.priority_score - a.priority_score)
      .map(item => item.topic)
  }

  private calculatePriorityScore(gap: KnowledgeGap): number {
    // Priority based on improvement needed, question count, and difficulty
    let score = gap.improvement_needed * 100

    // Boost priority for topics with more questions (more data reliability)
    score += Math.min(20, gap.question_count * 2)

    // Boost priority for critical accuracy levels
    if (gap.accuracy_rate < 0.3) score += 30
    else if (gap.accuracy_rate < 0.5) score += 20
    else if (gap.accuracy_rate < 0.7) score += 10

    // Difficulty level adjustments
    if (gap.difficulty_level === 'hard') score += 15
    else if (gap.difficulty_level === 'medium') score += 10

    return score
  }

  private createLearningPath(gap: KnowledgeGap): LearningPath {
    const currentLevel = gap.accuracy_rate * 100
    const targetLevel = 85 // Target 85% accuracy
    const estimatedTime = this.estimateImprovementTime(gap)
    const prerequisites = this.identifyPrerequisites(gap.topic)
    const difficultyProgression = this.createDifficultyProgression(gap)

    return {
      topic: gap.topic,
      current_level: Math.round(currentLevel),
      target_level: targetLevel,
      estimated_time: estimatedTime,
      prerequisites: prerequisites,
      recommended_actions: gap.recommended_actions,
      difficulty_progression: difficultyProgression
    }
  }

  private estimateImprovementTime(gap: KnowledgeGap): number {
    // Estimate hours needed based on improvement required and current performance
    const baseTime = 10 // Base 10 hours for any topic
    const improvementMultiplier = gap.improvement_needed * 20 // Up to 20 additional hours
    const difficultyMultiplier = gap.difficulty_level === 'hard' ? 1.5 : 
                                gap.difficulty_level === 'medium' ? 1.2 : 1.0

    return Math.round(baseTime + (improvementMultiplier * difficultyMultiplier))
  }

  private identifyPrerequisites(topic: string): string[] {
    // Simplified prerequisite mapping - in a real system, this would be more sophisticated
    const prerequisiteMap: Record<string, string[]> = {
      'advanced_calculus': ['basic_calculus', 'algebra'],
      'organic_chemistry': ['general_chemistry', 'basic_chemistry'],
      'data_structures': ['programming_basics', 'algorithms'],
      'machine_learning': ['statistics', 'linear_algebra', 'programming'],
      'physics_mechanics': ['mathematics', 'basic_physics'],
      'advanced_grammar': ['basic_grammar', 'vocabulary'],
      'essay_writing': ['basic_writing', 'grammar', 'reading_comprehension']
    }

    return prerequisiteMap[topic.toLowerCase().replace(/\s+/g, '_')] || []
  }

  private createDifficultyProgression(gap: KnowledgeGap): string[] {
    const progressions: Record<string, string[]> = {
      'easy': [
        'Review basic concepts',
        'Practice simple questions',
        'Build confidence with repetition',
        'Gradually increase complexity'
      ],
      'medium': [
        'Strengthen foundational knowledge',
        'Practice mixed difficulty questions',
        'Focus on problem-solving strategies',
        'Apply concepts to new scenarios',
        'Master advanced applications'
      ],
      'hard': [
        'Start with prerequisite topics',
        'Break down complex concepts',
        'Practice with guided examples',
        'Work through step-by-step solutions',
        'Gradually remove guidance',
        'Practice independently',
        'Master advanced variations'
      ]
    }

    return progressions[gap.difficulty_level] || progressions['medium'] || [
      'Review basic concepts',
      'Practice with examples',
      'Apply to new problems'
    ]
  }

  detectConceptualGaps(
    topicPerformances: TopicPerformance[],
    conceptRelationships: Record<string, string[]>
  ): string[] {
    const conceptualGaps: string[] = []

    topicPerformances.forEach(performance => {
      if (performance.metrics.accuracy < 70) {
        const relatedConcepts = conceptRelationships[performance.topic] || []
        
        relatedConcepts.forEach(concept => {
          const relatedPerformance = topicPerformances.find(p => p.topic === concept)
          
          if (!relatedPerformance || relatedPerformance.metrics.accuracy < 60) {
            conceptualGaps.push(`${performance.topic} → ${concept}`)
          }
        })
      }
    })

    return Array.from(new Set(conceptualGaps)) // Remove duplicates
  }

  generateStudyPlan(
    gapAnalysis: GapAnalysis,
    availableHoursPerWeek: number = 10
  ): { week: number; topics: string[]; hours: number; focus: string }[] {
    const learningPaths = this.generateLearningPaths(gapAnalysis)
    const studyPlan: { week: number; topics: string[]; hours: number; focus: string }[] = []

    let currentWeek = 1
    let remainingHours = availableHoursPerWeek
    let currentTopics: string[] = []

    learningPaths.forEach(path => {
      const hoursNeeded = path.estimated_time

      if (hoursNeeded <= remainingHours) {
        // Fits in current week
        currentTopics.push(path.topic)
        remainingHours -= hoursNeeded
      } else {
        // Need to move to next week
        if (currentTopics.length > 0) {
          studyPlan.push({
            week: currentWeek,
            topics: [...currentTopics],
            hours: availableHoursPerWeek - remainingHours,
            focus: this.determineFocus(currentTopics, gapAnalysis)
          })
          currentWeek++
        }

        currentTopics = [path.topic]
        remainingHours = availableHoursPerWeek - hoursNeeded
      }
    })

    // Add final week if there are remaining topics
    if (currentTopics.length > 0) {
      studyPlan.push({
        week: currentWeek,
        topics: currentTopics,
        hours: availableHoursPerWeek - remainingHours,
        focus: this.determineFocus(currentTopics, gapAnalysis)
      })
    }

    return studyPlan
  }

  private determineFocus(topics: string[], gapAnalysis: GapAnalysis): string {
    const criticalTopics = topics.filter(topic => 
      gapAnalysis.critical_gaps.some(gap => gap.topic === topic)
    )

    if (criticalTopics.length > 0) return 'Critical improvement'
    
    const moderateTopics = topics.filter(topic =>
      gapAnalysis.moderate_gaps.some(gap => gap.topic === topic)
    )

    if (moderateTopics.length > 0) return 'Skill building'
    
    return 'Refinement and mastery'
  }
}
