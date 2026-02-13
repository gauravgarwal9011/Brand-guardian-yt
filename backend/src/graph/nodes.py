# nodes.py
import json
import os
import logging
import re
from typing import Dict, Any, List

from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_community.vectorstores import AzureSearch
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage

# Import the State schema
from backend.src.graph.state import VideoAuditState, ComplianceIssue

#Import the Service
from backend.src.services.video_indexer import VideoIndexerService

# Configure Logger
logger = logging.getLogger("brand-guardian")
logging.basicConfig(level=logging.INFO)

# NODE 1: INDEXER
def index_video_node(state: VideoAuditState) -> Dict[str, Any]:
    """
    Downloads YouTube video, uploads to Azure VI, and extract insights.
    """
    video_url = state.get("video_url")
    video_id_input = state.get("video_id", "vid_demo")

    logger.info(f" --- [Node: Indexer] Processing: {video_url} ---")

    local_filename = "temp_audit_video.mp4"

    try:
        vi_service = VideoIndexerService()

        #1. Download
        if "youtube.com" in video_url or "youtu.be" in video_url:
            local_path = vi_service.download_youtube_video(video_url, output_path = local_filename)
        else:
            raise Exception("Please provide a valid YouTube URL for this test.")
        
        #2. Upload
        azure_video_id = vi_service.upload_video(local_path, video_name = video_id_input)
        logger.info(f"Upload Success. Azure ID: {azure_video_id}")

        # 3. Cleanup
        if os.path.exists(local_path):
            os.remove(local_path)

        # 4. Wait
        raw_insights = vi_service.wait_for_processing(azure_video_id)

        # 5. Extract
        clean_data = vi_service.extract_data(raw_insights)

        logger.info("---[Node: Indexer] Extraction Complete")
        return clean_data
    
    except Exception as e:
        logger.error(f"Video Indexer Failed: {e}")
        return{
            "errors": [str(e)],
            "final_status": "FAIL",
            "transcript": "",
            "ocr_text": []
        }