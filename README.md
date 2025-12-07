<img src="https://freepngimg.com/thumb/terminator/21148-9-terminator-picture.png" width="200" title="Bot" alt="Bot" />  

# Bot‑InstaAutoLike

A JavaScript helper to auto‑like posts on an Instagram profile from your desktop browser.  
The bot simulates human‑like behaviour with randomized delays, optional safety profiles, and rest periods to reduce the risk of hitting Instagram’s action limits.

---

## Features

- Auto‑likes posts from a profile using the web UI  
- Works as either a **console snippet** or a **bookmarklet**  
- Handles next/previous navigation inside the media viewer  
- Versioned scripts:
  - **v1** – minimal, aggressive legacy script (`v1.js`)
  - **v2** – UI‑based, profile‑aware, rate‑limited script (`v2.js`)
- Optional **Pause / Resume** and **Start / Exit** controls (v2)  
- Light / dark control panel theme (v2)

---

## Files

| File                | Description                                  |
|---------------------|----------------------------------------------|
| `v1.js` | Original v1 bot (legacy, faster and riskier) |
| `v2.js`             | New UI + safety‑profile aware implementation |
| `LICENSE`           | MIT license                                  |

---

## Usage (v2 – Recommended)

v2 is the recommended, safer implementation with a control panel and account type selector.

1. **Open a profile in a desktop browser**  
   - Go to the Instagram profile whose posts you want to like.  
   - Make sure you are logged in and can open a post in a modal.

2. **Run the script**

   You can use either of the following approaches:

   ### Option A – Browser console

   - Open **Developer Tools → Console**.  
   - Copy the entire contents of [`v2.js`](./v2.js) and paste it into the console.  
   - Press **Enter** to execute.

   ### Option B – Bookmarklet

   - Create a new bookmark in your browser.  
   - Set the bookmark’s URL to the content of `v2.js` **prefixed with** `javascript:`.  
   - While viewing an Instagram profile, click the bookmark to start the UI.

3. **Select an account safety profile**

   In the left‑hand control panel:

   - Use the **“Account safety profile”** dropdown to pick:
     - **Conservative / New account**  
       - Approx. **20–40 likes/hour** with longer delays and more frequent rest periods.  
       - Intended for **new, low‑trust, or recently restricted** accounts.
     - **Standard / Established account**  
       - Approx. **40–80 likes/hour** within commonly reported safe ranges for mature accounts.  
       - Intended for **older, regularly active** accounts.

   A short description under the dropdown shows the **approximate likes/hour and per‑session caps** for the active profile.

   The profile can be changed **while the bot is running**; new limits and jitters take effect on the next actions.

4. **Control panel actions**

   - **Start / Exit**
     - `▶ Start` – initializes the automation loop for the current profile.  
     - `⏹ Exit` – stops the loop, removes the UI, and cleans up injected elements.

   - **Pause / Resume**
     - `⏸ Pause` – temporarily suspends automated actions so you can manually scroll, open a different post, or adjust the profile.  
     - `▶ Resume` – continues from the currently open post using the latest profile configuration.

   - **Panel visibility**
     - Use the `◀` button to hide the side panel.  
     - Click the vertical **“SHOW PANEL”** handle to reveal it again.

   - **Theme**
     - Click the theme toggle (🌙 / ☀️) to switch between dark and light UI.

5. **Behaviour**

   - The bot:
     - Ensures a post modal is open.  
     - Waits a randomized delay based on the active profile.  
     - Attempts to click **Like** if available.  
     - Moves to the **Next** post and repeats.  
     - Applies occasional **long rest periods** after a number of cycles.  
     - Stops or refreshes the page when it reaches the end of available posts.

---

## Usage (v1 – Legacy Script)

The original script is kept for historical reasons and simple one‑shot runs.

1. Open the Instagram profile whose pictures you want to like.  
2. Copy‑paste the code from [`v1.js`](./v1.js) into the **browser console**, or save it as a bookmarklet.  
3. Run it once and let it proceed through the posts.

When it finishes, the page is typically refreshed.

> **Note:** v1 is more aggressive and less configurable than v2. For ongoing or repeated usage, v2 is strongly preferred.

---

## Safety, Limits and Best Practices

Instagram enforces **daily and hourly action limits** (likes, follows, comments, etc.), which can vary by account age, trust, and activity history. External automation guides generally recommend: 

- **New / low‑trust accounts**
  - Roughly **20–40 likes per hour**.  
  - Keep total likes well under **a few hundred per day**.  
  - Avoid long, uninterrupted sessions.

- **Established / mature accounts**
  - Often can handle **around 70–120 likes per hour** if actions are spaced and randomized.  
  - Staying **below ~1,000 likes per day** is considered a conservative ceiling.

Even with the new profile‑aware limiter, there is **no guarantee** against:

- Temporary like blocks  
- “Suspicious activity” warnings  
- Forced password resets  
- Shadow bans or other mitigations on the account

Use at your own risk and adjust settings based on how your account behaves over time.

---

## Recommendations

- Prefer the **Conservative / New** profile for:
  - Fresh accounts  
  - Accounts that have recently seen action blocks or warnings  
  - Initial testing on a new environment

- Monitor the control panel counters:
  - **Liked / Skipped**  
  - **Cycles and uptime**  
  - Keep manual track of total daily likes across sessions.

- **Insert breaks**:
  - Avoid running the bot for hours without rest.  
  - Mix automated sessions with genuine manual activity (browsing, commenting, posting).

---

## Disclaimer

This project is for educational and personal use only.  
You are responsible for complying with Instagram’s Terms of Use and applicable laws.  
Use of automation on live accounts may lead to temporary or permanent restrictions on your account.  
The author(s) provide this software **as‑is**, without any guarantees.
