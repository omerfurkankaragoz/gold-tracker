import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  const res = await fetch("https://finance.truncgil.com/api/today.json");
  if (!res.ok) {
    return new Response("API error", { status: 500 });
  }

  const data = await res.json();

  const mapping: Record<string, string> = {
    "GRAMALTIN": "full_gold",
    "14AYARALTIN": "ayar_14_gold",
    "18AYARALTIN": "ayar_18_gold",
    "CEYREKALTIN": "quarter_gold",
    "22AYARBILEZIK": "ayar_22_bilezik",
    "ATAALTIN": "ata_gold",
    "CUMHURIYETALTIN": "cumhuriyet_gold",
    "YARIMALIN": "half_gold",
    "USD": "usd",
    "EUR": "eur"
  };

  const updates = Object.entries(mapping)
    .filter(([apiKey]) => data[apiKey])
    .map(([apiKey, assetType]) => ({
      asset_type: assetType,
      selling_price: parseFloat(data[apiKey]?.Selling || 0),
      buying_price: parseFloat(data[apiKey]?.Buying || 0),
      updated_at: new Date().toISOString()
    }));

  const { error } = await supabase
    .from("current_prices")
    .upsert(updates, { onConflict: "asset_type" });

  if (error) {
    console.error(error);
    return new Response("DB update failed", { status: 500 });
  }

  return new Response("Prices updated", { status: 200 });
});
