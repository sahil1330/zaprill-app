export interface RealtimeCall {
  stop: () => void;
  send: (event: unknown) => void;
}

export async function connectRealtimeWebRTC(input: {
  clientSecret: string;
  onEvent: (event: unknown) => void;
}): Promise<RealtimeCall> {
  const pc = new RTCPeerConnection();
  const audio = document.createElement("audio");
  audio.autoplay = true;
  pc.ontrack = (event) => {
    audio.srcObject = event.streams[0] ?? null;
  };
  const media = await navigator.mediaDevices.getUserMedia({ audio: true });
  const [track] = media.getTracks();
  if (!track) throw new Error("Microphone unavailable");
  pc.addTrack(track, media);
  const channel = pc.createDataChannel("oai-events");
  channel.addEventListener("message", (message) => {
    try {
      input.onEvent(JSON.parse(String(message.data)));
    } catch {
      input.onEvent(null);
    }
  });
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const response = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${input.clientSecret}`,
      "Content-Type": "application/sdp",
    },
  });
  if (!response.ok) {
    track.stop();
    pc.close();
    throw new Error(`Realtime connect failed (${response.status}).`);
  }
  await pc.setRemoteDescription({
    type: "answer",
    sdp: await response.text(),
  });
  return {
    send: (event) => {
      if (channel.readyState === "open") channel.send(JSON.stringify(event));
    },
    stop: () => {
      track.stop();
      channel.close();
      pc.close();
      audio.srcObject = null;
    },
  };
}
