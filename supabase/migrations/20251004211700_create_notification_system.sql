-- Create Comprehensive Notification System
-- Supports push notifications, user preferences, history tracking, and admin broadcasts

-- ============================================================================
-- TABLE 1: User Notification Preferences & Subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Notification channel preferences
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  
  -- Notification type preferences
  order_updates_enabled BOOLEAN DEFAULT true,
  promotional_enabled BOOLEAN DEFAULT true,
  event_announcements_enabled BOOLEAN DEFAULT true,
  
  -- Web Push subscription data (for PWA)
  push_subscription JSONB NULL,
  
  -- Mobile push tokens (for native apps)
  expo_push_token TEXT NULL,
  fcm_token TEXT NULL, -- Firebase Cloud Messaging (Android)
  apns_token TEXT NULL, -- Apple Push Notification Service (iOS)
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one notification settings record per user
  UNIQUE(user_id)
);

-- Add index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Add index for finding users with push enabled
CREATE INDEX IF NOT EXISTS idx_notifications_push_enabled ON public.notifications(push_enabled) WHERE push_enabled = true;

-- ============================================================================
-- TABLE 2: Notification History & Tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Notification classification
  notification_type TEXT NOT NULL, -- 'order_status', 'promotional', 'event', 'system'
  category TEXT NULL, -- Additional categorization (e.g., 'order_preparing', 'order_ready')
  
  -- Notification content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT NULL,
  icon_url TEXT NULL,
  
  -- Related data (order_id, event_id, etc.)
  data JSONB NULL,
  
  -- Delivery information
  delivery_method TEXT[] DEFAULT '{}', -- ['push', 'email', 'sms']
  delivery_status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'read'
  error_message TEXT NULL,
  
  -- Interaction tracking
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ NULL,
  read_at TIMESTAMPTZ NULL,
  clicked_at TIMESTAMPTZ NULL,
  
  -- Action URL (where notification should navigate)
  action_url TEXT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON public.notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_type ON public.notification_history(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON public.notification_history(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_history_read_at ON public.notification_history(read_at) WHERE read_at IS NULL;

-- ============================================================================
-- TABLE 3: Admin Broadcast Messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.broadcast_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Creator information
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Broadcast content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT NULL,
  
  -- Targeting
  target_audience TEXT DEFAULT 'all', -- 'all', 'customers', 'staff', 'admins'
  target_user_ids UUID[] NULL, -- Optional: specific user IDs
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NULL, -- NULL = send immediately
  sent_at TIMESTAMPTZ NULL,
  
  -- Delivery tracking
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  error_message TEXT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for admin dashboard
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_created_by ON public.broadcast_messages(created_by);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_status ON public.broadcast_messages(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_scheduled_for ON public.broadcast_messages(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_created_at ON public.broadcast_messages(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- NOTIFICATIONS TABLE POLICIES
-- Users can view and update their own notification preferences
CREATE POLICY "Users can view own notification settings"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Staff and admins can view all notification settings (for admin purposes)
CREATE POLICY "Staff can view all notification settings"
  ON public.notifications
  FOR SELECT
  USING (public.is_staff_or_admin());

-- NOTIFICATION_HISTORY TABLE POLICIES
-- Users can view their own notification history
CREATE POLICY "Users can view own notification history"
  ON public.notification_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update read/clicked status on their own notifications
CREATE POLICY "Users can update own notification status"
  ON public.notification_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications"
  ON public.notification_history
  FOR INSERT
  WITH CHECK (true);

-- Staff and admins can view all notification history
CREATE POLICY "Staff can view all notification history"
  ON public.notification_history
  FOR SELECT
  USING (public.is_staff_or_admin());

-- BROADCAST_MESSAGES TABLE POLICIES
-- Only admins can manage broadcast messages
CREATE POLICY "Admins can manage broadcast messages"
  ON public.broadcast_messages
  FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger: Create notification preferences when profile is created
DROP TRIGGER IF EXISTS on_profile_created_notification_prefs ON public.profiles;
CREATE TRIGGER on_profile_created_notification_prefs
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_preferences();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger: Update timestamp on notifications table
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_updated_at();

-- Trigger: Update timestamp on broadcast_messages table
DROP TRIGGER IF EXISTS update_broadcast_messages_updated_at ON public.broadcast_messages;
CREATE TRIGGER update_broadcast_messages_updated_at
  BEFORE UPDATE ON public.broadcast_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.notifications IS 'Stores user notification preferences and push subscription data';
COMMENT ON TABLE public.notification_history IS 'Tracks all notifications sent to users with delivery and interaction data';
COMMENT ON TABLE public.broadcast_messages IS 'Admin-created broadcast messages for promotional announcements';

COMMENT ON COLUMN public.notifications.push_subscription IS 'Web Push API subscription object (JSONB)';
COMMENT ON COLUMN public.notifications.expo_push_token IS 'Expo push token for React Native mobile apps';
COMMENT ON COLUMN public.notification_history.data IS 'Additional structured data (order_id, event_id, etc.)';
COMMENT ON COLUMN public.broadcast_messages.target_audience IS 'all, customers, staff, or admins';

-- ============================================================================
-- INITIAL DATA (Optional - create default broadcast for testing)
-- ============================================================================

-- Insert a welcome system notification for all existing users (optional)
-- This can be commented out if not needed
/*
INSERT INTO public.notification_history (user_id, notification_type, category, title, body, delivery_status)
SELECT 
  id,
  'system',
  'welcome',
  'Welcome to Little Latte Lane!',
  'Notifications are now enabled. You''ll receive updates about your orders.',
  'delivered'
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.notification_history 
  WHERE user_id = profiles.id AND category = 'welcome'
);
*/

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Notification system tables created successfully!';
  RAISE NOTICE '📋 Tables: notifications, notification_history, broadcast_messages';
  RAISE NOTICE '🔒 RLS policies enabled for all tables';
  RAISE NOTICE '⚡ Triggers created for auto-initialization';
  RAISE NOTICE '📊 Indexes created for optimal performance';
END $$;
