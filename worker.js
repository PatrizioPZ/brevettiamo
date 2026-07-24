export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    let commandText = "";
    let channelSource = "";
    let chatIdOrPhone = "";
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      commandText = formData.get("Body");
      chatIdOrPhone = formData.get("From");
      channelSource = "WhatsApp";
      if (chatIdOrPhone !== env.MY_PERSONAL_WHATSAPP) {
        return new Response("Unauthorized", { status: 401 });
      }
    } else if (contentType.includes("application/json")) {
      const payload = await request.json();
      if (payload.message && payload.message.text) {
        commandText = payload.message.text;
        chatIdOrPhone = payload.message.chat.id.toString();
        channelSource = "Telegram";
      } else if (payload.admin_command) {
        commandText = payload.admin_command;
        channelSource = "Admin Web Panel";
        chatIdOrPhone = "web";
      }
    }

    if (!commandText) return new Response("No command detected", { status: 400 });

    await fetch(`https://github.com${env.GH_REPO}/actions/workflows/dormant_ceo.yml/dispatches`, {
      method: "POST",
      headers: {
        "Authorization": `token ${env.GH_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Holding-Ceo-Omnichannel-Bridge"
      },
      body: JSON.stringify({
        ref: "development",
        inputs: {
          dynamic_command: commandText,
          source: channelSource,
          chat_id: chatIdOrPhone
        }
      })
    });

    if (channelSource === "WhatsApp") {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>🔄 [BrevettIAmo 2.0]: Ordine ricevuto. Consegna programmata anti-bot a 3 minuti nella Sandbox.</Message></Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    if (channelSource === "Telegram") {
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatIdOrPhone,
          text: "🔄 *Elaborazione avviata.* Consegna puntuale in 3 minuti. L'Agente Dormiente è attivo.",
          parse_mode: "Markdown"
        })
      });
    }

    return new Response(JSON.stringify({
      status: "Success",
      message: "Comando inviato all'Agente Dormiente",
      command: commandText,
      source: channelSource,
      estimated_delivery: "3 minuti"
    }), { headers: { "Content-Type": "application/json" } });
  }
};