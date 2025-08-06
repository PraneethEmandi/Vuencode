import io
import os
from collections import defaultdict
from google.cloud import videointelligence
import cv2
import numpy as np

def analyze_video(video_path: str):
    """
    Analyzes a video file using the Google Cloud Video Intelligence API
    for object tracking.
    """
    print("1. Starting video analysis with Google Cloud Video Intelligence API...")
    try:
        video_client = videointelligence.VideoIntelligenceServiceClient()
        features = [videointelligence.Feature.OBJECT_TRACKING]

        with io.open(video_path, "rb") as file:
            input_content = file.read()

        operation = video_client.annotate_video(
            request={"features": features, "input_content": input_content}
        )
        print("   Processing video... (This may take a few minutes)")
        
        result = operation.result(timeout=600)
        print("   Analysis finished.")
        
        return result.annotation_results[0].object_annotations
    
    except Exception as e:
        print(f"An error occurred during API analysis: {e}")
        return None

def draw_and_save_video(input_path: str, output_path: str, annotations):
    """
    Reads the input video, draws bounding boxes, and generates our own
    unique IDs for each detected object.
    """
    print(f"\n2. Processing video with OpenCV to draw annotations...")

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"Error: Could not open input video file: {input_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    print(f"   Output video will be saved to: {output_path}")

    frame_annotations = defaultdict(list)
    
    # --- THIS IS THE KEY CHANGE ---
    # We use enumerate to create our own unique ID, starting from 1.
    # This completely ignores the API's track_id, which can be unreliable.
    for unique_id, object_annotation in enumerate(annotations, 1):
        entity_description = object_annotation.entity.description.replace(" ", "-")
        
        # Create a reliable, unique label, e.g., "car-1", "person-2"
        unique_label = f"{entity_description}-{unique_id}"
        
        for frame in object_annotation.frames:
            time_offset = frame.time_offset.seconds + frame.time_offset.microseconds / 1e6
            frame_number = int(time_offset * fps)
            box = frame.normalized_bounding_box
            
            frame_annotations[frame_number].append({
                "box": box,
                "label": unique_label # Use our new reliable label
            })
    # --- END CHANGE ---

    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count in frame_annotations:
            for annotation in frame_annotations[frame_count]:
                box = annotation['box']
                label = annotation['label']

                x1, y1 = int(box.left * width), int(box.top * height)
                x2, y2 = int(box.right * width), int(box.bottom * height)
                
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.7
                font_thickness = 2
                (text_width, text_height), baseline = cv2.getTextSize(label, font, font_scale, font_thickness)
                cv2.rectangle(frame, (x1, y1 - text_height - baseline), (x1 + text_width, y1), (0, 150, 0), -1)
                cv2.putText(frame, label, (x1, y1 - 5), font, font_scale, (255, 255, 255), font_thickness)

        out.write(frame)
        frame_count += 1
        
        if frame_count % 100 == 0:
            print(f"   Processed {frame_count} frames...")

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    print(f"\n✅ Success! Annotated video saved to '{output_path}'.")


if __name__ == "__main__":
    # --- CONFIGURATION ---
    local_video_path = "videoplayback.mp4"
    key_filename = "clean-pilot-443311-a8-c12b9ae2ba1f.json"
    output_video_path = "output_with_guaranteed_ids.mp4"
    # --- END CONFIGURATION ---

    if not os.path.exists(key_filename):
        print(f"FATAL ERROR: Authentication key file not found at '{key_filename}'")
    elif not os.path.exists(local_video_path):
        print(f"FATAL ERROR: Video file not found at '{local_video_path}'")
    else:
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_filename
        
        annotations = analyze_video(local_video_path)
        
        if annotations:
            draw_and_save_video(local_video_path, output_video_path, annotations)