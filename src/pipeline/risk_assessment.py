from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from src.utils.llm_client import get_llm

class RiskEvaluation(BaseModel):
    threat_id: str
    impact_safety: int = Field(description="Score 1-4 based on ISO 21434")
    impact_financial: int = Field(description="Score 1-4")
    impact_operational: int = Field(description="Score 1-4")
    impact_privacy: int = Field(description="Score 1-4 based on LINDDUN/GDPR parameters")
    max_impact: int
    overall_likelihood: int = Field(description="Mapped likelihood score (1-4) derived from the Attack Path Feasibility")
    initial_risk_score: int = Field(description="max_impact multiplied by overall_likelihood")
    initial_risk_level: str = Field(description="Low, Medium, High, or Critical")
    privacy_compliance_flags: List[str] = Field(description="Relevant GDPR or DPIA triggers if privacy impact is high")
    chain_of_thought_risk: str = Field(description="Explicit reasoning for impact scores and safety-critical escalations")

class RiskModel(BaseModel):
    evaluations: List[RiskEvaluation]

def evaluate_risks(attack_paths_json: str) -> RiskModel:
    llm = get_llm(temperature=0.1)
    parser = PydanticOutputParser(pydantic_object=RiskModel)
    
    prompt_path = os.path.join(os.path.dirname(__file__), "../../prompts/risk_assessment.txt")
    with open(prompt_path, "r") as f:
        template_str = f.read()

    prompt = PromptTemplate(
        template=template_str,
        input_variables=["attack_paths"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | llm | parser
    return chain.invoke({"attack_paths": attack_paths_json})
