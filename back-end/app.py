from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

s3 = boto3.client('s3', 
                  aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                  aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                  region_name=os.getenv('AWS_REGION'))

BUCKET_NAME = os.getenv('BUCKET_NAME')
TRANSCODED_BUCKET_NAME = os.getenv('TRANSCODED_BUCKET_NAME')

uploaded_filename=""


@app.route('/upload', methods=['POST'])
def upload_video():
    global uploaded_filename

    if 'video' not in request.files:
        return 'No video file found', 400

    video_file = request.files['video']
    filename = video_file.filename

    print("Filename in /upload -> " + filename)

    # Upload the video to S3
    s3.upload_fileobj(video_file, BUCKET_NAME, filename)

    uploaded_filename=filename

    return 'Video uploaded successfully', 200

@app.route('/transcoded-video', methods=['GET'])
def get_transcoded_video():

    global uploaded_filename
    
    filenamelist = uploaded_filename.split('.')

    print("Filename in /transcoded-video -> " + uploaded_filename)
    
    transcoded_video_url_1080 = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': TRANSCODED_BUCKET_NAME , 'Key': '1080p/'+filenamelist[0]+'-1080p.'+filenamelist[1]},
        ExpiresIn=3600
    )

    transcoded_video_url_720 = s3.generate_presigned_url(
    'get_object',
    Params={'Bucket': TRANSCODED_BUCKET_NAME , 'Key': '720p/'+filenamelist[0]+'-720p.'+filenamelist[1]},
    ExpiresIn=3600
    )

    uploaded_filename=""
    filenamelist.clear()

    return jsonify({'url': [transcoded_video_url_1080, transcoded_video_url_720]})

if __name__ == '__main__':
    app.run()
