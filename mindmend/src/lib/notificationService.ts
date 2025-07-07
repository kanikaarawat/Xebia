import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Notification {
  id: string;
  user_id: string;
  type: 'appointment_reminder' | 'mood_reminder' | 'weekly_report' | 'system' | 'therapist_message';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
  scheduled_for?: string;
  sent_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  appointment_reminders: boolean;
  mood_reminders: boolean;
  weekly_reports: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
}

export class NotificationService {
  // Create a new notification
  static async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: Record<string, unknown>,
    scheduledFor?: Date
  ): Promise<Notification | null> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data,
          read: false,
          scheduled_for: scheduledFor?.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Get user's notifications
  static async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data: notifications, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get user's notification preferences
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        return null;
      }

      return preferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  // Update user's notification preferences
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
        });

      if (error) {
        console.error('Error updating notification preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  // Send appointment reminder
  static async sendAppointmentReminder(
    userId: string,
    appointmentId: string,
    appointmentData: {
      scheduled_at: string;
      therapist_name: string;
      type: string;
      duration: number;
    }
  ): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      
      if (!preferences?.appointment_reminders) {
        return false; // User has disabled appointment reminders
      }

      const scheduledDate = new Date(appointmentData.scheduled_at);
      const reminderTime = new Date(scheduledDate.getTime() - 60 * 60 * 1000); // 1 hour before

      const notification = await this.createNotification(
        userId,
        'appointment_reminder',
        'Appointment Reminder',
        `Your ${appointmentData.type} session with ${appointmentData.therapist_name} starts in 1 hour.`,
        {
          appointment_id: appointmentId,
          scheduled_at: appointmentData.scheduled_at,
          therapist_name: appointmentData.therapist_name,
          type: appointmentData.type,
          duration: appointmentData.duration,
        },
        reminderTime
      );

      if (preferences.email_notifications) {
        await this.sendEmailNotification(userId, 'appointment_reminder', {
          appointment_id: appointmentId,
          scheduled_at: appointmentData.scheduled_at,
          therapist_name: appointmentData.therapist_name,
          type: appointmentData.type,
          duration: appointmentData.duration,
        });
      }

      return !!notification;
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      return false;
    }
  }

  // Send mood reminder
  static async sendMoodReminder(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      
      if (!preferences?.mood_reminders) {
        return false; // User has disabled mood reminders
      }

      const notification = await this.createNotification(
        userId,
        'mood_reminder',
        'Daily Mood Check-in',
        'How are you feeling today? Take a moment to log your mood and track your wellness journey.',
        { reminder_type: 'daily_mood' }
      );

      if (preferences.email_notifications) {
        await this.sendEmailNotification(userId, 'mood_reminder', {
          reminder_type: 'daily_mood',
        });
      }

      return !!notification;
    } catch (error) {
      console.error('Error sending mood reminder:', error);
      return false;
    }
  }

  // Send weekly report
  static async sendWeeklyReport(
    userId: string,
    reportData: {
      mood_average: number;
      sessions_completed: number;
      sessions_upcoming: number;
      insights: string[];
    }
  ): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      
      if (!preferences?.weekly_reports) {
        return false; // User has disabled weekly reports
      }

      const notification = await this.createNotification(
        userId,
        'weekly_report',
        'Your Weekly Wellness Report',
        `This week: ${reportData.sessions_completed} sessions completed, average mood: ${reportData.mood_average}/5. Check out your insights!`,
        reportData
      );

      if (preferences.email_notifications) {
        await this.sendEmailNotification(userId, 'weekly_report', reportData);
      }

      return !!notification;
    } catch (error) {
      console.error('Error sending weekly report:', error);
      return false;
    }
  }

  // Send therapist message notification
  static async sendTherapistMessage(
    userId: string,
    messageData: {
      therapist_name: string;
      message_preview: string;
      message_id: string;
    }
  ): Promise<boolean> {
    try {
      const notification = await this.createNotification(
        userId,
        'therapist_message',
        `Message from ${messageData.therapist_name}`,
        messageData.message_preview,
        messageData
      );

      const preferences = await this.getNotificationPreferences(userId);
      if (preferences?.email_notifications) {
        await this.sendEmailNotification(userId, 'therapist_message', messageData);
      }

      return !!notification;
    } catch (error) {
      console.error('Error sending therapist message notification:', error);
      return false;
    }
  }

  // Send email notification (placeholder - integrate with your email service)
  private static async sendEmailNotification(
    userId: string,
    type: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    try {
      // Get user email
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !user.user?.email) {
        console.error('Error getting user email:', userError);
        return false;
      }

      // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
      // For now, we'll just log the email that would be sent
      console.log('Email notification would be sent:', {
        to: user.user.email,
        type,
        data,
      });

      // Example integration with a hypothetical email service:
      // await emailService.send({
      //   to: user.user.email,
      //   subject: this.getEmailSubject(type, data),
      //   template: type,
      //   data: data,
      // });

      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  // Get email subject based on notification type
  private static getEmailSubject(type: string, data: Record<string, unknown>): string {
    switch (type) {
      case 'appointment_reminder':
        return `Appointment Reminder - ${data.therapist_name}`;
      case 'mood_reminder':
        return 'Daily Mood Check-in Reminder';
      case 'weekly_report':
        return 'Your Weekly Wellness Report';
      case 'therapist_message':
        return `New Message from ${data.therapist_name}`;
      default:
        return 'MindMend Notification';
    }
  }

  // Schedule recurring notifications (for cron jobs)
  static async scheduleRecurringNotifications(): Promise<void> {
    try {
      // Get all users with mood reminders enabled
      const { data: users, error } = await supabase
        .from('notification_preferences')
        .select('user_id')
        .eq('mood_reminders', true);

      if (error) {
        console.error('Error fetching users for mood reminders:', error);
        return;
      }

      // Send mood reminders to all eligible users
      for (const user of users || []) {
        await this.sendMoodReminder(user.user_id);
      }

      console.log(`Sent mood reminders to ${users?.length || 0} users`);
    } catch (error) {
      console.error('Error scheduling recurring notifications:', error);
    }
  }
} 