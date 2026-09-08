# Nivaran demo script

For the video shot on 9 to 11 September 2026. Every step names what you do, what you say, and what must appear before you keep the take. Lines are Hinglish; an English variant follows each. Shoot each numbered take separately and pick the best of three.

## Before recording, once

Laptop, three terminals at the repo root:

```powershell
# 1. API server (key and demo code live in .env.local)
$env:NIVARAN_NEXT_DIST_DIR = ".next-mobile"; npx next dev -p 3100

# 2. Metro for the phone and the web build (mobile/.env points the app at port 3100)
cd mobile; npx expo start

# 3. Phone link, again after every USB reconnect
adb reverse tcp:8081 tcp:8081; adb reverse tcp:3100 tcp:3100
```

Phone:

- USB debugging on, File transfer mode, Do Not Disturb on, brightness full, notifications cleared.
- Fresh start for the video: Settings, Apps, Expo Go, Storage, Clear data. That removes all test chats; the app then opens with zero chats. Do this only when you are ready to record, it cannot be undone.
- Open Expo Go, open the Nivaran project (or run `adb shell am start -a android.intent.action.VIEW -d exp://127.0.0.1:8081` from the laptop).
- Profile: language Hinglish, Typed chat "Assistant replies", voice shows "Voice is on".
- Shake the phone, open the dev menu, and hide the floating Expo button if the option is offered; otherwise keep it out of the crop.
- Dry run voice once before the first take. If voice fails on the day, every moment below also works by typing; the video still holds.

Screen capture: `scrcpy --record take1.mp4` on the laptop, or `adb shell screenrecord /sdcard/take1.mp4` then `adb pull`. Film yourself speaking with a second phone and sync in the edit.

## Take 0, before, 12 seconds

Voice over the real portal screenshots in `docs/cpgrams-test-evidence/` and `public/shots/`.

Hinglish: "Aaj CPGRAMS par shikayat karne ke liye pehle category chunni padti hai, 148 offices ki list se apna office, aur attachment sirf PDF. Bahut log yahin ruk jaate hain."

English: "Filing on CPGRAMS today means picking a category first, your office from a list of 148, and PDF-only attachments. Many people stop right there."

## Take 1, speak, 40 seconds

1. Home screen: the wordmark, the sphere, "Kya hua tha?". Hold on it for two seconds.
2. Tap the sphere. The voice screen opens with "Hold to speak".
3. Press and hold the big button and say:

   Hinglish: "Mera PF transfer claim reject ho gaya hai. Purani company Meridian Textiles thi, Surat mein. Naya employer Pune mein hai. Mujhe nahi pata kaun sa EPFO office dekh raha hai."

   English: "My PF transfer claim was rejected. My previous company was Meridian Textiles in Surat. My new employer is in Pune. I do not know which EPFO office is handling it."

4. Release. Keep the take only if: your words appear as the transcript, a reply plays, and the facts card shows PF transfer, rejected, the employers, and office unknown.
5. Tap "Confirm all".

Typed fallback: type the same line into the box on Home and tap the arrow. The chat opens, the assistant replies in Hinglish, the facts card appears. Tap "Confirm all".

## Take 2, the conversation, 40 seconds

Answer the assistant's questions in the chat. It asks in its own words; the content will be these three things, in some order.

- Rejection wording. Say or type: "Haan, SMS aaya tha. Likha tha date of exit mismatch." English: "Yes, I got an SMS. It said date of exit mismatch."
- Exit date. "Pandrah April do hazaar pachees." English: "15 April 2025."
- What you want. "Reject kyun hua ye batayein aur record theek karein." English: "Explain why it was rejected and correct the records."

Keep the take only if each answer lands on the facts card and you confirm it. When the draft is ready the chip "Review your complaint" appears under the messages. Do not tap it yet.

## The chat, line by line

The assistant is a model, so it phrases replies freely; the replies below are what it said in a test run on 8 September and show the shape to expect. What it must do at each step is fixed by the app: propose facts to the card, ask about one missing thing, never invent a value.

Hinglish:

| You | Assistant, example | On screen |
|---|---|---|
| Mera PF transfer claim reject ho gaya hai. Purani company Meridian Textiles thi, Surat mein. Naya employer Pune mein hai. Mujhe nahi pata kaun sa EPFO office dekh raha hai. | Samajh gaya, aapka PF transfer claim reject hua hai. Kya aapke paas rejection ka message ya letter hai, usme reason kya likha tha? | Facts card: Service PF transfer, Claim status rejected, Previous employer Meridian Textiles, Current employer Pune, Office unknown. Tap Confirm all. |
| Haan, SMS aaya tha. Likha tha date of exit mismatch. | Theek hai, SMS mein 'date of exit mismatch' likha tha. Aapne purani company kab chhodi thi? | Facts card: Rejection wording "date of exit mismatch". Confirm. |
| Pandrah April do hazaar pachees. | 15 April 2025 note kar liya. Aap is shikayat se kya chahte hain, rejection ki wajah samajhna ya record theek karwana? | Facts card: Employment exit date 15 April 2025. Confirm. |
| Reject kyun hua ye batayein aur record theek karein. | Bilkul. Aapka draft ab review ke liye taiyaar hai; agar rejection ka letter ya relieving letter ho toh jod dein. | Facts card: Requested action. Confirm. Chips: "Rejection message ya letter jodein", "Apni shikayat review karein". |

