import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AchievementBadge, type Achievement } from './achievement-badge';

interface UserEngagementTrackerProps {
  level: number;
  experience: number;
  experienceForNextLevel: number;
  achievements: Achievement[];
  streakDays?: number;
  className?: string;
}

export function UserEngagementTracker({
  level,
  experience,
  experienceForNextLevel,
  achievements,
  streakDays = 0,
  className = ''
}: UserEngagementTrackerProps) {
  // Calculate progress percentage
  const progressPercentage = Math.min(100, (experience / experienceForNextLevel) * 100);
  
  // Filter unlocked achievements
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  
  // Get next achievement to unlock
  const nextAchievement = achievements.find(a => !a.unlocked);
  
  // Get progress text
  const getProgressText = () => {
    const remaining = experienceForNextLevel - experience;
    if (remaining <= 0) {
      return "Ready to level up!";
    }
    return `${remaining} XP to level ${level + 1}`;
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* User Level Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Content Creator Level</CardTitle>
            <CardDescription>Complete tasks and create content to level up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <motion.div 
                className="flex-shrink-0 w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                {level}
              </motion.div>
              
              <div className="flex-grow space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Level {level}</span>
                  <span className="text-neutral-500">{experience}/{experienceForNextLevel} XP</span>
                </div>
                
                <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-500">{getProgressText()}</span>
                  {progressPercentage >= 100 && (
                    <Button size="sm" className="h-6 text-xs">
                      Level Up
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Daily Streak */}
            {streakDays > 0 && (
              <div className="mt-5 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{streakDays} Day Streak!</p>
                    <p className="text-xs text-neutral-500">Keep creating content daily to maintain your streak</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Achievements Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Achievements</CardTitle>
            <CardDescription>
              {unlockedAchievements.length === 0 
                ? "Start using the platform to earn achievements" 
                : `Unlocked ${unlockedAchievements.length} of ${achievements.length} achievements`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Unlocked Achievements */}
              {unlockedAchievements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Unlocked</h4>
                  <div className="flex flex-wrap gap-3">
                    {unlockedAchievements.map(achievement => (
                      <AchievementBadge 
                        key={achievement.id} 
                        achievement={achievement} 
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Next Achievement */}
              {nextAchievement && (
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-3">Next Achievement</h4>
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-neutral-50">
                    <AchievementBadge 
                      achievement={nextAchievement}
                      showTooltip={false}
                    />
                    <div>
                      <p className="font-medium">{nextAchievement.name}</p>
                      <p className="text-sm text-neutral-500">{nextAchievement.description}</p>
                      {nextAchievement.progress && (
                        <div className="mt-2">
                          <div className="w-full bg-neutral-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary-500 h-1.5 rounded-full" 
                              style={{ width: `${(nextAchievement.progress.current / nextAchievement.progress.total) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-neutral-500 mt-1">
                            <span>Progress</span>
                            <span>{nextAchievement.progress.current} / {nextAchievement.progress.total}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* View All Button */}
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  View All Achievements
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats & Rewards Card */}
        <Card>
          <CardHeader>
            <CardTitle>Stats & Rewards</CardTitle>
            <CardDescription>Your content creation statistics and available rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-neutral-500">Content Created</p>
                <p className="text-xl font-semibold">24</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500">Total Engagement</p>
                <p className="text-xl font-semibold">687</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500">Platforms Connected</p>
                <p className="text-xl font-semibold">2/4</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500">Reward Points</p>
                <p className="text-xl font-semibold">120</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Available Rewards</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Extra AI Content Generation</p>
                      <p className="text-xs text-neutral-500">5 additional AI generations</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    100 pts
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Premium Template Pack</p>
                      <p className="text-xs text-neutral-500">10 premium content templates</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    150 pts
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}