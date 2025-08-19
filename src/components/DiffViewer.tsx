import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Eye, Split, FileText, Plus, Minus } from 'lucide-react';
import { SideBySideDiff } from '@/lib/api';

interface DiffViewerProps {
  unifiedDiff: string;
  sideBySideDiff?: SideBySideDiff;
  htmlDiff?: string;
  className?: string;
  onSideBySideTabSelect?: () => void;
  onHtmlTabSelect?: () => void;
}

export function DiffViewer({ 
  unifiedDiff, 
  sideBySideDiff, 
  htmlDiff, 
  className = "",
  onSideBySideTabSelect,
  onHtmlTabSelect
}: DiffViewerProps) {
  const [activeTab, setActiveTab] = useState('unified');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === 'side-by-side' && onSideBySideTabSelect) {
      onSideBySideTabSelect();
    } else if (value === 'html' && onHtmlTabSelect) {
      onHtmlTabSelect();
    }
  };

  const renderUnifiedDiff = () => {
    const lines = unifiedDiff.split('\n');
    
    return (
      <div className="font-mono text-sm bg-background border rounded-lg overflow-hidden">
        {lines.map((line, index) => {
          let className = 'px-4 py-1';
          let icon = null;
          
          if (line.startsWith('+')) {
            className += ' bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200';
            icon = <Plus className="h-3 w-3 text-green-600" />;
          } else if (line.startsWith('-')) {
            className += ' bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200';
            icon = <Minus className="h-3 w-3 text-red-600" />;
          } else if (line.startsWith('@')) {
            className += ' bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200 font-semibold';
          } else if (line.startsWith('---') || line.startsWith('+++')) {
            className += ' bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400';
          } else {
            className += ' text-foreground';
          }
          
          return (
            <div key={index} className={`flex items-start ${className}`}>
              {icon && <span className="mr-2 mt-0.5 flex-shrink-0">{icon}</span>}
              <span className="whitespace-pre-wrap break-all">{line}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSideBySideDiff = () => {
    if (!sideBySideDiff) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Split className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Side-by-side diff not available</p>
        </div>
      );
    }

    const getLineClassName = (type: string) => {
      switch (type) {
        case 'added':
          return 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200';
        case 'deleted':
          return 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200';
        default:
          return 'text-foreground';
      }
    };

    const getLineIcon = (type: string) => {
      switch (type) {
        case 'added':
          return <Plus className="h-3 w-3 text-green-600" />;
        case 'deleted':
          return <Minus className="h-3 w-3 text-red-600" />;
        default:
          return null;
      }
    };

    return (
      <div className="grid grid-cols-2 gap-4 font-mono text-sm">
        <div className="bg-background border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 font-semibold text-sm">Original</div>
          {sideBySideDiff.old_lines.map((line, index) => (
            <div 
              key={index} 
              className={`px-4 py-1 border-b last:border-b-0 flex items-start ${getLineClassName(line.type)}`}
            >
              {getLineIcon(line.type) && (
                <span className="mr-2 mt-0.5 flex-shrink-0">{getLineIcon(line.type)}</span>
              )}
              <span className="text-xs text-muted-foreground mr-2 min-w-[2rem]">{line.line}</span>
              <span className="whitespace-pre-wrap break-all">{line.content}</span>
            </div>
          ))}
        </div>
        <div className="bg-background border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 font-semibold text-sm">Modified</div>
          {sideBySideDiff.new_lines.map((line, index) => (
            <div 
              key={index} 
              className={`px-4 py-1 border-b last:border-b-0 flex items-start ${getLineClassName(line.type)}`}
            >
              {getLineIcon(line.type) && (
                <span className="mr-2 mt-0.5 flex-shrink-0">{getLineIcon(line.type)}</span>
              )}
              <span className="text-xs text-muted-foreground mr-2 min-w-[2rem]">{line.line}</span>
              <span className="whitespace-pre-wrap break-all">{line.content}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHtmlDiff = () => {
    if (!htmlDiff) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>HTML diff not available</p>
        </div>
      );
    }

    return (
      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 font-semibold text-sm">HTML Diff View</div>
        <div 
          className="p-4 overflow-auto max-h-96"
          dangerouslySetInnerHTML={{ __html: htmlDiff }}
        />
      </div>
    );
  };

  const getDiffStats = () => {
    const lines = unifiedDiff.split('\n');
    let additions = 0;
    let deletions = 0;
    
    lines.forEach(line => {
      if (line.startsWith('+') && !line.startsWith('+++')) additions++;
      if (line.startsWith('-') && !line.startsWith('---')) deletions++;
    });
    
    return { additions, deletions };
  };

  const stats = getDiffStats();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Changes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              +{stats.additions}
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-200">
              -{stats.deletions}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unified" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Unified
            </TabsTrigger>
            <TabsTrigger value="side-by-side" className="flex items-center gap-2">
              <Split className="h-4 w-4" />
              Side by Side
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              HTML
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unified" className="mt-4">
            {renderUnifiedDiff()}
          </TabsContent>
          
          <TabsContent value="side-by-side" className="mt-4">
            {renderSideBySideDiff()}
          </TabsContent>
          
          <TabsContent value="html" className="mt-4">
            {renderHtmlDiff()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
