-- Automatic Beta Approval Email Trigger
-- This trigger automatically calls the beta-approval edge function
-- when an application's status is changed to 'approved'
--
-- Prerequisites:
-- 1. Enable the http extension in Supabase dashboard (Database → Extensions)
-- 2. Deploy the beta-approval edge function
-- 3. Set RESEND_API_KEY secret in Supabase

-- Enable http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create function to call edge function on approval
CREATE OR REPLACE FUNCTION public.notify_beta_approval()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  response extensions.http_response;
BEGIN
  -- Only trigger when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Get Supabase URL from environment (set in vault)
    -- You need to add these to your vault secrets
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- If not using vault, you can hardcode for now (not recommended for production)
    -- supabase_url := 'https://YOUR_PROJECT_REF.supabase.co';
    
    IF supabase_url IS NOT NULL THEN
      -- Call the edge function asynchronously
      SELECT * INTO response
      FROM extensions.http((
        'POST',
        supabase_url || '/functions/v1/beta-approval',
        ARRAY[
          extensions.http_header('Content-Type', 'application/json'),
          extensions.http_header('Authorization', 'Bearer ' || service_role_key)
        ],
        'application/json',
        json_build_object('userId', NEW.user_id::text)::text
      )::extensions.http_request);
      
      -- Log the response (optional, for debugging)
      RAISE NOTICE 'Beta approval notification sent for user %: status %', 
        NEW.user_id, response.status;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the update if notification fails
    RAISE WARNING 'Failed to send beta approval notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_beta_approval ON public.beta_applications;

-- Create trigger on status update
CREATE TRIGGER on_beta_approval
  AFTER UPDATE OF status ON public.beta_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_beta_approval();

-- Also trigger on insert if status is already 'approved' (instant approval via referral code)
CREATE OR REPLACE FUNCTION public.notify_beta_approval_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  response extensions.http_response;
BEGIN
  -- Only trigger if new application is already approved (instant approval)
  IF NEW.status = 'approved' THEN
    
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    IF supabase_url IS NOT NULL THEN
      SELECT * INTO response
      FROM extensions.http((
        'POST',
        supabase_url || '/functions/v1/beta-approval',
        ARRAY[
          extensions.http_header('Content-Type', 'application/json'),
          extensions.http_header('Authorization', 'Bearer ' || service_role_key)
        ],
        'application/json',
        json_build_object('userId', NEW.user_id::text)::text
      )::extensions.http_request);
      
      RAISE NOTICE 'Beta instant approval notification sent for user %: status %', 
        NEW.user_id, response.status;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send beta instant approval notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_beta_instant_approval ON public.beta_applications;

CREATE TRIGGER on_beta_instant_approval
  AFTER INSERT ON public.beta_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_beta_approval_on_insert();

-- Add comment for documentation
COMMENT ON FUNCTION public.notify_beta_approval() IS 
  'Automatically sends approval email when beta application status changes to approved';
COMMENT ON FUNCTION public.notify_beta_approval_on_insert() IS 
  'Sends approval email for instant approvals (referral code users)';