English:

| You | Assistant, example | On screen |
|---|---|---|
| My PF transfer claim was rejected. My previous company was Meridian Textiles in Surat. My new employer is in Pune. I do not know which EPFO office is handling it. | I understand, your PF transfer claim was rejected. Do you have the rejection message, and what reason did it give? | Facts card with service, status, both employers, office unknown. Confirm all. |
| Yes, I got an SMS. It said date of exit mismatch. | Noted, "date of exit mismatch". When did you leave your previous company? | Rejection wording proposed. Confirm. |
| 15 April 2025. | Got it, 15 April 2025. What would you like the office to do? | Exit date proposed. Confirm. |
| Explain why it was rejected and correct the records. | Your draft is ready to review. If you have the rejection letter or a relieving letter, attach it. | Requested action proposed. Confirm. Chips appear. |

If the model is unavailable on the day, Profile → Typed chat → "Scripted questions" gives a fully predictable version with fixed wording: "Were you transferring PF or withdrawing money?" (chips), "What did the rejection message say?", "When did you leave the previous employer?", "What would you like the office to do?" (chips), "Which EPFO office is handling the claim? You can leave this unknown." In Hinglish: "Aap PF transfer kar rahe the ya paise nikaal rahe the?", "Rejection message mein kya likha tha?", "Aapne purani company kab chhodi thi?", "Aap office se kya karwana chahte hain?", "Kaun sa EPFO office claim dekh raha hai? Nahi pata toh chhod sakte hain."

Quota, read this before the shoot: the free tier allows 20 requests per day per model on one key, and a chat turn costs one or two. The server walks a chain of models, so one demo run has room, but do not rehearse the model chat more than twice on the day. Create a second API key in a new Google Cloud project and put it in `.env.local` as `GEMINI_API_KEY_BACKUP`; it doubles the allowance.

## Take 3, refuse to guess, 30 seconds

1. Tap the paperclip in the composer. The sheet opens.
2. Tap "Sample relieving letter".
3. The letter appears in the chat as an image, then the assistant's line "Date of exit found: 31 March 2025 · Simulated check", then the amber card "Two different answers" with 15 April 2025 (you said) and 31 March 2025 (from the relieving letter).
4. Say for the camera: "Main sure nahi hoon." Tap "Pakka nahi hai" ("I'm not sure").
5. Keep the take only if the card closes and no date is chosen.

## Take 4, kill and resume, 20 seconds

1. Open recent apps and swipe Expo Go away. Say: "Ab app band."
2. Reopen Expo Go and the project. Home shows "1 in progress".
3. Tap Chats. The row shows the case with its last message. Tap it.
4. Keep the take only if every message, the facts and the attached letter are still there.

## Take 5, review, 30 seconds

1. Tap the "more" button top right, then Review.
2. Scroll the complaint slowly. Point at two lines: "The employment exit date needs verification; I have not confirmed an exact date." and "The responsible field office has not yet been identified."
3. Tap Edit on "Requested action", change one word, save. Say: "Baaki sab waisa hi raha." The rest of the facts stay.
4. Tap "Save reviewed draft". The dark card shows "Simulated receipt SIM-…". Say: "Receipt simulated hai. Kuch bhi kisi department ko nahi gaya."

## Take 6, the web, 10 seconds

On the laptop open `http://localhost:8081` (or the deployed link once it exists). Type the story from Take 1 into the box and press the arrow. The same chat, the same reply, the same facts card, the bottom bar. Caption: "No install. Same app in the browser."

## Take 7, close, 5 seconds

Home screen. Voice over: "Nivaran. Apni baat bolo, baaki hum sambhalte hain." End card: "Prototype · synthetic data · nothing is filed."

## Edit rules

- Cut the model's waiting time to about a second; never cut the app's own state changes such as a card appearing.
- Subtitle every Hinglish line in English.
- No overlays claiming accuracy, speed, or time saved.
- Do not cut between the phone and the laptop as if they share one case; each keeps its own drafts.
- Total under three minutes.

## If something breaks on the day

| Symptom | Do this |
|---|---|
| Voice button stays on "Connecting…" or shows "Voice unavailable" | Tap "Switch to typing" and continue with the typed fallback. Check the API server terminal for `POST /api/live-token` lines. |
| Assistant does not reply in the chat | The API server terminal shows `POST /api/chat`. A 502 means Gemini is overloaded; wait ten seconds and send again. Profile "Scripted questions" always works offline. |
| Phone cannot reach the server | Re-run both `adb reverse` commands. |
| Metro shows a red error box on the phone | Shake, Reload. |
| The floating Expo button is in the frame | Crop it in the edit; it is 60 px in the top right. |
