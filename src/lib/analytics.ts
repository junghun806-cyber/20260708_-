import { sendGAEvent } from "@next/third-parties/google";
import { supabase } from "@/lib/supabaseClient";

export function logDirectionsClick(params: {
  parkName: string;
  detailLocation: string;
  trashType: string;
  gu: string;
  hadGeolocation: boolean;
}) {
  // Fire-and-forget: never let logging failures affect the directions flow.
  // No `.select()` here — RLS only grants anon INSERT, not SELECT, and
  // requesting the row back would make Postgres enforce a read check too.
  supabase
    .from("directions_clicks")
    .insert({
      park_name: params.parkName,
      detail_location: params.detailLocation,
      trash_type: params.trashType,
      gu: params.gu,
      had_geolocation: params.hadGeolocation,
    })
    .then(({ error }) => {
      if (error) console.error("directions click log failed:", error.message);
    });

  // Also send to GA4 as a custom event so it shows up in Reports > Engagement
  // > Events (and Realtime immediately), regardless of whether the user got
  // here via the 긴급 button or a normal search.
  sendGAEvent("event", "directions_click", {
    park_name: params.parkName,
    detail_location: params.detailLocation,
    trash_type: params.trashType,
    gu: params.gu,
    had_geolocation: params.hadGeolocation,
  });
}
