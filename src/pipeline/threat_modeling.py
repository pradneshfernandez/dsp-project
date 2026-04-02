from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from src.utils.llm_client import get_llm

class Threat(BaseModel):
    threat_id: str = Field(description="Unique ID for the threat (e.g., T-01)")
    asset_id: str = Field(description="The asset_id this threat applies to")
    description: str = Field(description="Detailed narrative of the attack methodology")
    stride_category: str = Field(description="Spoofing, Tampering, Repudiation, Info Disclosure, DoS, or EoP")
    evita_severity: str = Field(description="EVITA Severity context rating: Low, Medium, High, or Critical")
    capec_id: str = Field(description="Most relevant CAPEC or CWE ID")
    chain_of_thought_reasoning: str = Field(description="Step-by-step reasoning explaining the vulnerability and EVITA severity classification")

class ThreatModel(BaseModel):
    threats: List[Threat]

def generate_threats(asset_registry_json: str) -> ThreatModel:
    llm = get_llm(temperature=0.3)
    parser = PydanticOutputParser(pydantic_object=ThreatModel)
    
    prompt_path = os.path.join(os.path.dirname(__file__), "../../prompts/threat_modeling.txt")
    with open(prompt_path, "r") as f:
        template_str = f.read()

    prompt = PromptTemplate(
        template=template_str,
        input_variables=["asset_registry"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | llm | parser
    return chain.invoke({"asset_registry": asset_registry_json})
