from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from src.utils.llm_client import get_llm

class Mitigation(BaseModel):
    threat_id: str
    control_type: str = Field(description="Prevention, Detection, or Recovery")
    description: str = Field(description="Detailed engineering mitigation")
    nist_csf_category: str = Field(description="e.g., PR.AC, DE.CM")
    iso_21434_clause: str = Field(description="Relevant ISO clause or requirement reference")
    residual_feasibility: int = Field(description="Feasibility score 1-4 AFTER mitigation")
    residual_risk_level: str = Field(description="Low, Medium, High, or Critical")
    chain_of_thought_mitigation: str = Field(description="Reasoning on why this control effectively reduces the attack vector")

class CountermeasureModel(BaseModel):
    mitigations: List[Mitigation]

def propose_mitigations(risk_model_json: str) -> CountermeasureModel:
    llm = get_llm(temperature=0.2)
    parser = PydanticOutputParser(pydantic_object=CountermeasureModel)
    
    prompt_path = os.path.join(os.path.dirname(__file__), "../../prompts/countermeasure.txt")
    with open(prompt_path, "r") as f:
        template_str = f.read()

    prompt = PromptTemplate(
        template=template_str,
        input_variables=["risk_model"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | llm | parser
    return chain.invoke({"risk_model": risk_model_json})
