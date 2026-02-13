import operator
from typing import Annotated, List, Dict, Optional, Any, TypedDict

# define the schema for a single compliance result

class ComplianceIssue(TypedDict):
    category : str
    description : str # specific detail of violation
    severity : str # CRITICAL | WARNING
    timestamp : Optional[str]

# define the global graph state
class VideoAuditState(TypedDict):
    '''
    Defines the data schema for langgraph execution content.
    This is the "state" that will be passed between nodes in the graph, and can be used to store any relevant information that needs to be shared across nodes.
    '''
    # input parameters
    video_url : str
    video_id : str

    # --- Ingestion & Extraction Data ---
    # Optional because they are populated asynchronously by the Indexer Node.
    local_file_path : Optional[str]
    video_metadata: Dict[str, Any] # e.g., {"duration": 15, "resolution": "1080p"}
    transcript: Optional[str]
    ocr_text: List[str]

    # --- Analysis Output ---
    # annotated with operator.add to allow append-only updates from multiple nodes.
    compliance_results: Annotated[List[ComplianceIssue], operator.add]

    # --- Final Deliverables ---
    final_status: str # "PASS" |"FAIL"
    final_report: str # Markdown summary for the frontend

    # ---System Observability ---
    # Appends system-level errors (e.g., API timeouts) without halting execution logic.
    errors: Annotated[List[str], operator.add]