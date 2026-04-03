import React from 'react';
import { Edit, Save, X } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../ui/collapsible';

interface ConfigCardProps {
  title: string;
  icon: JSX.Element;
  children: React.ReactNode;
  isEditing: boolean;
  loading: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ConfigCard({
  title,
  icon,
  children,
  isEditing,
  loading,
  onEdit,
  onSave,
  onCancel
}: ConfigCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm relative">
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center gap-2 text-lg">
              {icon} {title}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="grid md:grid-cols-2 gap-6 relative pb-16">
            {children}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={onSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}