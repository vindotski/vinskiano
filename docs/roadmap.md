# Roadmap

Where Vinskiano is going after the release of what's now under `[Unreleased]`: parity with FL Studio's 3x Osc and the channel settings around it. [parity.md](parity.md) lists every parameter; this file covers the technology, the preset format, and the order.

## Technology

We re-checked the stack against the whole parity list. Decisions:

- **Web Audio stays hand-written; still no Tone.js.** Every parameter in [parity.md](parity.md) maps to a native node or an `AudioParam` automation. Tone.js would add bundle size and an unmaintained shim for things we'd use a fraction of. The trigger to revisit stays the same: real sequencing or many effects. The arpeggiator alone isn't that.
- **A `Voice` per note** in `audio/`. Today each oscillator owns a gain and each note gets its own fade gain. Envelopes, filters, AM and stereo need the whole chain per note:

  ```
  per oscillator: osc L + osc R → merger → invert → pan → mix level ─┐
                                                                     ├→ filter(s) → envelope gain → master
  osc 3 (with AM: → the 1+2 bus's gain instead) ─────────────────────┘
  ```

  The `Engine` keeps the voices, steals the oldest when `maxPoly` is reached, and handles mono and portamento.
- **`PeriodicWave` for shapes and phase.** `OscillatorNode` can't start at a phase, but a periodic wave whose Fourier coefficients are rotated starts wherever we want. The same mechanism gives rounded saw and phase rand. Waves are cached per shape and phase step, because creating one per note is too slow.
- **`AudioWorklet` only where native nodes can't do it:** the aliased non-HQ oscillators, and perhaps FL-like SVF filters later. It loads in an effect (server-safe), from a Vite `?url` import.
- **Envelope release from wherever the note is.** `cancelAndHoldAtTime` does this, but check it on MDN against our browser floor before M3 (Firefox has lacked it). The fallback is to compute the envelope's current value ourselves and ramp from there.
- **Filter sweeps in cents.** `BiquadFilterNode.detune` takes cents, so envelopes and LFOs on cutoff are exponential, like FL's, without converting to Hz.
- **A hand-written lookahead scheduler** (a timer that schedules on `AudioContext.currentTime` a little ahead) for the arpeggiator and tempo-synced times. About a hundred lines; no library.
- **Valibot for the preset schema** (from M1). Today `synth/preset.ts` checks five fields by hand; the full format has about eighty. Valibot is small and tree-shakable, infers the TypeScript types (replacing `types/synth.ts`), implements Standard Schema (which TanStack Start's validators take directly), and `@valibot/to-json-schema` publishes a JSON Schema for preset files. Check `trustPolicy` and `minimumReleaseAge` when adding it.
- **Input:** the FL typing layout and 88 keys are done. Next are velocity and Web MIDI (feature-detected: Safari has no Web MIDI).
- **Testing sound:** Vitest for the schema, defaults, migrations and mix math. Playwright with an `OfflineAudioContext` for facts about the sound, on all three engines: two equal oscillators with one inverted give silence, the mix adds up to one, an envelope's attack takes as long as it says. Later, the same renders compared with WAVs from FL ([measuring](parity.md#unknowns-to-measure-in-fl)).
- **UI:** the Sound pages already have tabs. Each milestone adds a tab (Envelopes, Filter, LFOs, Voice, Arp) or a rack column (pan, fine, invert…). The app bar stays one row down to 667 px.

## Preset format

Presets are kept on the server today (`presets.settings`, jsonb), checked by `parsePresetSettings` on the way in and out. They hold `master.gain` and three oscillators with `id`, `waveform`, `pitch` and `mix`. The rules below let that format grow to full parity without breaking a saved preset.

### Rules

1. **A version number, bumped only on breaking changes.** Settings get `"version": 1`. Settings without one are version 1 too: today's shape already is. Adding fields doesn't change the version.
2. **New fields are optional, with a default that sounds like the preset did before.** A preset saved before the filter existed loads with the filter off; before envelopes, with today's short fades. The checker fills in defaults; everything we write is complete.
3. **Physical and musical units, never knob positions:** semitones, cents, seconds, Hz, BPM, levels 0..1, bipolar amounts −1..1, phase as a fraction of a cycle. Knob curves can change (see [the unknowns](parity.md#unknowns-to-measure-in-fl)); presets don't.
4. **Keep today's names.** `waveform` gets new values (`'roundSaw'`, `'noise'`, `'sample'`), `pitch` stays the coarse tune in semitones, `mix` stays as it is. So the whole path to parity needs no migration.
5. **Breaking changes come with a migration.** If one is ever needed, a pure function `vN → vN+1` in `synth/preset-migrations.ts` runs on read. Saved fixtures of every version (`synth/fixtures/`) must load forever; a unit test checks them. The older "volume per oscillator" presets already work this way (`fromVolumes` in `synth/preset.ts`).
6. **Unknown fields are dropped, unknown values rejected.** The server stores only what it understands. A rollback to an older release therefore can't read presets that use newer values; deploys go forward.
7. **The engine never reads a preset directly.** UI state is the checked settings, the engine follows the state (as today).

### Version 1, complete

```jsonc
{
  "version": 1,
  "master": { "gain": 0.5, "pan": 0 },
  "oscillators": [
    // three, ids 1..3; osc 1 has no mix
    {
      "id": 1,
      "waveform": "sawtooth", // sine | square | sawtooth | triangle | roundSaw | noise | sample
      "pitch": 0, // semitones, -24..24
      "fine": 0, // cents, -100..100
      "stereoDetune": 0, // cents
      "phase": 0, // 0..1 of a cycle
      "stereoPhase": 0, // -0.5..0.5, right side against the left
      "invert": false,
      "pan": 0 // -1..1
    }
    // { "id": 2, ..., "mix": 0.5 }, { "id": 3, ..., "mix": 0.33 }
  ],
  "am": false,
  "phaseRand": 0,
  "hq": true,
  "envelopes": {
    // volume, modX, modY, pitch; all the same shape
    "volume": {
      "enabled": false,
      "delay": 0,
      "attack": 0,
      "hold": 0,
      "decay": 0,
      "sustain": 1,
      "release": 0, // seconds; sustain 0..1
      "attackTension": 0,
      "decayTension": 0,
      "releaseTension": 0, // -1..1
      "amount": 1, // -1..1
      "tempoSync": false
    }
  },
  "lfos": {
    // volume, pan, modX, modY, pitch
    "volume": {
      "shape": "sine",
      "delay": 0,
      "attack": 0,
      "speed": 1,
      "amount": 0,
      "tempoSync": false,
      "global": false
    }
  },
  "filter": { "type": "fastLp", "cutoff": 20000, "resonance": 0 }, // Hz; 0..1
  "voice": { "maxPoly": 0, "mono": false, "porta": false, "slide": 0.1, "fullPorta": false },
  "tracking": {
    "velocity": { "mid": 100, "pan": 0, "modX": 0, "modY": 0 },
    "key": { "mid": 60, "pan": 0, "modX": 0, "modY": 0 }
  },
  "arp": {
    "direction": "off",
    "time": 0.25,
    "gate": 1,
    "slide": false,
    "range": 1,
    "repeat": 1,
    "chord": "none"
  },
  "tempo": 120
}
```

Defaults for the oscillators are today's new sound. `sample` (for the custom shape, M8) will be a reference to an uploaded sample, never the audio itself, so presets stay small and links stay short.

### Where presets live

| Where                               | What                                                                                                                                                                                                                                                    | When |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Server (guest account)              | Saved presets, as today                                                                                                                                                                                                                                 | ✅   |
| In the app (`synth/factory/*.json`) | Factory presets: Init and a few classic 3x Osc–style sounds, read-only in the presets menu. A unit test checks each one                                                                                                                                 | M1   |
| The browser (`localStorage`)        | The current sound, so a reload doesn't lose unsaved changes. Read through the same checker                                                                                                                                                              | M1   |
| A link                              | `/app?sound=…`: the settings as JSON, `deflate-raw` with `CompressionStream` (in our browser floor and in Node), base64url. The `/app` route's loader decodes it, so the server renders the right knobs. Written by a Share button, not on every change | M1   |
| A file                              | Export and import `*.vinskiano.json`, with `"$schema"` pointing to the published JSON Schema                                                                                                                                                            | M1   |

## Decided later

- **Abandoned guest accounts** and their presets are never removed. A guest's cookie lasts a year, so a cleanup of guests idle for about 13 months would lose nothing anyone can reach. Not worth doing before there's real traffic.
- **React Aria's "Dismiss" strings in 34 languages** (0.8 kB gzip on `/app`) stay until removing them needs no build plugin.

## Milestones

Each milestone is a few one-commit steps and ends in a minor release.

0. **Release `[Unreleased]`** (presets, sound pages, the FL mix, the 88-key keyboard). Before any of the below.
1. **Foundation:** Valibot schema of the complete version 1 with defaults; `version` written on save; fixtures; the `Voice` refactor (no change in sound); fine tune; factory presets; the current sound kept in `localStorage`; share links; file export and import.
2. **The 3x Osc panel:** pan (oscillators and master), invert, stereo detune, phase and stereo phase, rounded saw, noise, AM, phase rand. After this, the plugin itself is at parity except non-HQ and the sample shape.
3. **Envelopes:** volume and pitch, with every stage, tension and amount, and release from the current level.
4. **Filter:** the eight types, cutoff and resonance, the Mod X and Mod Y envelopes, keyboard tracking.
5. **LFOs:** all five targets, global or per note.
6. **Voices and playing:** max polyphony with stealing, mono, portamento and slide, velocity, Web MIDI, velocity tracking.
7. **Arpeggiator and tempo:** the scheduler, every direction and chord, tempo sync for envelopes and LFOs.
8. **Extras:** the sample shape, the non-HQ oscillators (`AudioWorklet`), a bank of factory presets, and knob ranges from the FL measurements.
