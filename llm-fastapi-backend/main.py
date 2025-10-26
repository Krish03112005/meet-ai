import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM

BASEMODEL_PATH = r"D:\meet-ai\llm-fastapi-backend\Llama-3.2-1B-Instruct"
device = "cpu"
torch.set_num_threads(4)

tokenizer = AutoTokenizer.from_pretrained(BASEMODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    BASEMODEL_PATH, low_cpu_mem_usage=True, torch_dtype=torch.float32
).to(device)
model = torch.quantization.quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    agentname: str
    persona: str
    message: str
    max_new_tokens: int = 64
    temperature: float = 0.3
    top_p: float = 0.9

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    prompt = (
        f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n"
        f"You are {req.agentname}, a helpful and expert AI acting as a {req.persona}. "
        "Stay in character, give accurate, concise, and relevant answers. "
        f"Use professional language for a {req.persona}. Be a little humorous. Explain terms if user doesn't understand."
        "<|eot_id|><|start_header_id|>user<|end_header_id|>\n"
        f"{req.message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n"
    )
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(device)
    with torch.inference_mode():
        output_ids = model.generate(
            input_ids,
            max_new_tokens=req.max_new_tokens,
            temperature=req.temperature,
            top_p=req.top_p,
            do_sample=True,
            num_beams=1,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id
        )
    response_text = tokenizer.decode(
        output_ids[0][input_ids.shape[-1]:], skip_special_tokens=True
    ).strip()
    return ChatResponse(response=response_text)

@app.get("/")
def root():
    return {"message": "Llama‑3 Instruct backend with quantization (CPU)"}
