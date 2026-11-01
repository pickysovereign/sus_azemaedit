import type { ScenarioId, Setup } from "./schemas";

/** Illustrated character; each has a face per mood in public/avatars/<id>/. */
export type AvatarId = "dana" | "sam" | "female" | "male";

/** Client-safe scenario metadata. Agent config (voice, LLM, prompt) lives in prompts/npc/*.md. */
export interface ScenarioPreset {
  id: ScenarioId;
  label: string;
  character: string;
  title: string;
  blurb: string;
  defaultGoal: string;
  /** Portrait set in public/avatars/, plus the tile tint behind it. */
  avatar: AvatarId;
  accent: string;
}

export const PRESETS: ScenarioPreset[] = [
  {
    id: "recruiter",
    label: "Recruiter screen",
    character: "Dana",
    title: "Senior technical recruiter",
    blurb: "A brisk phone screen. Dana has read a thousand padded résumés.",
    defaultGoal: "Get Dana to move you forward to the hiring-manager round.",
    avatar: "dana",
    accent: "#7c5cff",
  },
  {
    id: "networking",
    label: "Networking mixer",
    character: "Priya",
    title: "Founder at a startup mixer",
    blurb: "Fast talker, sizing you up as a hire, partner or intro.",
    defaultGoal: "Get Priya to offer an intro to her investor.",
    avatar: "female",
    accent: "#19c39c",
  },
];

/** Group scenes: one ElevenLabs agent voices several characters (multi-voice). */
export const PARTY_PRESET: ScenarioPreset = {
  id: "party",
  label: "Startup interview",
  character: "Maya, Theo & Jordan",
  title: "Interview panel at Lumen",
  blurb: "A CTO, a CEO and a design lead interview you at once. Three people, one cover story.",
  defaultGoal: "Get an offer to join Lumen.",
  avatar: "female",
  accent: "#f59f00",
};

export const GROUP_PRESET: ScenarioPreset = {
  id: "group",
  label: "Custom group",
  character: "Your group",
  title: "2-3 characters you write",
  blurb: "Build your own group of up to three characters.",
  defaultGoal: "Convince the whole group you are who you say you are.",
  avatar: "male",
  accent: "#4dabf7",
};

/** One person on stage. `label` is their multi-voice tag (empty for 1-on-1 scenes). */
export interface CastMember {
  name: string;
  title: string;
  label: string;
  /** What this character knows well enough to spot a faker (group scenes). */
  expertise: string;
  avatar: AvatarId;
  accent: string;
}

export const PARTY_CAST: CastMember[] = [
  { name: "Maya", title: "CTO", label: "Maya", expertise: "software engineering, system design, infrastructure, engineering teams and hiring", avatar: "female", accent: "#f59f00" },
  { name: "Theo", title: "CEO & co-founder", label: "Theo", expertise: "business impact, revenue and growth metrics, fundraising, company culture, go-to-market", avatar: "male", accent: "#7c5cff" },
  { name: "Jordan", title: "Head of design", label: "Jordan", expertise: "product and visual design, UX research, design systems, design tools, design-engineering handoff", avatar: "sam", accent: "#e64980" },
];

/** Tile tints for group-scene characters, in stage order. */
const GROUP_ACCENTS = ["#4dabf7", "#ff8a3d", "#19c39c"];

export const isGroupScenario = (id: ScenarioId) => id === "party" || id === "group";

export const CUSTOM_PRESET: ScenarioPreset = {
  id: "custom",
  label: "Custom character",
  character: "Custom",
  title: "Your own character",
  blurb: "Write your own character and goal.",
  defaultGoal: "Convince them you are who you say you are.",
  avatar: "female",
  accent: "#e64980",
};

/**
 * Premade ElevenLabs voices offered for custom characters. IDs are ElevenLabs default voices;
 * check they are in your account's voice library.
 */
export const VOICES: { id: string; label: string; avatar: AvatarId }[] = [
  { id: "JBFqnCBsd6RMkjVDRZzb", label: "George (warm, British)", avatar: "male" },
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel (calm, American)", avatar: "female" },
  { id: "TxGEqnHWrfWFTfGW9XjX", label: "Josh (young, American)", avatar: "male" },
  { id: "XB0fDUnXU5powFXDhCwa", label: "Charlotte (bright, Swedish-English)", avatar: "female" },
  { id: "IKne3meq5aSn9XLyUdCD", label: "Charlie (casual, Australian)", avatar: "male" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Sarah (soft, American)", avatar: "female" },
];

/** Portrait for a custom character: matches their voice. */
export function voiceAvatar(voiceId: string, fallback: AvatarId): AvatarId {
  return VOICES.find((v) => v.id === voiceId)?.avatar ?? fallback;
}

/** Multi-voice tag for a premade voice: its first word, e.g. "George". */
export function voiceLabel(voiceId: string): string {
  return (VOICES.find((v) => v.id === voiceId)?.label ?? "Voice").split(" ")[0];
}

export function presetFor(id: ScenarioId): ScenarioPreset {
  if (id === "party") return PARTY_PRESET;
  if (id === "group") return GROUP_PRESET;
  return PRESETS.find((p) => p.id === id) ?? CUSTOM_PRESET;
}

/** Everyone the player is talking to, in stage order. */
export function castFor(setup: Pick<Setup, "scenarioId" | "custom" | "group">): CastMember[] {
  if (setup.scenarioId === "party") return PARTY_CAST;
  if (setup.scenarioId === "group" && setup.group) {
    return setup.group.characters.map((c, i) => ({
      name: c.name,
      title: c.personality.split(/[.,]/)[0].slice(0, 40),
      label: voiceLabel(c.voiceId),
      expertise: c.expertise || "nothing in particular (judges mostly on consistency and confidence)",
      avatar: voiceAvatar(c.voiceId, i % 2 ? "male" : "female"),
      accent: GROUP_ACCENTS[i % GROUP_ACCENTS.length],
    }));
  }
  const p = presetFor(setup.scenarioId);
  const custom = setup.scenarioId === "custom" ? setup.custom : undefined;
  const avatar = custom ? voiceAvatar(custom.voiceId, p.avatar) : p.avatar;
  return [
    { name: custom?.name ?? p.character, title: custom ? "Custom character" : p.title, label: "", expertise: "", avatar, accent: p.accent },
  ];
}
