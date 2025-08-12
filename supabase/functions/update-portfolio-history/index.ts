// Konum: supabase/functions/update-portfolio-history/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Portfolio history update function started.");

const supabaseAdmin = createClient(
  Deno.env.get('SUPA_URL')!,
  Deno.env.get('SUPA_SERVICE_KEY')!
);

Deno.serve(async (req) => {
  // GÜVENLİK KONTROLÜ BURADAN KALDIRILDI.
  // Fonksiyon artık doğrudan çalışacak.

  try {
    const { data: pricesData, error: pricesError } = await supabaseAdmin
      .from('current_prices')
      .select('asset_type, selling_price');

    if (pricesError) throw new Error(`Error fetching prices: ${pricesError.message}`);
    
    const prices: { [key: string]: number } = Object.fromEntries(
      pricesData.map(p => [p.asset_type, p.selling_price])
    );
    prices['tl'] = 1;

    console.log("Successfully fetched current prices.");

    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id');
    
    if (usersError) throw new Error(`Error fetching users: ${usersError.message}`);
    if (!users || users.length === 0) {
        console.log("No users found to process.");
        return new Response(JSON.stringify({ message: "No users found" }), { headers: corsHeaders });
    }

    const { data: allInvestments, error: investmentsError } = await supabaseAdmin
        .from('investments')
        .select('user_id, type, amount');

    if(investmentsError) throw new Error(`Error fetching all investments: ${investmentsError.message}`);

    const portfolioValues: { [userId: string]: number } = {};
    
    for (const investment of allInvestments) {
        if (!portfolioValues[investment.user_id]) {
            portfolioValues[investment.user_id] = 0;
        }
        const price = prices[investment.type] || 0;
        portfolioValues[investment.user_id] += investment.amount * price;
    }

    const historyRecordsToInsert = Object.entries(portfolioValues).map(([userId, totalValue]) => ({
      user_id: userId,
      value: totalValue,
      recorded_at: new Date().toISOString()
    }));

    if (historyRecordsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('portfolio_history')
        .insert(historyRecordsToInsert);

      if (insertError) throw new Error(`Error inserting portfolio history: ${insertError.message}`);
      console.log(`Successfully inserted ${historyRecordsToInsert.length} portfolio history records.`);
    } else {
        console.log("No investments found to create history from.");
    }

    return new Response(JSON.stringify({ message: "Portfolio history updated successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("An error occurred:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});