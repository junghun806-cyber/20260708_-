import { sendGAEvent } from "@next/third-parties/google";
import { supabase } from "@/lib/supabaseClient";

export function logDirectionsClick(params: {
  installType: string;
  detailLocation: string;
  trashType: string;
  gu: string;
  hadGeolocation: boolean;
}) {
  // Fire-and-forget: never let logging failures affect the directions flow.
  // No `.select()` here — RLS only grants anon INSERT, not SELECT, and
  // requesting the row back would make Postgres enforce a read check too.
  //
  // The Supabase table still has a `park_name` column from when the app was
  // park-scoped; we now write the installation place type (e.g. "버스정류장")
  // into it rather than running a manual column-rename migration.
  supabase
    .from("directions_clicks")
    .insert({
      park_name: params.installType,
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
    install_type: params.installType,
    detail_location: params.detailLocation,
    trash_type: params.trashType,
    gu: params.gu,
    had_geolocation: params.hadGeolocation,
  });
}
