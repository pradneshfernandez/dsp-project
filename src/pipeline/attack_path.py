from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from src.utils.llm_client import get_llm

class AttackStep(BaseModel):
    step_number: int
    description: str = Field(description="Action the attacker takes")
    prerequisites: List[str] = Field(description="Required conditions or tools")

class AttackPath(BaseModel):
    threat_id: str
    attacker_profile: str = Field(description="Insider, Remote Adversary, or Supply Chain")
    attack_tree: List[AttackStep]
    cvss_attack_vector: str = Field(description="Network, Adjacent, Local, or Physical")
    cvss_complexity: str = Field(description="Low or High")
    cvss_privileges: str = Field(description="None, Low, or High")
    cvss_user_interaction: str = Field(description="None or Required")
    feasibility_rating: str = Field(description="Overall feasibility classification based on CVSS factors")
    chain_of_thought_feasibility: str = Field(description="Reasoning to derive the feasibility_rating")

class AttackPathModel(BaseModel):
    paths: List[AttackPath]

def generate_attack_paths(threat_model_json: str) -> AttackPathModel:
    llm = get_llm(temperature=0.3)
    parser = PydanticOutputParser(pydantic_object=AttackPathModel)
    
    prompt_path = os.path.join(os.path.dirname(__file__), "../../prompts/attack_path.txt")
    with open(prompt_path, "r") as f:
        template_str = f.read()

    prompt = PromptTemplate(
        template=template_str,
        input_variables=["threat_model"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | llm | parser
    return chain.invoke({"threat_model": threat_model_json})
