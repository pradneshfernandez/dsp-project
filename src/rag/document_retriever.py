import os
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

def initialize_rag_db(data_directory: str = "./data/standards", db_directory: str = "./data/chroma_db"):
    """
    Initializes a local ChromaDB instance indexing PDF or text standards 
    (e.g., ISO 21434, UNECE WP.29, NIST, CVE lists).
    """
    api_key = os.getenv("OPENAI_API_KEY")
    embeddings = OpenAIEmbeddings(openai_api_key=api_key)
    
    # Create dir if not exists
    os.makedirs(data_directory, exist_ok=True)
    os.makedirs(db_directory, exist_ok=True)
    
    # Check if DB is already heavily populated
    if len(os.listdir(db_directory)) > 2:
        return Chroma(persist_directory=db_directory, embedding_function=embeddings)
        
    print(f"Initializing RAG Database from {data_directory}...")
    loader = DirectoryLoader(data_directory, glob="**/*.txt") # Expandable to PDF/Markdown
    docs = loader.load()
    
    if not docs:
        print("Warning: No documents found to index for RAG grounding. Add standard texts to data/standards.")
        return Chroma(persist_directory=db_directory, embedding_function=embeddings)

    db = Chroma.from_documents(docs, embeddings, persist_directory=db_directory)
    db.persist()
    return db

def retrieve_context(query: str, db: Chroma, k: int = 3) -> str:
    """Retrieves standard/compliance context for LLM grounding."""
    docs = db.similarity_search(query, k=k)
    return "\n\n".join([d.page_content for d in docs])
