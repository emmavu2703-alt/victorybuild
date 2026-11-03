module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({error:'Our AI adviser is not available yet. Please call 0457 310 074 or email info@victorybuild.com.au.'});
  const messages = req.body?.messages;
  if (!Array.isArray(messages) || !messages.length || messages.length > 12 || messages.some(m => !['user','assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 1500)) return res.status(400).json({error:'Please send a shorter message.'});
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {method:'POST', headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'}, signal:AbortSignal.timeout(25000), body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-4o',max_tokens:450,messages:[{role:'system',content:'You are VictoryBuild’s AI project adviser. Use friendly Australian English and concise replies. Help with landscaping, plumbing and electrical project enquiries. Ask one useful question at a time about suburb, scope and timeframe. Contact: 0457 310 074, info@victorybuild.com.au. Never invent pricing, licences, service suburbs, availability, reviews or booking confirmations. Recommend a site assessment for quotes. Do not give DIY electrical or dangerous plumbing instructions. For immediate danger advise contacting emergency services. Stay on business-related topics. You cannot book or send messages. Do not request sensitive personal information.'},...messages]})});
    if (!response.ok) throw new Error('upstream');
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error('empty');
    return res.status(200).json({reply});
  } catch { return res.status(502).json({error:'The adviser is temporarily unavailable. Please call 0457 310 074 or try again shortly.'}); }
};
