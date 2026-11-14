// Hand-written to match supabase/migrations. Keep the two in sync.
import type { Category, Fulfillment, Status, Urgency } from "@/lib/needs/constants";

export type ReportTarget = "need" | "profile" | "message";
export type ReportStatus = "open" | "resolved" | "dismissed";
export type NotificationType =
  | "offer_received"
  | "offer_cancelled"
  | "need_fulfilled"
  | "message_received"
  | "report_update"
  | "system";

export type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  area: string | null;
  bio: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  role: "user" | "admin";
  banned_at: string | null;
  email_notifications: boolean;
  terms_accepted_at: string | null;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  area: string | null;
  created_at: string;
  is_banned: boolean;
};

export type NeedRow = {
  id: string;
  poster_id: string;
  title: string;
  description: string;
  category: Category;
  urgency: Urgency;
  status: Status;
  fulfillment: Fulfillment;
  wishlist_url: string | null;
  photo_path: string | null;
  zip: string;
  lat: number;
  lng: number;
  helper_id: string | null;
  pledged_at: string | null;
  fulfilled_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ThreadRow = {
  id: string;
  need_id: string;
  poster_id: string;
  helper_id: string | null;
  created_at: string;
  last_message_at: string;
};

export type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
};

export type ThreadReadRow = { thread_id: string; user_id: string; last_read_at: string };

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

export type BlockRow = { blocker_id: string; blocked_id: string; created_at: string };

export type ReportRow = {
  id: string;
  reporter_id: string | null;
  target_type: ReportTarget;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
};

export type NearbyNeedRow = {
  id: string;
  title: string;
  description: string;
  category: Category;
  urgency: Urgency;
  status: Status;
  fulfillment: Fulfillment;
  photo_path: string | null;
  created_at: string;
  distance_miles: number | null;
  poster_id: string;
  poster_name: string;
  poster_avatar: string | null;
  poster_area: string | null;
  total_count: number;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      needs: Table<
        NeedRow,
        Pick<NeedRow, "poster_id" | "title" | "description" | "category" | "zip" | "lat" | "lng"> &
          Partial<Pick<NeedRow, "urgency" | "fulfillment" | "wishlist_url" | "photo_path">>,
        Partial<Pick<NeedRow, "title" | "description" | "category" | "urgency" | "fulfillment" | "wishlist_url" | "photo_path">>
      >;
      threads: Table<ThreadRow>;
      messages: Table<MessageRow>;
      thread_reads: Table<ThreadReadRow>;
      notifications: Table<NotificationRow, never, Pick<NotificationRow, "read_at">>;
      blocks: Table<BlockRow, Pick<BlockRow, "blocker_id" | "blocked_id">, never>;
      reports: Table<
        ReportRow,
        Pick<ReportRow, "reporter_id" | "target_type" | "target_id" | "reason"> & Partial<Pick<ReportRow, "details">>,
        Partial<Pick<ReportRow, "status" | "resolved_by" | "resolved_at" | "resolution_note">>
      >;
    };
    Views: {
      public_profiles: { Row: PublicProfileRow; Relationships: [] };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      miles_between: { Args: { lat1: number; lng1: number; lat2: number; lng2: number }; Returns: number };
      offer_help: { Args: { p_need_id: string }; Returns: ThreadRow };
      cancel_offer: { Args: { p_need_id: string }; Returns: undefined };
      mark_fulfilled: { Args: { p_need_id: string }; Returns: undefined };
      close_need: { Args: { p_need_id: string }; Returns: undefined };
      reopen_need: { Args: { p_need_id: string }; Returns: undefined };
      send_message: { Args: { p_thread_id: string; p_body: string }; Returns: MessageRow };
      mark_thread_read: { Args: { p_thread_id: string }; Returns: undefined };
      block_user: { Args: { p_user_id: string }; Returns: undefined };
      nearby_needs: {
        Args: {
          p_lat?: number | null;
          p_lng?: number | null;
          p_radius_miles?: number | null;
          p_category?: Category | null;
          p_urgency?: Urgency | null;
          p_query?: string | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: NearbyNeedRow[];
      };
      admin_ban_user: { Args: { p_user_id: string; p_ban: boolean }; Returns: undefined };
      admin_remove_need: { Args: { p_need_id: string; p_note?: string | null }; Returns: undefined };
      admin_delete_message: { Args: { p_message_id: string }; Returns: undefined };
      site_stats: { Args: Record<string, never>; Returns: { open_needs: number; fulfilled_needs: number; neighbors: number }[] };
    };
    Enums: {
      need_category: Category;
      need_urgency: Urgency;
      need_status: Status;
      fulfillment_method: Fulfillment;
      report_target: ReportTarget;
      report_status: ReportStatus;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<string, never>;
  };
};
