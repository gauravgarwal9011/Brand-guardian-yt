"""
Main Execution Entry Point for Brand Guardian AI.

This file is the "control center" that starts and manages the entire 
compliance audit workflow. Think of it as the master switch that:
1. Sets up the audit request
2. Runs the AI workflow
3. Displays the final compliance report
"""

# Standard library imports for basic Python functionality
import uuid      # Generates unique IDs (like session tracking numbers)
import json      # Handles JSON data formatting (converts Python dicts to readable text)
import logging   # Records what happens during execution (like a flight recorder)
from pprint import pprint  # Pretty-prints data structures (unused here, but available)


# Load environment variables from .env file
# This reads API keys, database credentials, etc. without hardcoding them
from dotenv import load_dotenv
load_dotenv(override=True)  # override=True means .env values take priority over system variables

# Import the main workflow graph (the "brain" of your compliance system)
from backend.src.graph.workflow import app

# Configure logging - sets up the "flight recorder" for your application
logging.basicConfig(
    level=logging.INFO,        # INFO = show important events (DEBUG would show everything)
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'  
    # Format: timestamp - logger_name - severity - message
    # Example: "2024-01-15 10:30:45 - brand-guardian - INFO - Starting audit"
)
logger = logging.getLogger("brand-guardian-runner")  # Creates a named logger for this module

def run_cli_simulation():
    """
    Simulates a Video Compliance Audit request.
    
    This function orchestrates the entire audit process:
    - Creates a unique session ID
    - Prepared the video URL and metadata
    - Runs it through the AI workflow
    - Displays the compliance results
    """

    # Step 1: Generate a unique session ID for tracking this audit
    session_id = str(uuid.uuid4())
    logger.info(f"Starting compliance audit with session ID: {session_id}")

    # Step 2: Define Initial State

    Initial_inputs = {
        "video_url": "https://youtu.be/dT7S75eYhcQ",

        "video_id": f"vid_{session_id[:8]}",

        "compliance_results": [],

        "errors": []
    }

    print("\n--- 1. input payload: Initializing workflow ---")

    print(f"I {json.dumps(Initial_inputs, indent=2)}")


    try:
        final_state = app.invoke(Initial_inputs)

        # ========== DISPLAY SECTION: EXECUTION COMPLETE ==========
        print("\n--- 2. WORKFLOW EXECUTION COMPLETE ---")
        
        # ========== STEP 4: OUTPUT RESULTS ==========
        # Display a formatted compliance report
        
        print("\n=== COMPLIANCE AUDIT REPORT ===")

        print(f"Video ID: {final_state.get('video_id')}")

        print(f"Status: {final_state.get('final_status')}")

        print("\n[ VIOLATIONS DETECTED ]")

        results = final_state.get("compliance_results", [])

        if results:
            for issue in results:
                print(f"- [{issue.get('severity')}] {issue.get('category')}: {issue.get('description')}")

        else:
            print("No violations found.")

        print("\n[ FINAL SUMMARY ]")

        print(final_state.get('final_report'))

    except Exception as e:
        logger.error(f"Workflow Execution Failed: {str(e)}")
        
        # Re-raise the exception so we see the full error traceback
        # This helps with debugging (shows exactly where/why it failed)
        raise e
    
if __name__ == "__main__":
    run_cli_simulation()  # Start the compliance audit simulation



'''
You have moved from "Coding" to "Product."

Ingestion:  (YouTube -> Azure)

Indexing:  (Speech-to-Text + OCR)

Retrieval:  (Found the rules about "Claims")

Reasoning:  (Applied rules to the specific claims in the video)

You are done. Your pipeline is fully operational.
'''