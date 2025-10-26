import os
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM

# -----------------------------
# CONFIGURATION
# -----------------------------
BASEMODEL_PATH = r"D:\meet-ai\llm-fastapi-backend\Llama-3.2-1B-Instruct"
device = "cpu"

# Limit CPU threads (for stability on CPU inference)
torch.set_num_threads(4)

# -----------------------------
# LOAD MODEL + TOKENIZER
# -----------------------------
tokenizer = AutoTokenizer.from_pretrained(BASEMODEL_PATH)
base_model = AutoModelForCausalLM.from_pretrained(
    BASEMODEL_PATH,
    low_cpu_mem_usage=True,
    torch_dtype=torch.float32
).to(device)

# Dynamic quantization for lower CPU usage
base_model = torch.quantization.quantize_dynamic(
    base_model, {torch.nn.Linear}, dtype=torch.qint8
)

# -----------------------------
# FASTAPI SERVER SETUP
# -----------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# REQUEST / RESPONSE MODELS
# -----------------------------
class ChatRequest(BaseModel):
    persona: str          # Example: "lawyer" or "doctor"
    message: str
    max_new_tokens: int = 64
    temperature: float = 0.3
    top_p: float = 0.9


class ChatResponse(BaseModel):
    response: str


# -----------------------------
# CHAT ENDPOINT
# -----------------------------
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):

    # Build System Prompt (persona-based)
    system_prompt = (
        f"You are AVA! helpful and expert AI assistant acting as a {req.persona}. "
        f"Stay in character and give accurate, concise, and relevant answers."
        f" Use professional language appropriate for a {req.persona}.Be a little humorous. Explain every term if the user doesnt understand"
    )

    # Combine messages following the Llama 3.1/3.2 prompt format
    prompt = (
        "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n"
        f"{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n"
        f"{req.message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n"
    )

    # Tokenize input
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(device)

    # Generate response
    with torch.inference_mode():
        output_ids = base_model.generate(
            input_ids,
            max_new_tokens=req.max_new_tokens,
            temperature=req.temperature,
            top_p=req.top_p,
            do_sample=True,
            num_beams=1,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id
        )

    # Decode assistant’s reply
    response_text = tokenizer.decode(
        output_ids[0][input_ids.shape[-1]:], skip_special_tokens=True
    ).strip()

    return ChatResponse(response=response_text)


# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/")
def root():
    return {"message": "Llama‑3 Instruct backend running with persona system prompts (optimized CPU mode)"}
