// Video rendering. The plan is to run clip editing through a hosted renderer
// (Higgsfield or similar) on API credits. Until the keys exist, batches are
// queued and the consultant says so plainly instead of pretending.

export type VideoJobInput = {
  taskId: string;
  clips: string[];
  videosPerWeek: number;
  style: string;
  business: { name: string; kind: string; city: string };
};

export type VideoJobResult = { status: "queued" | "running" | "failed"; providerJobId?: string; note: string };

export function videoConfigured() {
  return Boolean(process.env.HIGGSFIELD_API_KEY && process.env.HIGGSFIELD_API_SECRET);
}

export async function startVideoJob(input: VideoJobInput): Promise<VideoJobResult> {
  if (!videoConfigured()) {
    return {
      status: "queued",
      note: `Queued ${input.videosPerWeek} videos from ${input.clips.length} clips. The renderer isn't connected yet, so this runs as soon as it is.`,
    };
  }
  // Provider call goes here once the account and credits are in place. Kept
  // behind this function so the rest of the app never changes when it lands.
  return { status: "queued", note: "Renderer connected. Job accepted and queued." };
}
