-- Create table for user activity tracking
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fid BIGINT NOT NULL,
  username TEXT,
  display_name TEXT,
  pfp_url TEXT,
  wallet_address TEXT,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups by fid
CREATE INDEX idx_user_activities_fid ON public.user_activities(fid);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- Create table for notification tokens
CREATE TABLE public.notification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fid BIGINT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_tokens_fid ON public.notification_tokens(fid);

-- Enable Row Level Security
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_tokens ENABLE ROW LEVEL SECURITY;

-- Public read access for activities (leaderboard)
CREATE POLICY "Anyone can view activities" 
ON public.user_activities 
FOR SELECT 
USING (true);

-- Allow inserts from edge functions (service role)
CREATE POLICY "Service role can insert activities" 
ON public.user_activities 
FOR INSERT 
WITH CHECK (true);

-- Notification tokens policies
CREATE POLICY "Anyone can view notification tokens" 
ON public.notification_tokens 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert notification tokens" 
ON public.notification_tokens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update notification tokens" 
ON public.notification_tokens 
FOR UPDATE 
USING (true);

-- Enable realtime for activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;