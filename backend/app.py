from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import librosa
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# -------------------------------
# Load Whisper Model
# -------------------------------

model = whisper.load_model("base")
print("Whisper model loaded ✅")

# -------------------------------
# Feature Extraction
# -------------------------------

def extract_features(file):
    y, sr = librosa.load(file, sr=None)

    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc = np.mean(mfcc.T, axis=0)

    # Normalize
    mfcc = mfcc / np.linalg.norm(mfcc)

    return mfcc

# -------------------------------
# Load Owner Voice Samples
# -------------------------------

owner_files = ["owner_voice.wav", "owner2.wav", "owner3.wav"]

owner_features_list = []

for f in owner_files:
    if os.path.exists(f):
        owner_features_list.append(extract_features(f))
    else:
        print(f"{f} missing")

print("Owner voices loaded ✅")

# -------------------------------
# Phrase Check (ONLY 1234)
# -------------------------------

def check_phrase(text):
    text = text.lower()

    return (
        "1234" in text or
        "1 2 3 4" in text or
        "one two three four" in text
    )

# -------------------------------
# STT + AUTH API
# -------------------------------

@app.route("/stt", methods=["POST"])
def speech_to_text():

    try:
        if "audio" not in request.files:
            return jsonify({"status": "error", "message": "No audio file"})

        audio = request.files["audio"]

        file_path = "temp_audio.m4a"
        audio.save(file_path)

        # ---------------- STT ----------------
        result = model.transcribe(file_path, language="en")
        text = result["text"].lower()

        print("Recognized text:", text)

        # ---------------- PHRASE CHECK ----------------
        phrase_match = check_phrase(text)
        print("Phrase match:", phrase_match)

        # ---------------- VOICE CHECK ----------------
        user_features = extract_features(file_path)

        similarities = []

        for owner_feat in owner_features_list:
            sim = np.dot(owner_feat, user_features)
            similarities.append(sim)

        print("Similarities:", similarities)

        avg_similarity = np.mean(similarities)
        print("Average similarity:", avg_similarity)

        # ---------------- FINAL DECISION ----------------
        voice_verified = bool(
            avg_similarity > 0.85 and phrase_match
        )

        os.remove(file_path)

        return jsonify({
            "status": "success",
            "text": text,
            "voice_verified": voice_verified,
            "similarity": float(avg_similarity),
            "phrase_match": phrase_match
        })

    except Exception as e:

        print("STT ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": str(e)
        })

# -------------------------------
# Run Server
# -------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )