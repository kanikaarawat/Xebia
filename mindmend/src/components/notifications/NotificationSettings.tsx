'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, MessageSquare, Calendar, TrendingUp, Shield } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { NotificationPreferences } from '@/lib/notificationService';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { preferences, updatePreferences, loading } = useNotifications(userId);
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!localPreferences) return;

    const newPreferences = { ...localPreferences, [key]: value };
    setLocalPreferences(newPreferences);

    try {
      await updatePreferences({ [key]: value });
      toast.success('Notification preferences updated');
    } catch (error) {
      // Revert on error
      setLocalPreferences(preferences);
      toast.error('Failed to update notification preferences');
    }
  };

  const notificationTypes = [
    {
      key: 'email_notifications' as keyof NotificationPreferences,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      category: 'General'
    },
    {
      key: 'in_app_notifications' as keyof NotificationPreferences,
      title: 'In-App Notifications',
      description: 'Show notifications within the app',
      icon: Bell,
      category: 'General'
    },
    {
      key: 'push_notifications' as keyof NotificationPreferences,
      title: 'Push Notifications',
      description: 'Receive push notifications on your device',
      icon: Smartphone,
      category: 'General'
    },
    {
      key: 'appointment_reminders' as keyof NotificationPreferences,
      title: 'Appointment Reminders',
      description: 'Get reminded about upcoming therapy sessions',
      icon: Calendar,
      category: 'Appointments'
    },
    {
      key: 'mood_reminders' as keyof NotificationPreferences,
      title: 'Mood Check-ins',
      description: 'Daily reminders to log your mood',
      icon: TrendingUp,
      category: 'Wellness'
    },
    {
      key: 'weekly_reports' as keyof NotificationPreferences,
      title: 'Weekly Reports',
      description: 'Receive weekly wellness summaries',
      icon: TrendingUp,
      category: 'Wellness'
    },
    {
      key: 'marketing_emails' as keyof NotificationPreferences,
      title: 'Marketing Emails',
      description: 'Receive updates about new features and services',
      icon: MessageSquare,
      category: 'Marketing'
    }
  ];

  const groupedNotifications = notificationTypes.reduce((acc, notification) => {
    if (!acc[notification.category]) {
      acc[notification.category] = [];
    }
    acc[notification.category].push(notification);
    return acc;
  }, {} as Record<string, typeof notificationTypes>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading notification preferences...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!localPreferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No notification preferences found</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to receive notifications from MindMend
        </p>
      </div>

      {Object.entries(groupedNotifications).map(([category, notifications]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {category === 'General' && <Bell className="h-4 w-4" />}
              {category === 'Appointments' && <Calendar className="h-4 w-4" />}
              {category === 'Wellness' && <TrendingUp className="h-4 w-4" />}
              {category === 'Marketing' && <MessageSquare className="h-4 w-4" />}
              {category}
            </CardTitle>
            <CardDescription>
              {category === 'General' && 'Basic notification settings'}
              {category === 'Appointments' && 'Therapy session related notifications'}
              {category === 'Wellness' && 'Mood tracking and wellness reminders'}
              {category === 'Marketing' && 'Promotional and informational content'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              const isEnabled = localPreferences[notification.key];

              return (
                <div key={notification.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <Label htmlFor={notification.key} className="text-sm font-medium">
                        {notification.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={notification.key}
                    checked={!!isEnabled}
                    onCheckedChange={(checked) => handleToggle(notification.key, checked)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Privacy & Control</h4>
              <p className="text-sm text-blue-700">
                You can change these settings at any time. We respect your privacy and will only send 
                notifications based on your preferences. You can also unsubscribe from emails directly 
                from the email footer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 