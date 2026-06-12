// CHATBOT BREVETTIAMO - Versione Statica (funzionante)
(function(){
  const SUPABASE_URL='https://jtekrvlmqnluvaiapmwb.supabase.co';
  const SUPABASE_KEY='sb_publishable_p9WH85YPfwtaKp4tfcDwug_Q9duausk';
  let sbClient=null;
  let userId=null;
  let chatOpen=false;
  let unreadCount=0;

  function init(){
    if(typeof supabase!=='undefined'){
      sbClient=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    }
    createChatHTML();
    loadUser();
    showWelcome();
  }

  async function loadUser(){
    if(!sbClient)return;
    try{
      const{data:{session}}=await sbClient.auth.getSession();
      if(session){
        userId=session.user.id;
        loadHistory();
      }
    }catch(e){console.error('Errore auth:',e)}
  }

  async function loadHistory(){
    if(!userId||!sbClient)return;
    try{
      const{data}=await sbClient.from('chat_messages').select('*').eq('user_id',userId).order('created_at',{ascending:true}).limit(50);
      if(data&&data.length>0){
        const msgs=document.getElementById('chatMessages');
        if(msgs){
          msgs.innerHTML='';
          data.forEach(m=>addMessage(m.content,m.is_user,false,false));
        }
      }
    }catch(e){console.error('Errore storico:',e)}
  }

  function createChatHTML(){
    if(document.getElementById('chatWidget'))return;

    const div=document.createElement('div');
    div.id='chatWidget';
    div.className='chat-widget';
    div.innerHTML=`
      <button class="chat-toggle" onclick="window.brevettiamoChat.toggle()" id="chatToggle">
        <i class="bi bi-chat-dots"></i>
        <span class="chat-badge" id="chatBadge" style="display:none">0</span>
      </button>
      <div class="chat-window" id="chatWindow">
        <div class="chat-header">
          <div>
            <h6><i class="bi bi-robot me-2"></i>BrevettIAmo AI</h6>
            <div class="status"><span class="status-dot"></span>Online</div>
          </div>
          <button class="btn-close" onclick="window.brevettiamoChat.toggle()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="quick-replies" id="quickReplies">
          <button class="quick-reply" onclick="window.brevettiamoChat.quickReply('Quanto costa un brevetto?')">Prezzi</button>
          <button class="quick-reply" onclick="window.brevettiamoChat.quickReply('Come funziona?')">Procedura</button>
          <button class="quick-reply" onclick="window.brevettiamoChat.quickReply('Servizi disponibili')">Servizi</button>
          <button class="quick-reply" onclick="window.brevettiamoChat.quickReply('Tempi di consegna')">Tempi</button>
        </div>
        <div class="chat-input">
          <input type="text" id="chatInput" placeholder="Scrivi un messaggio..." onkeypress="if(event.key==='Enter')window.brevettiamoChat.send()">
          <button onclick="window.brevettiamoChat.send()" id="sendBtn"><i class="bi bi-send"></i></button>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  }

  function showWelcome(){
    const msgs=document.getElementById('chatMessages');
    if(!msgs)return;
    msgs.innerHTML=`
      <div class="welcome-msg">
        <i class="bi bi-shield-check"></i>
        <h5>Ciao! Sono l'assistente AI di BrevettIAmo</h5>
        <p>Posso aiutarti con brevetti, marchi, design e ricerche anteriorita.<br>Come posso esserti utile oggi?</p>
      </div>
    `;
  }

  function toggle(){
    const win=document.getElementById('chatWindow');
    const btn=document.getElementById('chatToggle');
    if(!win||!btn)return;
    chatOpen=!chatOpen;
    win.classList.toggle('active',chatOpen);
    if(chatOpen){
      btn.innerHTML='<i class="bi bi-x-lg"></i>'+(unreadCount>0?'<span class="chat-badge" id="chatBadge">'+unreadCount+'</span>':'');
      unreadCount=0;
      updateBadge();
      setTimeout(()=>{
        const input=document.getElementById('chatInput');
        if(input)input.focus();
      },100);
    }else{
      btn.innerHTML='<i class="bi bi-chat-dots"></i>'+(unreadCount>0?'<span class="chat-badge" id="chatBadge">'+unreadCount+'</span>':'');
    }
  }

  function updateBadge(){
    const badge=document.getElementById('chatBadge');
    if(badge){
      badge.style.display=unreadCount>0?'flex':'none';
      badge.textContent=unreadCount;
    }
  }

  function addMessage(text,isUser,save=true,animate=true){
    const msgs=document.getElementById('chatMessages');
    if(!msgs)return;
    const div=document.createElement('div');
    div.className='message '+(isUser?'user':'bot')+(animate?'':' style="animation:none"');
    const time=new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
    div.innerHTML=text+'<div class="message-time">'+time+'</div>';
    msgs.appendChild(div);
    msgs.scrollTop=msgs.scrollHeight;
    if(!isUser&&!chatOpen){
      unreadCount++;
      updateBadge();
    }
  }

  function showTyping(){
    const msgs=document.getElementById('chatMessages');
    if(!msgs)return;
    const div=document.createElement('div');
    div.className='message bot typing';
    div.id='typingIndicator';
    div.innerHTML='<i class="bi bi-three-dots"></i> Sto scrivendo...';
    msgs.appendChild(div);
    msgs.scrollTop=msgs.scrollHeight;
  }

  function hideTyping(){
    const el=document.getElementById('typingIndicator');
    if(el)el.remove();
  }

  function quickReply(text){
    const input=document.getElementById('chatInput');
    if(input)input.value=text;
    send();
  }

  async function send(){
    const input=document.getElementById('chatInput');
    const btn=document.getElementById('sendBtn');
    if(!input)return;
    const text=input.value.trim();
    if(!text)return;

    input.value='';
    if(btn)btn.disabled=true;
    addMessage(text,true);
    showTyping();

    try{
      await new Promise(r=>setTimeout(r,800));
      const response=getAIResponse(text);
      hideTyping();
      addMessage(response,false);

      if(userId&&sbClient){
        await sbClient.from('chat_messages').insert([
          {user_id:userId,content:text,is_user:true},
          {user_id:userId,content:response,is_user:false}
        ]);
      }
    }catch(e){
      hideTyping();
      addMessage('Mi dispiace, ho avuto un problema tecnico. Riprova tra poco.',false);
      console.error('Errore chat:',e);
    }

    if(btn)btn.disabled=false;
    input.focus();
  }

  function getAIResponse(userMessage){
    const lower=userMessage.toLowerCase();

    if(lower.includes('prezz')||lower.includes('cost')||lower.includes('quanto')){
      return 'I prezzi partono da 29 EUR per il pacchetto Starter. I servizi singoli partono da 19 EUR. Visita la pagina <a href="prezzi.html" style="color:#2563eb;text-decoration:underline;">Prezzi</a> per il listino completo.';
    }
    if(lower.includes('procedur')||lower.includes('come funziona')||lower.includes('funziona')){
      return 'E semplice: 1) Scegli il servizio, 2) Descrivi la tua invenzione, 3) L AI prepara i documenti, 4) Tu li revisioni, 5) Depositi tramite UIBM o con nostra assistenza. Tempo medio: 24-48 ore per la preparazione.';
    }
    if(lower.includes('serviz')||lower.includes('offert')){
      return 'Offriamo: Ricerca Anteriorita (19 EUR), Redazione Descrizione Tecnica (49 EUR), Deposito Brevetto UIBM (99 EUR), Ricerca Marchi (29 EUR), Design e Modelli (39 EUR), Consulenza Strategica (59 EUR). Tutti i servizi sono AI-assisted con revisione umana.';
    }
    if(lower.includes('temp')||lower.includes('quando')||lower.includes('veloc')){
      return 'Tempi standard: Ricerca anteriorita 2-4 ore, Redazione documenti 24-48 ore, Deposito UIBM 1-3 giorni lavorativi. I tempi possono variare in base alla complessita della pratica.';
    }
    if(lower.includes('brevett')||lower.includes('invenzion')){
      return 'Un brevetto protegge la tua invenzione per 20 anni. Offriamo assistenza completa: dalla ricerca anteriorita alla redazione della descrizione tecnica fino al deposito UIBM. Il pacchetto completo parte da 99 EUR.';
    }
    if(lower.includes('marchio')||lower.includes('logo')||lower.includes('brand')){
      return 'La ricerca marchi verifica se il tuo nome/logo e gia registrato. Costa 29 EUR e include report dettagliato. Il deposito marchio UIBM e incluso nel pacchetto Pro (99 EUR).';
    }
    if(lower.includes('design')||lower.includes('modello')){
      return 'Il design industriale protegge l aspetto estetico di un prodotto per 25 anni. Offriamo ricerca e deposito a partire da 39 EUR.';
    }
    if(lower.includes('ai')||lower.includes('intelligenza')||lower.includes('artificiale')){
      return 'Usiamo AI avanzata per analizzare milioni di documenti brevettuali in pochi minuti. L AI redige bozze professionali che vengono poi revisionate da esperti. Qualita garantita: 80% AI, 20% umano.';
    }
    if(lower.includes('uman')||lower.includes('espert')||lower.includes('revis')){
      return 'Ogni documento AI viene revisionato da un esperto brevettuale prima della consegna. Non sei soddisfatto? Offriamo 2 revisioni gratuite incluse nel prezzo.';
    }
    if(lower.includes('pagament')||lower.includes('carta')||lower.includes('paypal')){
      return 'Accettiamo carte di credito, PayPal, bonifico bancario. I pagamenti sono gestiti in modo sicuro tramite LemonSqueezy. Fattura sempre inclusa.';
    }
    if(lower.includes('nd')||lower.includes('riservatezz')||lower.includes('privacy')){
      return 'La riservatezza e garantita da NDA digitale. I tuoi dati sono criptati e non condivisi con terzi. Leggi la nostra <a href="modulo_privacy_nda.html" style="color:#2563eb;text-decoration:underline;">Privacy Policy e NDA</a>.';
    }
    if(lower.includes('ciao')||lower.includes('salve')||lower.includes('buongiorno')){
      return 'Ciao! Sono l assistente AI di BrevettIAmo. Come posso aiutarti oggi? Puoi chiedermi informazioni su prezzi, servizi, tempi o procedura.';
    }
    if(lower.includes('grazi')||lower.includes('thank')){
      return 'Prego! Se hai altre domande, sono qui. Oppure puoi creare una pratica direttamente dal <a href="dashboard.html" style="color:#2563eb;text-decoration:underline;">Dashboard</a>.';
    }
    if(lower.includes('login')||lower.includes('acced')||lower.includes('registr')){
      return 'Puoi accedere con Google, Apple o email/password. Clicca su Accedi in alto a destra. Se non hai un account, la registrazione e gratuita e richiede solo 30 secondi.';
    }
    if(lower.includes('portale')||lower.includes('bacheca')||lower.includes('annunci')){
      return 'Stiamo sviluppando un portale per brevettatori e studi legali con bacheca annunci e offerta servizi. Sarai aggiornato non appena sara disponibile!';
    }

    return 'Interessante domanda! Per una risposta piu dettagliata ti consiglio di: 1) Consultare la <a href="index.html" style="color:#2563eb;text-decoration:underline;">homepage</a> per i servizi, 2) Visitare la pagina <a href="prezzi.html" style="color:#2563eb;text-decoration:underline;">Prezzi</a>, o 3) Creare una pratica dal <a href="dashboard.html" style="color:#2563eb;text-decoration:underline;">Dashboard</a> per assistenza personalizzata.';
  }

  window.brevettiamoChat={
    toggle:toggle,
    send:send,
    quickReply:quickReply,
    init:init
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
