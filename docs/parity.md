# Parity with FL Studio's 3x Osc

Vinskiano aims to do what **3x Osc** does in FL Studio, together with the channel settings that a 3x Osc sound relies on (its envelopes, LFOs, filter, voices and arpeggiator). The goal is parity of behaviour, not of looks: a patch recipe written for 3x Osc, such as "saw, osc 2 a fifth up at 50%, filter envelope with a short decay", should give the same sound here.

This file lists every parameter, what Vinskiano does today, and how we plan to do the rest with Web Audio. [roadmap.md](roadmap.md) gives the order, the technology decisions and the preset format.

Sources (FL Studio online manual):

- [3x Osc](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/plugins/3x%20Osc.htm)
- [Sampler channel settings](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/chansettings_sampler.htm): 3x Osc feeds FL's Sampler, so its patches go through the Sampler's channel settings
- [Instrument (INS) tab](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/chansettings_ins.htm): envelopes, LFOs, filter
- [Miscellaneous tab](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/chansettings_misc.htm): polyphony, portamento, trackers, arpeggiator

Status: ✅ done · 🟡 done differently · ⏳ planned · ❌ out of scope. Milestones (M1…M8) are in [roadmap.md](roadmap.md#milestones). Preset fields are relative to the preset's settings (see [the preset format](roadmap.md#preset-format)).

## 3x Osc: each oscillator

| FL parameter                       | In FL                                                                                                                   | Vinskiano                     | How (Web Audio)                                                                                                                                            | Preset field                                                                                                        |       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----- |
| Shape: sine, triangle, square, saw | Buttons                                                                                                                 | ✅ waveform select            | `OscillatorNode.type`                                                                                                                                      | `oscillators[].waveform`                                                                                            | ✅    |
| Shape: rounded saw                 | Button                                                                                                                  | —                             | `PeriodicWave` from the shape's Fourier series                                                                                                             | `waveform: 'roundSaw'`                                                                                              | ⏳ M2 |
| Shape: noise                       | Button                                                                                                                  | —                             | A looping white-noise `AudioBufferSourceNode` (not pitched)                                                                                                | `waveform: 'noise'`                                                                                                 | ⏳ M2 |
| Shape: custom (sample)             | Plays the Sampler's loaded sample                                                                                       | —                             | `AudioBufferSourceNode` with `playbackRate` from the note                                                                                                  | `waveform: 'sample'` + `sample`                                                                                     | ⏳ M8 |
| Coarse                             | −24..+24 semitones                                                                                                      | ✅ same range (Pitch knob)    | `detune` (100 cents per semitone)                                                                                                                          | `oscillators[].pitch`                                                                                               | ✅    |
| Fine                               | −1..+1 semitone                                                                                                         | —                             | Added to `detune`                                                                                                                                          | `oscillators[].fine` (cents, −100..100)                                                                             | ⏳ M1 |
| Stereo detune                      | Left and right a little apart in pitch; centre is off                                                                   | —                             | Two oscillators per oscillator, one per side (`ChannelMergerNode`), detuned in opposite directions                                                         | `oscillators[].stereoDetune` (cents)                                                                                | ⏳ M2 |
| Phase offset                       | Where on the wave a note starts, per side                                                                               | —                             | `OscillatorNode` has no phase. A `PeriodicWave` with its Fourier coefficients rotated by the phase starts there; waves are cached per shape and phase step | `oscillators[].phase` (0..1 of a cycle), `oscillators[].stereoPhase` (right side's offset from the left, −0.5..0.5) | ⏳ M2 |
| Invert                             | Flips the wave; two equal oscillators, one inverted, cancel                                                             | —                             | `GainNode` with gain −1                                                                                                                                    | `oscillators[].invert`                                                                                              | ⏳ M2 |
| Pan                                | Per oscillator                                                                                                          | —                             | `StereoPannerNode`                                                                                                                                         | `oscillators[].pan` (−1..1)                                                                                         | ⏳ M2 |
| Mix                                | Osc 2 and 3 only, in %. Osc 2 takes its share from osc 1, osc 3 from 1 and 2 together; the levels always add up to 100% | ✅ same rule (`synth/mix.ts`) | Per-oscillator `GainNode` at the computed level                                                                                                            | `oscillators[].mix` (0..1, not on osc 1)                                                                            | ✅    |

## 3x Osc: global

| FL parameter | In FL                                                                             | Vinskiano                                         | How (Web Audio)                                                           | Preset field          |               |
| ------------ | --------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- | --------------------- | ------------- |
| AM (osc 3)   | Osc 3 modulates the amplitude of oscillators 1 and 2 instead of being heard       | —                                                 | Osc 3 drives the `gain` AudioParam of the 1+2 bus                         | `am`                  | ⏳ M2         |
| Phase rand   | Random phase per note and side; low values sound natural, high ones are an effect | —                                                 | A random phase per note, through the cached phase-rotated `PeriodicWave`s | `phaseRand` (0..1)    | ⏳ M2         |
| HQ           | Anti-aliased oscillators (15 Hz–20 kHz); off is the raw, aliased 90s sound        | 🟡 always HQ: native oscillators are band-limited | Off would need naive waveforms in an `AudioWorklet`                       | `hq` (default `true`) | ⏳ M8 for off |

## Channel: envelopes

FL has envelopes for volume, Mod X (cutoff by default), Mod Y (resonance) and pitch, each switched on by its LED. Pan has no envelope.

| FL parameter                                 | In FL                                   | Vinskiano                                                          | How (Web Audio)                                                                          | Preset field                                                                                           |       |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----- |
| Delay, attack, hold, decay, sustain, release | Stage times, sustain level              | 🟡 a fixed 2 ms fade-in and 6 ms fade-out per note, against clicks | `AudioParam` automation on each note's own `GainNode`                                    | `envelopes.{volume,modX,modY,pitch}.{delay,attack,hold,decay,sustain,release}` (seconds; sustain 0..1) | ⏳ M3 |
| Attack, decay and release tension            | Curve of each stage, convex to concave  | —                                                                  | `setValueCurveAtTime` with a curve computed from the tension                             | `…attackTension`, `decayTension`, `releaseTension` (−1..1)                                             | ⏳ M3 |
| Amount                                       | Bipolar; centre means off, left inverts | —                                                                  | Scales the envelope before it reaches the parameter                                      | `….amount` (−1..1)                                                                                     | ⏳ M3 |
| On/off                                       | LED per envelope                        | —                                                                  | Not built at all when off                                                                | `….enabled`                                                                                            | ⏳ M3 |
| Tempo                                        | Stage times in beats                    | —                                                                  | Times converted from `tempo`                                                             | `….tempoSync`                                                                                          | ⏳ M7 |
| Pitch envelope                               | Bends the note                          | —                                                                  | Automation on the oscillators' `detune`                                                  | `envelopes.pitch` (amount in semitones at 1)                                                           | ⏳ M3 |
| Cutoff envelope                              | Through Mod X                           | —                                                                  | Automation on `BiquadFilterNode.detune`, in cents, so sweeps sound even across the range | `envelopes.modX`                                                                                       | ⏳ M4 |

## Channel: LFOs

FL has an LFO each for volume, pan, Mod X, Mod Y and pitch.

| FL parameter  | In FL                                                     | Vinskiano | How (Web Audio)                                              | Preset field                              |       |
| ------------- | --------------------------------------------------------- | --------- | ------------------------------------------------------------ | ----------------------------------------- | ----- |
| Shape         | Sine, triangle, square                                    | —         | `OscillatorNode` → `GainNode` (amount) → target `AudioParam` | `lfos.{volume,pan,modX,modY,pitch}.shape` | ⏳ M5 |
| Delay, attack | Wait, then fade in                                        | —         | Automation on the amount's gain                              | `….delay`, `….attack` (seconds)           | ⏳ M5 |
| Speed         | Rate                                                      | —         | `frequency`                                                  | `….speed` (Hz)                            | ⏳ M5 |
| Amount        | Bipolar; centre is off, left flips the phase              | —         | Amount gain (negative flips)                                 | `….amount` (−1..1)                        | ⏳ M5 |
| Tempo         | Delay, attack, speed in beats                             | —         | Converted from `tempo`                                       | `….tempoSync`                             | ⏳ M7 |
| Global        | Free-running across notes; off restarts it with each note | —         | One shared LFO, or one per note                              | `….global`                                | ⏳ M5 |

## Channel: filter

| FL parameter      | In FL                                           | Vinskiano | How (Web Audio)                                                                                                                                       | Preset field              |       |
| ----------------- | ----------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----- |
| Type              | Fast LP, LP, BP, HP, BS, LPx2, SVF LP, SVF LPx2 | —         | `BiquadFilterNode` (`lowpass`, `bandpass`, `highpass`, `notch`); x2 is two in series. 🟡 SVF types use biquads too, so they won't have FL's character | `filter.type`             | ⏳ M4 |
| Cutoff (Mod X)    | Default 100% with Fast LP: the filter is off    | —         | `frequency`, with modulation on `detune`                                                                                                              | `filter.cutoff` (Hz)      | ⏳ M4 |
| Resonance (Mod Y) | Peak at the cutoff                              | —         | `Q`                                                                                                                                                   | `filter.resonance` (0..1) | ⏳ M4 |

## Channel: voices and portamento

| FL parameter  | In FL                                       | Vinskiano                              | How (Web Audio)                               | Preset field                    |       |
| ------------- | ------------------------------------------- | -------------------------------------- | --------------------------------------------- | ------------------------------- | ----- |
| Max polyphony | Excess notes are cut                        | 🟡 unlimited (one voice per held note) | Voice stealing, oldest first                  | `voice.maxPoly` (0 = unlimited) | ⏳ M6 |
| Mono          | One note at a time; overlapping notes slide | —                                      | One voice, retuned                            | `voice.mono`                    | ⏳ M6 |
| Porta         | Glide between notes, cutoff and pan too     | —                                      | `setTargetAtTime` on `frequency` (and filter) | `voice.porta`                   | ⏳ M6 |
| Slide         | Glide time                                  | —                                      | Time constant from the slide time             | `voice.slide` (seconds)         | ⏳ M6 |
| Full porta    | Plays whole notes, ignoring gate            | —                                      | Belongs with the arpeggiator's gate           | `voice.fullPorta`               | ⏳ M7 |

## Channel: trackers

| FL parameter     | In FL                                                                    | Vinskiano           | How (Web Audio)                                                                                           | Preset field                                            |       |
| ---------------- | ------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----- |
| Velocity tracker | Velocity → pan, cutoff, Mod X, Mod Y; bipolar amounts and a Mid velocity | — (no velocity yet) | Offsets applied when a note starts                                                                        | `tracking.velocity.{mid,pan,modX,modY}`                 | ⏳ M6 |
| Keyboard tracker | Note → the same targets, around a Mid note                               | —                   | Same                                                                                                      | `tracking.key.{mid,pan,modX,modY}` (mid as a MIDI note) | ⏳ M4 |
| Note velocity    | From MIDI or the piano roll                                              | —                   | Web MIDI (feature-detected; Safari has none), and a fixed velocity for mouse, touch and computer keyboard | not a preset field                                      | ⏳ M6 |

## Channel: arpeggiator

| FL parameter  | In FL                                                       | Vinskiano | How (Web Audio)                                     | Preset field                          |       |
| ------------- | ----------------------------------------------------------- | --------- | --------------------------------------------------- | ------------------------------------- | ----- |
| Direction     | Off, up, down, up-down, up-down with the ends twice, random | —         | A lookahead scheduler on `AudioContext.currentTime` | `arp.direction`                       | ⏳ M7 |
| Time, gate    | Step length, note length                                    | —         | Same scheduler                                      | `arp.time` (beats), `arp.gate` (0..1) | ⏳ M7 |
| Slide         | Glide between notes                                         | —         | Portamento per step                                 | `arp.slide`                           | ⏳ M7 |
| Range, repeat | Octaves spanned; repeats before moving up                   | —         | —                                                   | `arp.range`, `arp.repeat`             | ⏳ M7 |
| Chord         | None, auto, auto (sustain), chord templates                 | —         | Templates as interval lists                         | `arp.chord`                           | ⏳ M7 |
| Tempo         | FL's project tempo                                          | —         | A tempo of the patch                                | `tempo` (BPM)                         | ⏳ M7 |

## Channel: levels and playing

| FL parameter    | In FL                           | Vinskiano                       | How (Web Audio)                      | Preset field       |       |
| --------------- | ------------------------------- | ------------------------------- | ------------------------------------ | ------------------ | ----- |
| Channel volume  | 0..100% (Misc VOL up to 200%)   | ✅ master volume knob           | Master `GainNode` before the limiter | `master.gain`      | ✅    |
| Channel pan     | Pan knob                        | —                               | `StereoPannerNode` on the master     | `master.pan`       | ⏳ M2 |
| Typing keyboard | FL's layout (Z S X… and Q 2 W…) | ✅ same layout, by key position | —                                    | not a preset field | ✅    |
| Keyboard range  | 128 notes                       | ✅ 88 keys, A0–C8               | —                                    | —                  | ✅    |

## Out of scope

| FL feature                                                            | Why not                                                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Echo delay (Misc tab)                                                 | FL makes each echo a new note. If we want echoes, a real delay effect is the better tool, and that's a separate decision |
| Time-stretching, sample start and loop points, declicking modes       | Sampler features for recorded audio, not for oscillators                                                                 |
| Sampler's precomputed effects (boost, EQ, ring mod, reverb, reverse…) | They rewrite a sample offline; 3x Osc patches don't depend on them                                                       |
| Gate, shift, swing, cut groups                                        | Step sequencer and channel rack features; Vinskiano has no sequencer                                                     |
| Opening FL `.fst`/`.flp` files                                        | Proprietary binary formats. Patches come over as recipes, which is what parity is for                                    |
| Envelope and LFO presets menus                                        | Covered by whole-sound presets                                                                                           |

## Unknowns to measure in FL

The manual leaves these out, so they need measuring in FL Studio before the knobs that set them get their final ranges:

- Stereo detune: range in cents at the knob's ends.
- Phase rand: how much randomness at 100%.
- Envelope stage times: the longest attack, decay and release, and the knob curve between.
- Tension: the shape of the curve at each end.
- LFO speed: range in Hz and the knob curve.
- Filter: cutoff in Hz at each Mod X percentage, resonance as Q, and how LPx2 and the SVF types sound against a biquad.
- Mix and volume: whether FL's levels are linear in amplitude, as ours are.

How: render short notes in FL with one parameter changed at a time (one oscillator, filter off, envelopes off unless measured), and export WAVs. A Playwright test renders the same patch with an `OfflineAudioContext` and compares length, level and spectrum.

Presets keep physical units (seconds, Hz, cents), so what we learn here changes how a knob maps to a value, never a saved preset.
