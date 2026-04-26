import twilio from 'twilio';

// Lazy-initialize to avoid crash at build time when credentials are placeholders
function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid?.startsWith('AC') || !token) {
    throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local');
  }
  return twilio(sid, token);
}

const HAVEN_WA_NUMBER = () => process.env.TWILIO_WHATSAPP_NUMBER!;

const CHECKIN_MESSAGES = [
  `Hi! This is HAVEN checking in 💙\n\nHow are you feeling today?\nReply with a number:\n1 = Really struggling\n2 = Not great\n3 = Okay\n4 = Pretty good\n5 = Great!\n\nOr just reply with how you're feeling in your own words.`,
  `Good morning from HAVEN 🌅\n\nOn a scale of 1–5, how's your wellbeing today?\n(1 = very low, 5 = excellent)\n\nYou can also just tell me how you're doing.`,
  `Hey, HAVEN here. Checking in on you 💚\n\nHow did yesterday treat you?\nReply 1–5 or share anything on your mind.\n\nRemember: whatever you're feeling is valid.`,
];

export async function sendCheckinMessage(phoneNumber: string): Promise<string> {
  const message = CHECKIN_MESSAGES[Math.floor(Math.random() * CHECKIN_MESSAGES.length)];

  const result = await getClient().messages.create({
    from: HAVEN_WA_NUMBER(),
    to: `whatsapp:${phoneNumber}`,
    body: message,
  });

  return result.sid;
}

export async function sendGentleNudge(phoneNumber: string): Promise<void> {
  await getClient().messages.create({
    from: HAVEN_WA_NUMBER(),
    to: `whatsapp:${phoneNumber}`,
    body: `Hey 👋 HAVEN here.\n\nWe noticed you haven't been active lately. That's okay — life gets busy.\n\nWhenever you're ready, your HAVEN community is here 💚\n\nhaven.my`,
  });
}

export async function sendCrisisMessage(phoneNumber: string): Promise<void> {
  await getClient().messages.create({
    from: HAVEN_WA_NUMBER(),
    to: `whatsapp:${phoneNumber}`,
    body: `HAVEN noticed you might be having a really tough time 💙\n\nYou're not alone. Please reach out:\n\n📞 Befrienders Malaysia: 03-7627 2929 (free, 24/7)\n\nOr open HAVEN now to talk to our AI companion or find a counselor:\nhaven.my/safe-space\n\nWe care about you.`,
  });
}

export function buildLowWellbeingReply(score: 1 | 2): string {
  const base = process.env.NEXT_PUBLIC_URL ?? 'https://haven.my';
  const rakanLink     = `${base}/safe-space/session?mode=ai_companion`;
  const counselorLink = `${base}/safe-space/session?mode=counselor`;

  const opening = score === 1
    ? `You seem really low today 💙 That takes courage to share — thank you.`
    : `You seem quite low today 💙 I hear you, and that's okay.`;

  return (
    `${opening}\n\n` +
    `Please pick an option to relieve and share your feelings:\n\n` +
    `*1. Talk to Rakan* — our AI companion, available right now\n${rakanLink}\n\n` +
    `*2. Talk to a Counselor* — connect with a professional\n${counselorLink}\n\n` +
    `📞 Need immediate help? Befrienders Malaysia: 03-7627 2929 (free, 24/7)\n\n` +
    `You're not alone. 🌱`
  );
}

export async function sendLowWellbeingReply(phoneNumber: string, score: 1 | 2): Promise<void> {
  await getClient().messages.create({
    from: HAVEN_WA_NUMBER(),
    to: `whatsapp:${phoneNumber}`,
    body: buildLowWellbeingReply(score),
  });
}

export function getCheckinTemplate(): string {
  return CHECKIN_MESSAGES[Math.floor(Math.random() * CHECKIN_MESSAGES.length)];
}
