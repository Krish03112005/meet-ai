import os
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

BASEMODEL_PATH = r"D:\meet-ai\llm-fastapi-backend\Llama-3.2-1B-Instruct"
ADAPTER_ROOT = r"D:\meet-ai\llm-fastapi-backend\adapters"
device = "cpu"

# Limit CPU threads to reduce overuse
torch.set_num_threads(4)

# Load tokenizer and base model with low memory footprint
tokenizer = AutoTokenizer.from_pretrained(BASEMODEL_PATH)
base_model = AutoModelForCausalLM.from_pretrained(
    BASEMODEL_PATH,
    low_cpu_mem_usage=True,
    torch_dtype=torch.float32
).to(device)

# Apply dynamic quantization to reduce CPU load
base_model = torch.quantization.quantize_dynamic(
    base_model, {torch.nn.Linear}, dtype=torch.qint8
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_persona = None
persona_model = base_model

def load_persona_adapter(persona_name):
    adapter_dir = os.path.join(ADAPTER_ROOT, persona_name)
    print(f"Loading adapter: {adapter_dir}")
    
    # Load adapter into unquantized FP32 model
    model_with_adapter = PeftModel.from_pretrained(base_model, adapter_dir)
    model_with_adapter = model_with_adapter.merge_and_unload()
    
    # Quantize AFTER merging
    model_with_adapter = torch.quantization.quantize_dynamic(
        model_with_adapter, {torch.nn.Linear}, dtype=torch.qint8
    )
    
    model_with_adapter = model_with_adapter.to(torch.device("cpu"))
    return model_with_adapter



class ChatRequest(BaseModel):
    persona: str
    message: str
    max_new_tokens: int = 32
    temperature: float = 0.2
    top_p: float = 0.9

class ChatResponse(BaseModel):
    response: str

@app.get("/adapters")
def list_adapters():
    adapters = [
        folder for folder in os.listdir(ADAPTER_ROOT)
        if os.path.isdir(os.path.join(ADAPTER_ROOT, folder))
    ]
    return {"adapters": adapters}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    global current_persona, persona_model
    if req.persona != current_persona:
        persona_model = load_persona_adapter(req.persona)
        current_persona = req.persona

    input_ids = tokenizer(req.message, return_tensors="pt").input_ids.to(device)

    # Use inference_mode for minimal overhead
    with torch.inference_mode():
        output_ids = persona_model.generate(
            input_ids,
            max_new_tokens=req.max_new_tokens,
            temperature=req.temperature,
            top_p=req.top_p,
            do_sample=True,
            num_beams=1,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id
        )

    response = tokenizer.decode(output_ids[0][input_ids.shape[-1]:], skip_special_tokens=True)
    return ChatResponse(response=response.strip())

@app.get("/")
def root():
    return {"message": "LLM Backend running with persona adapters (optimized CPU mode)"}
