import io
import os
from google.cloud import videointelligence

def transcribe_video(video_path: str):
    """
    Analyzes a local video file using the Google Cloud Video Intelligence API
    for speech transcription.
    """
    print("1. Starting video transcription with Google Cloud Video Intelligence API...")
    try:
        # The client will automatically use the credentials set in the environment.
        video_client = videointelligence.VideoIntelligenceServiceClient()
        
        # Configure the transcription request
        features = [videointelligence.Feature.SPEECH_TRANSCRIPTION]
        config = videointelligence.SpeechTranscriptionConfig(
            language_code="en-US",            # Change if your video is in another language
            enable_automatic_punctuation=True # Adds punctuation to the transcript
        )
        video_context = videointelligence.VideoContext(speech_transcription_config=config)

        # Read the local video file into memory
        with io.open(video_path, "rb") as file:
            input_content = file.read()

        # Make the API request
        operation = video_client.annotate_video(
            request={
                "features": features,
                "input_content": input_content,
                "video_context": video_context,
            }
        )
        
        print("   Processing video for transcription... (This may take a few minutes)")
        result = operation.result(timeout=600)
        print("   Transcription finished.")
        
        # The first result corresponds to the first video in the request
        return result.annotation_results[0].speech_transcriptions

    except Exception as e:
        print(f"An error occurred during API analysis: {e}")
        print("   Please ensure your key file is valid and the Video Intelligence API is enabled.")
        return None

def save_transcription_to_file(output_path: str, transcriptions):
    """
    Processes the transcription results and saves them to a text file.
    """
    print(f"\n2. Saving transcription to '{output_path}'...")
    with open(output_path, 'w') as f:
        # Each 'speech_transcription' object contains one or more 'alternatives'.
        # We'll use the first alternative, which has the highest confidence.
        for speech_transcription in transcriptions:
            if not speech_transcription.alternatives:
                continue

            # Get the most likely transcript
            alternative = speech_transcription.alternatives[0]
            
            f.write("--- FULL TRANSCRIPT ---\n")
            f.write(f"{alternative.transcript}\n\n")
            f.write(f"Confidence: {alternative.confidence:.2%}\n")
            f.write("\n--- WORD TIMESTAMPS ---\n")

            # Print each word with its start and end time
            for word_info in alternative.words:
                start_time = word_info.start_time.total_seconds()
                end_time = word_info.end_time.total_seconds()
                word = word_info.word
                f.write(f"[{start_time:7.3f}s - {end_time:7.3f}s] {word}\n")
                
    print(f"\n✅ Success! Transcription saved to '{output_path}'.")


if __name__ == "__main__":
    # --- CONFIGURATION ---
    # 1. Set the path to your video file
    local_video_path = "transcribe.mp4"

    # 2. Set the name of your downloaded Google Cloud key file
    key_filename = "clean-pilot-443311-a8-c12b9ae2ba1f.json"
    
    # 3. Define the output filename for the transcript
    output_transcript_path = "output_transcription.txt"
    # --- END CONFIGURATION ---

    # --- SETUP AND EXECUTION ---
    # Check if the required files exist before starting
    if not os.path.exists(key_filename):
        print(f"FATAL ERROR: Authentication key file not found at '{key_filename}'")
        print("Please ensure the key file is in the same directory as this script.")
    elif not os.path.exists(local_video_path):
        print(f"FATAL ERROR: Video file not found at '{local_video_path}'")
        print("Please ensure the video file is in the same directory as this script.")
    else:
        # Set environment variable for Google Cloud client libraries to find the key
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_filename
        
        # 1. Get transcriptions from the API
        transcriptions = transcribe_video(local_video_path)
        
        # 2. If analysis was successful, save the results to a file
        if transcriptions:
            save_transcription_to_file(output_transcript_path, transcriptions)