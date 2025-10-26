from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastrtc import get_stt_model, get_tts_model
from ollama import chat
from pydub import AudioSegment
import numpy as np
import io

stt_model = get_stt_model()
tts_model = get_tts_model()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

@app.post("/voicechat/")
async def voice_chat(
    file: UploadFile = File(...),
    agentname: str = Form(...),
    persona: str = Form(...),
):
    audio_bytes = await file.read()
    audio_io = io.BytesIO(audio_bytes)
    sound = AudioSegment.from_file(audio_io)
    samples = np.array(sound.get_array_of_samples()).astype(np.float32)
    if sound.channels > 1:
        samples = samples.reshape((-1, sound.channels))
        samples = samples.mean(axis=1)
    samples /= np.iinfo(sound.array_type).max
    sr = sound.frame_rate

    transcript = stt_model.stt((sr, samples))

    system_prompt = (
        f"You are {agentname}, a professional {persona}. "
        "Answer as a helpful, concise AI assistant. "
        "Reply clearly, with a friendly but expert tone. Only answer what the user asks, do not repeat your introduction. "
        "Limit your response to about 2-3 sentences. If your output is cut off, end your last sentence cleanly."
    )

    llm_response = chat(
        model="gemma:2b",   # Or your preferred model
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcript}
        ],
        options={"num_predict": 128}
    )
    reply_text = llm_response["message"]["content"]

    def streamer():
        for audio_chunk in tts_model.stream_tts_sync(reply_text):
            yield audio_chunk

    return StreamingResponse(streamer(), media_type="audio/wav")
