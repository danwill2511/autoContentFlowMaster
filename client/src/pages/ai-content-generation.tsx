import React from 'react';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIWritingAssistant } from '@/components/content/AIWritingAssistant';
import { MoodBoardCreator } from '@/components/content/MoodBoardCreator';
import { ColorPaletteGenerator } from '@/components/content/ColorPaletteGenerator';

export default function AIContentGenerationPage() {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center">Create Amazing Content</h1>

        <Tabs defaultValue="write" className="w-full">
          <TabsList className="grid grid-cols-3 gap-4 mb-8">
            <TabsTrigger value="write" className="text-lg p-4">
              ✍️ Write Content
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-lg p-4">
              🎨 Visual Creator
            </TabsTrigger>
            <TabsTrigger value="style" className="text-lg p-4">
              🎯 Style Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write">
            <Card>
              <CardContent className="p-6">
                <AIWritingAssistant 
                  showToneSelector={true}
                  enableRealTimePreview={true}
                  platformTemplates={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual">
            <Card>
              <CardContent className="p-6">
                <MoodBoardCreator 
                  enableDragAndDrop={true}
                  showTemplateGallery={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="style">
            <Card>
              <CardContent className="p-6">
                <ColorPaletteGenerator 
                  enableExport={true}
                  showBrandPresets={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}