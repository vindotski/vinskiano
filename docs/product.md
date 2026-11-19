# The product

> **Pick a sound, make it yours, send it to a friend.**

That's Vinskiano in one line, and the loop every feature serves. A friend opens the link, hears the sound, makes it theirs, and sends it back. Every shared link is someone else's starting point, so the loop closes on itself: CodePen's or a shared Figma file's remix-by-link, for synth sounds.

Decided in [ADR 0027](decisions/0027-product-loop.md); measured as in [ADR 0028](decisions/0028-loop-analytics.md).

## The five steps

| Step         | What the visitor does                                         | Today                                        | Missing                                                                                                                                                 |
| ------------ | ------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Start** | Opens the synth on a sound worth playing, never a blank patch | Four factory sounds, only in the home demo   | Factory sounds in the presets menu (grouped: keys, bass, lead, pad, pluck); "Open in the synth" from the demo; a shared link opens on its sound         |
| **2. Play**  | Hears it straight away, with whatever they have               | Mouse, touch, the computer keyboard, 88 keys | MIDI keyboards (later)                                                                                                                                  |
| **3. Shape** | Changes it until it's theirs                                  | Waveform, pitch and mix per oscillator       | **A volume envelope and a filter.** Without them a pluck, a pad and a bass can't sound different, so "make it yours" is hollow                          |
| **4. Keep**  | Doesn't lose it                                               | Named presets, on the server, no sign-up     | The current sound kept in the browser, so a reload loses nothing                                                                                        |
| **5. Send**  | Shares it in one tap                                          | —                                            | **A Share button that makes a link** (`/app?sound=…`), whose preview in a chat names the sound; opening it says "Shared sound: X" and offers to save it |

## The rule for features

**Does it help someone start, play, shape, keep or send a sound?** If not, it waits.

FL Studio's 3x Osc ([parity.md](parity.md)) stays the reference for *how* a feature behaves (its ranges, its curves), but no longer sets the *order* features arrive in: the loop does ([roadmap.md](roadmap.md#milestones)).

**Not part of the loop, for now:** accounts and sign-up, a public gallery or feed, recording or exporting audio, sequencing. Each could later grow out of "send", but the loop closes without them.

## Done looks like

A stranger opens a shared link on a phone, changes the sound, and sends it back, without being told how.

## Measuring it

Spotcraft (from 0.7) counts every app's use with Umami on its own server: cookieless, no ids, nothing sent to an outside service, and an opt-out at `/_spotcraft/privacy`. Its proxy adds the script to our pages, so page views, referrers, countries, devices and new guests per day need nothing from us. Our CSP already allows it (the script and its endpoint are on our own origin).

What we add is **one event per step**, at most once per page load, so the numbers count visitors who reached a step, not key presses:

| Event   | When                          | Data                                                             |
| ------- | ----------------------------- | ---------------------------------------------------------------- |
| `start` | The synth opens on a sound    | `from`: `new`, `factory`, `preset` or `shared`                   |
| `play`  | The first note                | `where`: `app` or `home`; `by`: `pointer`, `touch` or `keyboard` |
| `shape` | The first change to the sound | `control`: `waveform`, `pitch`, `mix`, …                         |
| `keep`  | A preset saved                | —                                                                |
| `send`  | A share link made             | `via`: `copy` or `share-sheet` (with the Share button)           |

**What we read, each week, in Spotcraft's dashboard:**

- **The funnel**, start → play → shape → keep → send. Where visitors drop off says what to build next.
- **Links opened per link sent.** Above one, the loop grows by itself.
- **The north star: shared sounds opened per week.** Each one means someone made a sound, sent it, and someone else heard it.

**Rules:**

- Events go through one typed helper that does nothing when Umami isn't there (locally, in tests, after an opt-out, or with the script blocked).
- Counting never delays sound or state: it's sent after the action, and never waited on.
- Event data never holds a preset's name or settings, or anything that could tell visitors apart.
- Before share links ship, check how Umami records a long `?sound=` in a page's URL.
