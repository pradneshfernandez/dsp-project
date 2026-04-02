from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from src.utils.llm_client import get_llm

class Asset(BaseModel):
    asset_id: str = Field(description="Unique identifier for the asset (e.g., ECU-01, BUS-A)")
    name: str = Field(description="Name of the component, ECU, bus, or data object")
    type: str = Field(description="Type of asset: 'ECU', 'Communication Bus', 'Interface', or 'Data Object'")
    description: str = Field(description="Brief description of the asset's function")
    connected_to: List[str] = Field(description="List of asset_ids this asset connects to or interacts with")

class AssetRegistry(BaseModel):
    assets: List[Asset]

def extract_assets(system_description: str) -> AssetRegistry:
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=AssetRegistry)
    
    prompt_path = os.path.join(os.path.dirname(__file__), "../../prompts/asset_extraction.txt")
    with open(prompt_path, "r") as f:
        template_str = f.read()

    prompt = PromptTemplate(
        template=template_str,
        input_variables=["system_description"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | llm | parser
    return chain.invoke({"system_description": system_description})
