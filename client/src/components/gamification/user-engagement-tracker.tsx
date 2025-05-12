import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, AchievementBadge } from './achievement-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export interface UserEngagementProps {
  achievements: Achievement[];
  level: number;
  experience: number;
  experienceForNextLevel: number;
  streakDays: number;
}

export function UserEngagementTracker({
  achievements,
  level, 
  experience,
  experienceForNextLevel,
  streakDays
}: UserEngagementProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const experiencePercentage = (experience / experienceForNextLevel) * 100;
  
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const displayedAchievements = unlockedAchievements.slice(0, 3);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Content Creator Journey</h3>
        <Badge variant="outline" className="font-bold">Level {level}</Badge>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm">
          <span>Experience</span>
          <span className="font-medium">{experience} / {experienceForNextLevel} XP</span>
        </div>
        <Progress value={experiencePercentage} className="h-2" />
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium">Streak:</span>
        <div className="flex items-center">
          <span className="text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="font-bold ml-1">{streakDays} days</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Recent Achievements</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAllAchievements(true)}
            className="text-xs"
          >
            View All
          </Button>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          {displayedAchievements.length > 0 ? (
            displayedAchievements.map(achievement => (
              <AchievementBadge 
                key={achievement.id} 
                achievement={achievement}
                onClick={() => setSelectedAchievement(achievement)}
              />
            ))
          ) : (
            <div className="text-sm text-neutral-500 italic py-2">
              No achievements unlocked yet. Keep creating content!
            </div>
          )}
          
          {unlockedAchievements.length > 3 && (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAllAchievements(true)}
              className="w-12 h-12 flex items-center justify-center bg-neutral-100 rounded-full cursor-pointer"
            >
              <span className="text-neutral-600 font-medium">+{unlockedAchievements.length - 3}</span>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Achievement details dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Achievement Details</DialogTitle>
          </DialogHeader>
          
          {selectedAchievement && (
            <div className="flex flex-col items-center text-center p-4">
              <AchievementBadge 
                achievement={selectedAchievement} 
                size="lg" 
                showTooltip={false}
              />
              <h3 className="text-xl font-bold mt-4">{selectedAchievement.name}</h3>
              <p className="text-neutral-600 mt-2">{selectedAchievement.description}</p>
              
              {selectedAchievement.progress && (
                <div className="w-full mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{selectedAchievement.progress.current}/{selectedAchievement.progress.total}</span>
                  </div>
                  <Progress 
                    value={(selectedAchievement.progress.current / selectedAchievement.progress.total) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* All achievements dialog */}
      <Dialog open={showAllAchievements} onOpenChange={setShowAllAchievements}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Your Achievements</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <AnimatePresence>
              {achievements.map(achievement => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 rounded-lg border ${achievement.unlocked ? 'bg-white' : 'bg-neutral-50 border-dashed'}`}
                >
                  <div className="flex items-start space-x-4">
                    <AchievementBadge 
                      achievement={achievement} 
                      showTooltip={false}
                    />
                    <div>
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{achievement.description}</p>
                      
                      {achievement.progress && !achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress.current}/{achievement.progress.total}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress.current / achievement.progress.total) * 100} 
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}