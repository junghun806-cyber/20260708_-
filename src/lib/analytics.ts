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
}
